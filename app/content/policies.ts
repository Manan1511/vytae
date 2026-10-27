import { escapeHtml } from "./html.ts";

// Policy copy from the design export (Legal.dc.html). Cash-on-delivery wording is removed because COD is not offered at launch.
// Bracketed text is the design's placeholder until the client supplies final terms.

export const COMPANY = "[VYTAE Wellness Pvt. Ltd.]";

export type PolicySection = { heading: string; paragraphs: string[] };
export type Policy = {
  key: "privacy" | "refund" | "terms";
  title: string;
  intro: string;
  sections: PolicySection[];
};

export const POLICIES: Policy[] = [
  {
    key: "privacy",
    title: "Privacy Policy",
    intro: `This policy explains how ${COMPANY} (“VYTAE”, “we”, “us”) collects, uses and protects your personal information when you visit our website or buy our products.`,
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "Information you give us: name, email, phone number, delivery and billing address, and anything you send through our contact form or WhatsApp.",
          "Information collected automatically: device and browser details, IP address, pages viewed and cookies, used to run and improve the website.",
        ],
      },
      {
        heading: "How we use your information",
        paragraphs: [
          "To process and deliver orders, provide customer support, send order updates, prevent fraud, and — only with your consent — send marketing communications.",
        ],
      },
      {
        heading: "Payments",
        paragraphs: [
          "Online payments are processed by our third-party payment gateway. We do not store your full card or bank details on our servers.",
        ],
      },
      {
        heading: "Sharing your information",
        paragraphs: [
          "We share information only with service providers who help us operate — such as payment processors, fulfilment and courier partners (including Amazon Multi-Channel Fulfilment), review platforms and analytics tools — or when required by law. We never sell your personal data.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We use cookies to keep your bag, remember preferences and understand how the site is used. You can control cookies through your browser settings.",
        ],
      },
      {
        heading: "Data retention and security",
        paragraphs: [
          "We keep personal information only as long as needed for the purposes above or as required by law, and use reasonable technical and organisational measures to protect it.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You may request access to, correction of, or deletion of your personal information, and withdraw marketing consent at any time by contacting us.",
        ],
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          "We may update this policy from time to time. The latest version will always be available on this page.",
        ],
      },
    ],
  },
  {
    key: "refund",
    title: "Refund Policy",
    intro:
      "We want you to be happy with every VYTAE order. Because our products are consumable, returns are accepted under the conditions below.",
    sections: [
      {
        heading: "Eligibility",
        paragraphs: [
          "Unopened, sealed products may be returned within [7] days of delivery. For hygiene and safety reasons, opened products cannot be returned unless they arrived damaged or incorrect.",
        ],
      },
      {
        heading: "Damaged, defective or incorrect items",
        paragraphs: [
          "If your order arrives damaged, defective or incorrect, contact us within [48 hours] of delivery with your order number and photos of the product and packaging. We will arrange a replacement or full refund.",
        ],
      },
      {
        heading: "How to request a return",
        paragraphs: [
          "Email [hello@vytae.com] or message us on WhatsApp with your order number and reason for return. Our team will confirm eligibility and share next steps.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          "Once your return is received and inspected, approved refunds are issued to the original payment method within [5–7] business days.",
        ],
      },
      {
        heading: "Cancellations",
        paragraphs: [
          "Orders can be cancelled before they are dispatched. Once shipped, the order is treated as a return under this policy.",
        ],
      },
      {
        heading: "Shipping costs",
        paragraphs: ["Original shipping charges are non-refundable unless the return is due to our error."],
      },
    ],
  },
  {
    key: "terms",
    title: "Terms & Conditions",
    intro: `These terms govern your use of the VYTAE website and the purchase of products from ${COMPANY}. By using the website or placing an order, you agree to them.`,
    sections: [
      {
        heading: "Use of the website",
        paragraphs: [
          "You agree to use this website lawfully and not to misuse, disrupt or attempt unauthorised access to it.",
        ],
      },
      {
        heading: "Products and information",
        paragraphs: [
          "Our products are dietary supplements and are not intended to diagnose, treat, cure or prevent any disease. Information on this website is for general purposes and is not medical advice. Consult a healthcare professional before use if you are pregnant, nursing, taking medication or have a medical condition.",
        ],
      },
      {
        heading: "Orders and pricing",
        paragraphs: [
          "All prices are in Indian Rupees and include applicable taxes unless stated otherwise. We reserve the right to refuse or cancel any order, including in cases of pricing errors or suspected fraud.",
        ],
      },
      {
        heading: "Payment",
        paragraphs: [
          "We accept online payments through our secure payment partner. Payment options may vary by location.",
        ],
      },
      {
        heading: "Shipping and delivery",
        paragraphs: [
          "Orders are fulfilled by VYTAE and its fulfilment partners. Delivery timelines are estimates and may vary due to factors outside our control.",
        ],
      },
      {
        heading: "Returns and refunds",
        paragraphs: ["Returns and refunds are handled under our Refund Policy."],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "All content on this website, including text, images, logos and designs, belongs to VYTAE and may not be used without written permission.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "To the extent permitted by law, VYTAE is not liable for indirect or consequential losses arising from use of the website or products.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by the laws of India, and disputes are subject to the jurisdiction of the courts of [City].",
        ],
      },
    ],
  },
];

// Policy body as HTML: the intro, then a heading and paragraphs per section. The seed writes this to Shopify.
export function policyHtml(policy: Policy): string {
  return [
    `<p>${escapeHtml(policy.intro)}</p>`,
    ...policy.sections.map((s) => `<h2>${escapeHtml(s.heading)}</h2>` + s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")),
  ].join("");
}
