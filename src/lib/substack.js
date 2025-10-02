export async function getSubstackPosts() {
  const response = await fetch("https://isiahfletcher7.substack.com/feed");
  const xml = await response.text();

  // Extract items with regex (more lenient than XML parser)
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title =
      itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
      itemXml.match(/<title>(.*?)<\/title>/)?.[1];
    const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1];
    const description =
      itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
      itemXml.match(/<description>(.*?)<\/description>/)?.[1];
    const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

    if (title && link) {
      items.push({
        title,
        link,
        excerpt: description?.replace(/<[^>]*>/g, "").substring(0, 200),
        date: new Date(pubDate),
      });
    }
  }

  return items;
}
