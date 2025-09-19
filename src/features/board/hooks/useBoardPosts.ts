import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/boardApi';
import type { PostCategory } from '../types';

export const useBoardPosts = (
  category?: PostCategory | 'all',
  search?: string,
  page: number = 0,
  size: number = 20
) => {
  const actualCategory = category === 'all' ? undefined : category;
  const actualSearch = search?.trim() || undefined;

  return useQuery({
    queryKey: ['board', 'posts', { category: actualCategory, search: actualSearch, page, size }],
    queryFn: () => fetchPosts(actualCategory, actualSearch, page, size),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
