import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  createComment,
  updateComment,
  deleteComment,
} from "../api/boardApi";
import type { CreatePostRequest, CreateCommentRequest } from "../types";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: () => {
      // 게시글 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["board", "posts"] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: CreatePostRequest;
    }) => updatePost(postId, data),
    onSuccess: (updatedPost, variables) => {
      // 특정 게시글 쿼리 업데이트
      queryClient.setQueryData(
        ["board", "post", variables.postId],
        updatedPost,
      );
      // 게시글 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["board", "posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      // 게시글 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["board", "posts"] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => likePost(postId),
    onSuccess: (data, postId) => {
      // 특정 게시글 쿼리 업데이트
      queryClient.setQueryData(["board", "post", postId], data);
      // 게시글 목록도 업데이트 (좋아요 수 반영)
      queryClient.invalidateQueries({ queryKey: ["board", "posts"] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => unlikePost(postId),
    onSuccess: (data, postId) => {
      // 특정 게시글 쿼리 업데이트
      queryClient.setQueryData(["board", "post", postId], data);
      // 게시글 목록도 업데이트 (좋아요 수 반영)
      queryClient.invalidateQueries({ queryKey: ["board", "posts"] });
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(data),
    onSuccess: (_, variables) => {
      // 댓글 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["board", "comments", variables.postId],
      });
      // 게시글 정보도 무효화 (댓글 수 업데이트)
      queryClient.invalidateQueries({
        queryKey: ["board", "post", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["board", "posts"] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => updateComment(commentId, content),
    onSuccess: (data) => {
      // 댓글이 속한 게시글의 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["board", "comments", data.postId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: number; postId: number }) =>
      deleteComment(commentId),
    onSuccess: (_, variables) => {
      // 댓글 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["board", "comments", variables.postId],
      });
      // 게시글 정보도 무효화 (댓글 수 업데이트)
      queryClient.invalidateQueries({
        queryKey: ["board", "post", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["board", "posts"] });
    },
  });
};
