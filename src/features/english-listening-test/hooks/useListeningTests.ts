import { useQuery } from '@tanstack/react-query';
import { listeningTestApi } from '../api/listeningTest';

export const useListeningTests = () => {
  return useQuery({
    queryKey: ['listeningTests'],
    queryFn: listeningTestApi.getTests,
  });
};

export const useTestQuestions = (testId: number) => {
  return useQuery({
    queryKey: ['testQuestions', testId],
    queryFn: () => listeningTestApi.getTestQuestions(testId),
    enabled: !!testId,
  });
};
