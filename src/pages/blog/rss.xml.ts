import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft && data.locale === 'ko'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'BSVibe 블로그',
    description: 'BSVibe의 기술, 제품, AI에 대한 이야기',
    site: context.site!.toString(),
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: '<language>ko</language>',
  });
}
