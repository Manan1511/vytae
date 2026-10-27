// Seeds the Vytae dev store: products, inventory, collections, Headless publishing, the Science blog and policy pages.
// Run from the repo root:  node --env-file=.env.local scripts/seed-shopify.ts
// Safe to re-run. Existing products, collections, blog and articles are skipped by handle or title.
// Re-running sets stock back to SEED_STOCK, so run it once the store is in use.
import { POLICIES } from "../app/content/policies.ts";
import { FEATURED, PLACEHOLDER_BODY, POSTS } from "../app/content/science.ts";
import { PRODUCTS } from "../app/content/products.ts";

const DOMAIN = process.env.VITE_SHOPIFY_DOMAIN ?? "";
const API_VERSION = process.env.VITE_SHOPIFY_API_VERSION || "2026-07";
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET ?? "";
const ADMIN_URL = `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
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

// Responses are untyped here; the seed only reads the fields it asks for.
type Data = any;

async function gql(query: string, variables: Record<string, unknown> = {}): Promise<Data> {
  const res = await fetch(ADMIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: Data; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  if (!json.data) throw new Error(`No data returned: ${JSON.stringify(json)}`);
  return json.data;
}

function failOnUserErrors(payload: Data, label: string) {
  const errors = payload?.userErrors ?? [];
  if (errors.length) throw new Error(`${label}: ${JSON.stringify(errors)}`);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// The Headless channel is the publication the Storefront API reads from.
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

// Products: create the three from the design data, skipping any that already exist.
for (const product of PRODUCTS) {
  const existing = await gql(`query($h: String!) { productByHandle(handle: $h) { id } }`, { h: product.handle });
  let id: string = existing.productByHandle?.id;
  if (!id) {
    const data = await gql(
      `mutation($input: ProductSetInput!) {
         productSet(synchronous: true, input: $input) { product { id } userErrors { field message } }
       }`,
      {
        input: {
          title: product.name,
          handle: product.handle,
          status: "ACTIVE",
          vendor: "VYTAE",
          productType: "Supplement",
          tags: product.categories,
          descriptionHtml: `<p>${escapeHtml(product.verify)}</p>`,
          productOptions: [{ name: "Title", values: [{ name: "Default Title" }] }],
          variants: [
            {
              optionValues: [{ optionName: "Title", name: "Default Title" }],
              price: product.price.toFixed(2),
              sku: `VY-${product.handle.toUpperCase()}`,
              inventoryItem: { tracked: true },
            },
          ],
        },
      },
    );
    failOnUserErrors(data.productSet, `productSet ${product.handle}`);
    id = data.productSet.product.id;
    console.log(`created product: ${product.handle}`);
  } else {
    console.log(`exists: product ${product.handle}`);
  }
  await publishToHeadless(id);
}

// Inventory: track each product and set placeholder stock at the first location.
const locationData = await gql(`{ locations(first: 10) { nodes { id } } }`);
const location = locationData.locations.nodes[0];
console.log(`location: ${location.id}`);
for (const product of PRODUCTS) {
  const data = await gql(
    `query($h: String!) { productByHandle(handle: $h) { variants(first: 5) { nodes { inventoryQuantity inventoryItem { id } } } } }`,
    { h: product.handle },
  );
  const variant = data.productByHandle.variants.nodes[0];
  const inventoryItemId = variant.inventoryItem.id;
  const result = await gql(
    `mutation($input: InventorySetQuantitiesInput!) {
       inventorySetQuantities(input: $input) @idempotent(key: "${crypto.randomUUID()}") { userErrors { field message } }
     }`,
    {
      input: {
        name: "available",
        reason: "correction",
        quantities: [{ inventoryItemId, locationId: location.id, quantity: SEED_STOCK, changeFromQuantity: variant.inventoryQuantity }],
      },
    },
  );
  failOnUserErrors(result.inventorySetQuantities, `inventory ${product.handle}`);
}

// Collections: smart collections that match the product tags (Sleep, Rituals).
for (const { handle, title, tag } of [
  { handle: "sleep", title: "Sleep", tag: "Sleep" },
  { handle: "rituals", title: "Rituals", tag: "Rituals" },
]) {
  const existing = await gql(`query($h: String!) { collectionByHandle(handle: $h) { id } }`, { h: handle });
  if (existing.collectionByHandle) {
    console.log(`exists: collection ${handle}`);
    await publishToHeadless(existing.collectionByHandle.id);
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

// Blog: the Science blog and its articles. Article bodies are placeholders until copy is written.
const blogData = await gql(`{ blogs(first: 20) { nodes { id title } } }`);
let blog: { id: string; title: string } | undefined = blogData.blogs.nodes.find((b: Data) => b.title === "Science");
if (!blog) {
  const data = await gql(
    `mutation($blog: BlogCreateInput!) { blogCreate(blog: $blog) { blog { id title } userErrors { field message } } }`,
    { blog: { title: "Science" } },
  );
  failOnUserErrors(data.blogCreate, "blog Science");
  blog = data.blogCreate.blog;
  console.log("created blog: Science");
} else {
  console.log("exists: blog Science");
}

const articleData = await gql(`query($id: ID!) { blog(id: $id) { articles(first: 50) { nodes { title } } } }`, {
  id: blog!.id,
});
const existingTitles = new Set((articleData.blog.articles.nodes as { title: string }[]).map((a) => a.title));
for (const post of [FEATURED, ...POSTS]) {
  if (existingTitles.has(post.title)) {
    console.log(`exists: article ${post.slug}`);
    continue;
  }
  const data = await gql(
    `mutation($article: ArticleCreateInput!) {
       articleCreate(article: $article) { article { id } userErrors { field message } }
     }`,
    {
      article: {
        title: post.title,
        blogId: blog!.id,
        author: { name: "VYTAE" },
        summary: post.desc,
        body: `<p>${escapeHtml(post.desc)}</p><p>${escapeHtml(PLACEHOLDER_BODY)}</p>`,
        tags: [post.category],
        isPublished: true,
      },
    },
  );
  failOnUserErrors(data.articleCreate, `article ${post.slug}`);
  console.log(`created article: ${post.slug}`);
}

// Policy pages: privacy, refund and terms, from the design copy.
const POLICY_TYPES: Record<string, string> = {
  privacy: "PRIVACY_POLICY",
  refund: "REFUND_POLICY",
  terms: "TERMS_OF_SERVICE",
};
for (const policy of POLICIES) {
  const body =
    `<h1>${escapeHtml(policy.title)}</h1><p>${escapeHtml(policy.intro)}</p>` +
    policy.sections
      .map((s) => `<h2>${escapeHtml(s.heading)}</h2>` + s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join(""))
      .join("");
  const data = await gql(
    `mutation($policy: ShopPolicyInput!) { shopPolicyUpdate(shopPolicy: $policy) { shopPolicy { type } userErrors { field message } } }`,
    { policy: { type: POLICY_TYPES[policy.key], body } },
  );
  const errors = data.shopPolicyUpdate.userErrors as { message: string }[];
  if (errors.length) {
    // Shopify blocks policy edits while "Manage automatically" is on (Settings > Policies). Report and continue.
    console.warn(`policy skipped: ${policy.key}: ${errors.map((e) => e.message).join("; ")}`);
    continue;
  }
  console.log(`policy set: ${policy.key}`);
}

console.log("seed complete");
