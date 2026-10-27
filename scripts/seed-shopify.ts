// Seeds the Vytae dev store from the content in app/content: products, collections, articles, policies and
// metaobjects. Safe to re-run. Each step upserts by handle, title or key, so edits in app/content reach Shopify.
// Run from the repo root: node --env-file=.env.local scripts/seed-shopify.ts
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { BATCHES } from "../app/content/batches.ts";
import { HERO, REVIEWS } from "../app/content/home.ts";
import { escapeHtml } from "../app/content/html.ts";
import { POLICIES, policyHtml } from "../app/content/policies.ts";
import { PRODUCTS, SHOP_BANNERS } from "../app/content/products.ts";
import { FEATURED, POSTS, articleBodyHtml } from "../app/content/science.ts";

const DOMAIN = process.env.VITE_SHOPIFY_DOMAIN ?? "";
const API_VERSION = process.env.VITE_SHOPIFY_API_VERSION || "2026-07";
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET ?? "";
const ADMIN_URL = `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
const PUBLIC_DIR = join(import.meta.dirname, "..", "public");
const NAMESPACE = "vytae";
const BLOG_TITLE = "Science";
const SEED_STOCK = 50; // Placeholder stock per product. Replace with real stock counts.

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Set VITE_SHOPIFY_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET in .env.local");
}

async function getToken(): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!json.access_token) throw new Error(`Token request failed: ${json.error ?? res.status}`);
  return json.access_token;
}

const TOKEN = await getToken();

// Admin responses are read field by field, so they stay untyped here.
type Data = any;

// Retries dropped connections (fetch throws a TypeError) with a short backoff. Shopify errors are not retried.
async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      if (attempt >= 4 || !(error instanceof TypeError)) throw error;
      await sleep(attempt * 1000);
    }
  }
}

async function gql(query: string, variables: Record<string, unknown> = {}): Promise<Data> {
  const res = await withRetry(() =>
    fetch(ADMIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
      body: JSON.stringify({ query, variables }),
    }),
  );
  const json = (await res.json()) as { data?: Data; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  if (!json.data) throw new Error(`No data returned: ${JSON.stringify(json)}`);
  return json.data;
}

// Mutations report errors in userErrors, and media mutations also use mediaUserErrors.
function failOnUserErrors(payload: Data, label: string) {
  const errors = [...(payload?.userErrors ?? []), ...(payload?.mediaUserErrors ?? [])];
  if (errors.length) throw new Error(`${label}: ${JSON.stringify(errors)}`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The Headless channel is the publication the Storefront API reads from. Blogs and articles are not published this way.
const publicationData = await gql(`{ publications(first: 25) { nodes { id name } } }`);
const publications: { id: string; name: string }[] = publicationData.publications.nodes;
const headless = publications.find((p) => /headless/i.test(p.name));
if (!headless) {
  throw new Error(`No Headless publication found. Publications: ${publications.map((p) => p.name).join(", ")}`);
}
console.log(`publication: ${headless.name}`);

async function publishToHeadless(id: string) {
  const data = await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
       publishablePublish(id: $id, input: $input) { userErrors { field message } }
     }`,
    { id, input: [{ publicationId: headless!.id }] },
  );
  const errors = (data.publishablePublish.userErrors as { message: string }[]).filter((e) => !/already/i.test(e.message));
  if (errors.length) throw new Error(`publish ${id}: ${JSON.stringify(errors)}`);
}

const MIME: Record<string, string> = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg" };

// Uploads a file from public/ to Shopify's staging bucket. Returns the resource URL that Shopify imports from.
async function stageUpload(relPath: string): Promise<string> {
  const bytes = await readFile(join(PUBLIC_DIR, relPath));
  const filename = basename(relPath);
  const mimeType = MIME[filename.slice(filename.lastIndexOf("."))] ?? "application/octet-stream";
  const data = await gql(
    `mutation($input: [StagedUploadInput!]!) {
       stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } }
     }`,
    { input: [{ filename, mimeType, httpMethod: "POST", resource: "IMAGE", fileSize: String(bytes.byteLength) }] },
  );
  failOnUserErrors(data.stagedUploadsCreate, `stage ${relPath}`);
  const target = data.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([bytes], { type: mimeType }), filename);
  const res = await withRetry(() => fetch(target.url, { method: "POST", body: form }));
  if (!res.ok) throw new Error(`upload ${relPath} failed: ${res.status} ${await res.text()}`);
  return target.resourceUrl;
}

