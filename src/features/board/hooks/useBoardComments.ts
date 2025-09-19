import { useQuery } from '@tanstack/react-query';
import { fetchComments } from '../api/boardApi';

export const useBoardComments = (postId: number) => {
  return useQuery({
    queryKey: ['board', 'comments', postId],
    queryFn: () => fetchComments(postId),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    enabled: !!postId,
  });
};
