import Parser from "rss-parser";
import { lookup } from "node:dns/promises";
import { BlockList } from "node:net";

const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blocked.addSubnet(network, prefix, "ipv4");
blocked.addSubnet("::", 128, "ipv6");
blocked.addSubnet("::1", 128, "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");
blocked.addSubnet("::ffff:0:0", 96, "ipv6");
export interface FeedItem {
  title: string;
  link: string;
  excerpt: string;
  date?: string;
}
const cache = new Map<
  string,
  { expires: number; result: Promise<FeedItem[]> }
>();
/** Adapter boundary: additional providers can return the same FeedItem contract. */
export function getFeed(source: string): Promise<FeedItem[]> {
  const cached = cache.get(source);
  if (cached && cached.expires > Date.now()) return cached.result;
  if (cache.size >= 50) cache.delete(cache.keys().next().value!);
  const result = loadRSS(source);
  cache.set(source, { expires: Date.now() + 300_000, result });
  return result;
}
async function loadRSS(source: string): Promise<FeedItem[]> {
  try {
    const url = new URL(source);
    // Saved builds and preview requests use the same public-feed boundary.
    if (
      url.protocol !== "https:" ||
      url.port ||
      url.username ||
      url.password ||
      /^(localhost|.*\.localhost|.*\.local|.*\.internal)$/.test(url.hostname) ||
      /^[\d.]+$/.test(url.hostname) ||
      url.hostname.includes(":")
    )
      return [];
    const addresses = await lookup(url.hostname, { all: true });
    if (
      !addresses.length ||
      addresses.some(({ address, family }) =>
        blocked.check(address, family === 6 ? "ipv6" : "ipv4"),
      )
    )
      return [];
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
    if (!response.ok) throw new Error(`Feed returned ${response.status}`);
    const xml = await response.text();
    if (xml.length > 2_000_000) throw new Error("Feed exceeds size limit");
    const feed = await new Parser().parseString(xml);
    return feed.items.flatMap((item) => {
      if (!item.title || !item.link || !/^https?:\/\//i.test(item.link))
        return [];
      const timestamp = Date.parse(item.isoDate || item.pubDate || "");
      return [
        {
          title: item.title,
          link: item.link,
          excerpt: (item.contentSnippet || item.content || "")
            .replace(/<[^>]*>/g, "")
            .slice(0, 300),
          date: Number.isFinite(timestamp)
            ? new Date(timestamp).toISOString()
            : undefined,
        },
      ];
    });
  } catch (error) {
    console.warn(
      "Feed unavailable",
      source,
      error instanceof Error ? error.message : "Unknown error",
    );
    return [];
  }
}
