import { useQuery } from '@tanstack/react-query';
import { fetchPost } from '../api/boardApi';

export const useBoardPost = (postId: number) => {
  return useQuery({
    queryKey: ['board', 'post', postId],
    queryFn: () => fetchPost(postId),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!postId,
  });
};
