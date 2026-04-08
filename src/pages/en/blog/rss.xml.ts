import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft && data.locale === 'en'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'BSVibe Blog',
    description: 'Stories about BSVibe technology, products, and AI',
    site: context.site!.toString(),
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/en/blog/${post.id}/`,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: '<language>en</language>',
  });
}
