import { getCollection, type CollectionEntry } from 'astro:content';
import type { Category } from './content.config';

export type Post = CollectionEntry<'posts'>;

export async function publishedPosts(category?: Category): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => {
    if (data.draft && import.meta.env.PROD) return false;
    return category ? data.category === category : true;
  });
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
