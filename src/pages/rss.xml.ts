import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { CATEGORIES } from '../content.config';
import { publishedPosts } from '../lib';

export async function GET(context: APIContext) {
  const posts = await publishedPosts();
  return rss({
    title: 'renard.cool',
    description: 'Photographie, faune et musique.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/${post.id}`,
      categories: [CATEGORIES[post.data.category]],
    })),
  });
}
