// Shopify's CDN returns a resized copy when given a width. Other URLs, such as local assets, pass through unchanged.
const isCdn = (url: string) => url.includes("cdn.shopify.com");

export function sizedImage(url: string, width: number): string {
  if (!isCdn(url)) return url;
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  params.set("width", String(width));
  return `${path}?${params}`;
}

export function sizedSrcSet(url: string, widths: number[]): string | undefined {
  if (!isCdn(url)) return undefined;
  return widths.map((width) => `${sizedImage(url, width)} ${width}w`).join(", ");
}