// Adds a staged image to the Files library and returns its file ID.
async function createFile(relPath: string, alt: string): Promise<string> {
  const originalSource = await stageUpload(relPath);
  const data = await gql(
    `mutation($files: [FileCreateInput!]!) {
       fileCreate(files: $files) { files { id fileStatus } userErrors { field message } }
     }`,
    { files: [{ originalSource, contentType: "IMAGE", alt, filename: basename(relPath) }] },
  );
  failOnUserErrors(data.fileCreate, `file ${relPath}`);
  return data.fileCreate.files[0].id;
}

// Shopify processes uploads asynchronously. A file can only be referenced once it is READY.
async function waitForFileUrl(id: string): Promise<string> {
  for (let attempt = 0; attempt < 60; attempt++) {
    const data = await gql(`query($id: ID!) { node(id: $id) { ... on MediaImage { fileStatus image { url } } } }`, { id });
    if (data.node?.fileStatus === "READY" && data.node.image?.url) return data.node.image.url;
    if (data.node?.fileStatus === "FAILED") throw new Error(`file ${id} failed to process`);
    await sleep(1000);
  }
  throw new Error(`file ${id} did not become ready`);
}

// Definitions. Storefront read access is set here, so the site can read these fields.
const METAFIELD_DEFINITIONS = [
  { ownerType: "PRODUCT", key: "content", name: "Product content", type: "json" },
  { ownerType: "ARTICLE", key: "read_time", name: "Read time", type: "single_line_text_field" },
];

const METAOBJECT_DEFINITIONS = [
  {
    type: "hero_slide",
    name: "Hero slide",
    fields: [
      { key: "eyebrow", name: "Eyebrow", type: "single_line_text_field" },
      { key: "headline", name: "Headline", type: "single_line_text_field" },
      { key: "lead", name: "Lead", type: "multi_line_text_field" },
      { key: "image", name: "Image", type: "file_reference" },
      { key: "image_alt", name: "Image alt text", type: "single_line_text_field" },
      { key: "sort", name: "Sort order", type: "number_integer" },
      { key: "active", name: "Active", type: "boolean" },
    ],
  },
  {
    type: "shop_banner",
    name: "Shop banner",
    fields: [
      { key: "eyebrow", name: "Eyebrow", type: "single_line_text_field" },
      { key: "title", name: "Title", type: "single_line_text_field" },
      { key: "body", name: "Body", type: "multi_line_text_field" },
      { key: "cta", name: "Button text", type: "single_line_text_field" },
      { key: "href", name: "Link", type: "single_line_text_field" },
      { key: "image", name: "Image", type: "file_reference" },
      { key: "sort", name: "Sort order", type: "number_integer" },
      { key: "active", name: "Active", type: "boolean" },
    ],
  },
  {
    type: "testimonial",
    name: "Testimonial",
    fields: [
      { key: "quote", name: "Quote", type: "multi_line_text_field" },
      { key: "name", name: "Name", type: "single_line_text_field" },
      { key: "product", name: "Product", type: "single_line_text_field" },
      { key: "sort", name: "Sort order", type: "number_integer" },
    ],
  },
  {
    type: "batch_passport",
    name: "Batch passport",
    fields: [
      { key: "code", name: "Batch code", type: "single_line_text_field" },
      { key: "product", name: "Product handle", type: "single_line_text_field" },
      { key: "record", name: "Passport record", type: "json" },
    ],
  },
];

async function ensureDefinitions(): Promise<void> {
  for (const def of METAFIELD_DEFINITIONS) {
    const listed = await gql(
      `query($owner: MetafieldOwnerType!) { metafieldDefinitions(first: 50, ownerType: $owner, namespace: "${NAMESPACE}") { nodes { key } } }`,
      { owner: def.ownerType },
    );
    if (listed.metafieldDefinitions.nodes.some((n: Data) => n.key === def.key)) {
      console.log(`exists: ${def.ownerType} field ${def.key}`);
      continue;
    }
    const data = await gql(
      `mutation($def: MetafieldDefinitionInput!) {
         metafieldDefinitionCreate(definition: $def) { createdDefinition { id } userErrors { field message } }
       }`,
      {
        def: {
          name: def.name,
          namespace: NAMESPACE,
          key: def.key,
          type: def.type,
          ownerType: def.ownerType,
          access: { storefront: "PUBLIC_READ" },
        },
      },
    );
    failOnUserErrors(data.metafieldDefinitionCreate, `definition ${def.key}`);
    console.log(`created: ${def.ownerType} field ${def.key}`);
  }

  for (const def of METAOBJECT_DEFINITIONS) {
    const existing = await gql(`query($type: String!) { metaobjectDefinitionByType(type: $type) { id } }`, { type: def.type });
    if (existing.metaobjectDefinitionByType) {
      console.log(`exists: metaobject ${def.type}`);
      continue;
    }
    const data = await gql(
      `mutation($def: MetaobjectDefinitionCreateInput!) {
         metaobjectDefinitionCreate(definition: $def) { metaobjectDefinition { id } userErrors { field message } }
       }`,
      {
        def: {
          type: def.type,
          name: def.name,
          access: { storefront: "PUBLIC_READ" },
          fieldDefinitions: def.fields.map((f) => ({ key: f.key, name: f.name, type: f.type })),
        },
      },
    );
    failOnUserErrors(data.metaobjectDefinitionCreate, `metaobject ${def.type}`);
    console.log(`created: metaobject ${def.type}`);
  }
}

// Products: one productSet per product (upserts title, price and variant), the content JSON, and the gallery.
async function seedProducts(): Promise<void> {
  for (const product of PRODUCTS) {
    const { handle, name, price, images, categories, ...content } = product;
    const existing = (
      await gql(`query($h: String!) { productByHandle(handle: $h) { id media(first: 1) { nodes { id } } } }`, { h: handle })
    ).productByHandle;

    const data = await gql(
      `mutation($input: ProductSetInput!) {
         productSet(synchronous: true, input: $input) { product { id } userErrors { field message } }
       }`,
      {
        input: {
          ...(existing ? { id: existing.id } : {}),
          title: name,
          handle,
          status: "ACTIVE",
          vendor: "VYTAE",
          productType: "Supplement",
          tags: categories,
          descriptionHtml: `<p>${escapeHtml(content.verify)}</p>`,
          productOptions: [{ name: "Title", values: [{ name: "Default Title" }] }],
          variants: [
            {
              optionValues: [{ optionName: "Title", name: "Default Title" }],
              price: price.toFixed(2),
              sku: `VY-${handle.toUpperCase()}`,
              inventoryItem: { tracked: true },
            },
          ],
        },
      },
    );
    failOnUserErrors(data.productSet, `productSet ${handle}`);
    const id: string = data.productSet.product.id;

    // The gallery is uploaded once. Later runs keep the media already on the product.
    if (!existing || existing.media.nodes.length === 0) {
      for (const image of images) {
        const originalSource = await stageUpload(image);
        const result = await gql(
          `mutation($id: ID!, $media: [CreateMediaInput!]!) {
             productCreateMedia(productId: $id, media: $media) { media { id } mediaUserErrors { field message } }
           }`,
          { id, media: [{ originalSource, mediaContentType: "IMAGE", alt: name }] },
        );
        failOnUserErrors(result.productCreateMedia, `media ${image}`);
      }
    }

    const meta = await gql(`mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message } } }`, {
      m: [{ ownerId: id, namespace: NAMESPACE, key: "content", type: "json", value: JSON.stringify(content) }],
    });
    failOnUserErrors(meta.metafieldsSet, `content ${handle}`);

    await publishToHeadless(id);
    console.log(`product: ${handle}`);
  }
}

// Inventory: placeholder stock at the first location. changeFromQuantity reads the current count, so re-runs set SEED_STOCK.
async function seedInventory(): Promise<void> {
  const locations = await gql(`{ locations(first: 10) { nodes { id } } }`);
  const locationId: string = locations.locations.nodes[0].id;
  for (const product of PRODUCTS) {
    const data = await gql(
      `query($h: String!) { productByHandle(handle: $h) { variants(first: 5) { nodes { inventoryQuantity inventoryItem { id } } } } }`,
      { h: product.handle },
    );
    const variant = data.productByHandle.variants.nodes[0];
    const result = await gql(
      `mutation($input: InventorySetQuantitiesInput!) {
         inventorySetQuantities(input: $input) @idempotent(key: "${crypto.randomUUID()}") { userErrors { field message } }
       }`,
      {
        input: {
          name: "available",
          reason: "correction",
          quantities: [
            {
              inventoryItemId: variant.inventoryItem.id,
              locationId,
              quantity: SEED_STOCK,
              changeFromQuantity: variant.inventoryQuantity,
            },
          ],
        },
      },
    );
    failOnUserErrors(result.inventorySetQuantities, `inventory ${product.handle}`);
  }
}

// Collections: smart collections by product tag, published to Headless.
async function seedCollections(): Promise<void> {
  for (const { handle, title, tag } of [
    { handle: "sleep", title: "Sleep", tag: "Sleep" },
    { handle: "rituals", title: "Rituals", tag: "Rituals" },
  ]) {
    const existing = await gql(`query($h: String!) { collectionByHandle(handle: $h) { id } }`, { h: handle });
    if (existing.collectionByHandle) {
      await publishToHeadless(existing.collectionByHandle.id);
      console.log(`exists: collection ${handle}`);
      continue;
    }
    const data = await gql(
      `mutation($input: CollectionInput!) {
         collectionCreate(input: $input) { collection { id } userErrors { field message } }
       }`,
      {
        input: {
          title,
          handle,
          ruleSet: { appliedDisjunctively: false, rules: [{ column: "TAG", relation: "EQUALS", condition: tag }] },
        },
      },
    );
    failOnUserErrors(data.collectionCreate, `collection ${handle}`);
    await publishToHeadless(data.collectionCreate.collection.id);
    console.log(`created collection: ${handle}`);
  }
}

// Science blog and its articles. Handles are set to the content slugs, so the site routes match.
async function seedArticles(): Promise<void> {
  const blogs = await gql(`{ blogs(first: 20) { nodes { id title } } }`);
  let blog: { id: string } | undefined = blogs.blogs.nodes.find((b: Data) => b.title === BLOG_TITLE);
  if (!blog) {
    const data = await gql(
      `mutation($blog: BlogCreateInput!) { blogCreate(blog: $blog) { blog { id } userErrors { field message } } }`,
      { blog: { title: BLOG_TITLE } },
    );
    failOnUserErrors(data.blogCreate, "blog");
    blog = data.blogCreate.blog;
    console.log("created blog: Science");
  }
  const listed = await gql(`query($id: ID!) { blog(id: $id) { articles(first: 100) { nodes { id title handle image { url } } } } }`, {
    id: blog!.id,
  });

  for (const post of [FEATURED, ...POSTS]) {
    const existing = listed.blog.articles.nodes.find((a: Data) => a.handle === post.slug || a.title === post.title);
    // The cover is uploaded once. Shopify imports it from the uploaded file's CDN URL.
    let image: { url: string; altText: string } | undefined;
    if (!existing?.image) {
      const fileId = await createFile(post.image, post.title);
      image = { url: await waitForFileUrl(fileId), altText: post.title };
    }
    const fields = {
      title: post.title,
      handle: post.slug,
      summary: post.desc,
      body: articleBodyHtml(post.slug),
      tags: [post.category],
      author: { name: "VYTAE" },
      isPublished: true,
      ...(image ? { image } : {}),
    };

    let id: string = existing?.id;
    if (id) {
      const data = await gql(
        `mutation($id: ID!, $article: ArticleUpdateInput!) { articleUpdate(id: $id, article: $article) { article { id } userErrors { field message } } }`,
        { id, article: fields },
      );
      failOnUserErrors(data.articleUpdate, `article ${post.slug}`);
    } else {
      const data = await gql(
        `mutation($article: ArticleCreateInput!) { articleCreate(article: $article) { article { id } userErrors { field message } } }`,
        { article: { ...fields, blogId: blog!.id } },
      );
      failOnUserErrors(data.articleCreate, `article ${post.slug}`);
      id = data.articleCreate.article.id;
    }

    const meta = await gql(`mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message } } }`, {
      m: [{ ownerId: id, namespace: NAMESPACE, key: "read_time", type: "single_line_text_field", value: post.minutes }],
    });
    failOnUserErrors(meta.metafieldsSet, `read time ${post.slug}`);
    console.log(`article: ${post.slug}`);
  }
}

// Policy pages, from the design copy. Shopify shows them through the Storefront shop query.
const POLICY_TYPES: Record<string, string> = {
  privacy: "PRIVACY_POLICY",
  refund: "REFUND_POLICY",
  terms: "TERMS_OF_SERVICE",
};

async function seedPolicies(): Promise<void> {
  for (const policy of POLICIES) {
    const data = await gql(
      `mutation($policy: ShopPolicyInput!) { shopPolicyUpdate(shopPolicy: $policy) { shopPolicy { type } userErrors { field message } } }`,
      { policy: { type: POLICY_TYPES[policy.key], body: policyHtml(policy) } },
    );
    failOnUserErrors(data.shopPolicyUpdate, `policy ${policy.key}`);
    console.log(`policy set: ${policy.key}`);
  }
}

// Metaobject entries are upserted by handle. An image keeps the file already on the entry, so re-runs do not upload again.
async function upsertEntry(type: string, handle: string, fields: Record<string, string>): Promise<void> {
  const data = await gql(
    `mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) {
       metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { id } userErrors { field message code } }
     }`,
    {
      h: { type, handle },
      m: { fields: Object.entries(fields).map(([key, value]) => ({ key, value })) },
    },
  );
  failOnUserErrors(data.metaobjectUpsert, `${type} ${handle}`);
}

async function imageFileFor(type: string, handle: string, path: string, alt: string): Promise<string> {
  const current = await gql(`query($h: MetaobjectHandleInput!) { metaobjectByHandle(handle: $h) { fields { key value } } }`, {
    h: { type, handle },
  });
  const existing: string | undefined = current.metaobjectByHandle?.fields.find((f: Data) => f.key === "image")?.value;
  if (existing) return existing;
  const id = await createFile(path, alt);
  await waitForFileUrl(id);
  return id;
}

async function seedHero(): Promise<void> {
  const image = await imageFileFor("hero_slide", "home-hero", HERO.image, HERO.alt);
  await upsertEntry("hero_slide", "home-hero", {
    eyebrow: HERO.eyebrow,
    headline: HERO.headline,
    lead: HERO.lead,
    image,
    image_alt: HERO.alt,
    sort: "1",
    active: "true",
  });
  console.log("hero slide set");
}

async function seedShopBanners(): Promise<void> {
  for (const [i, banner] of SHOP_BANNERS.entries()) {
    const handle = `banner-${i + 1}`;
    const image = await imageFileFor("shop_banner", handle, banner.img, banner.title);
    await upsertEntry("shop_banner", handle, {
      eyebrow: banner.eyebrow,
      title: banner.title,
      body: banner.body,
      cta: banner.cta,
      href: banner.href,
      image,
      sort: String(i + 1),
      active: "true",
    });
  }
  console.log(`shop banners set: ${SHOP_BANNERS.length}`);
}

async function seedTestimonials(): Promise<void> {
  for (const [i, review] of REVIEWS.entries()) {
    await upsertEntry("testimonial", `testimonial-${String(i + 1).padStart(2, "0")}`, {
      quote: review.quote,
      name: review.name,
      product: review.product,
      sort: String(i + 1),
    });
  }
  console.log(`testimonials set: ${REVIEWS.length}`);
}

// Batch passports: the lookup key is the lowercase code. The record holds the whole passport.
async function seedBatches(): Promise<void> {
  for (const [code, record] of Object.entries(BATCHES)) {
    await upsertEntry("batch_passport", code.toLowerCase(), {
      code,
      product: record.key,
      record: JSON.stringify(record),
    });
  }
  console.log(`batch passports set: ${Object.keys(BATCHES).length}`);
}

await ensureDefinitions();
await seedProducts();
await seedInventory();
await seedCollections();
await seedArticles();
await seedPolicies();
await seedHero();
await seedShopBanners();
await seedTestimonials();
await seedBatches();
console.log("seed complete");
