import { apiClient } from "../../../shared/api/client";
import type {
  BoardPost,
  BoardComment,
  PostCategory,
  CreatePostRequest,
  CreateCommentRequest,
} from "../types";

// API 응답 타입
interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// 게시글 목록 조회
export async function fetchPosts(
  category?: PostCategory,
  search?: string,
  page: number = 0,
  size: number = 10,
): Promise<PageResponse<BoardPost>> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("size", size.toString());

  const response = await apiClient.get(`/board/posts?${params}`);
  return response.data;
}

// 게시글 상세 조회
export async function fetchPost(postId: number): Promise<BoardPost> {
  const response = await apiClient.get(`/board/posts/${postId}`);
  return response.data;
}

// 게시글 작성
export async function createPost(post: CreatePostRequest): Promise<BoardPost> {
  const response = await apiClient.post(`/board/posts`, post);
  return response.data;
}

// 게시글 수정
export async function updatePost(
  postId: number,
  post: CreatePostRequest,
): Promise<BoardPost> {
  const response = await apiClient.put(`/board/posts/${postId}`, post);
  return response.data;
}

// 게시글 삭제
export async function deletePost(postId: number): Promise<void> {
  await apiClient.delete(`/board/posts/${postId}`);
}

// 게시글 좋아요
export async function likePost(postId: number): Promise<BoardPost> {
  const response = await apiClient.post(`/board/posts/${postId}/like`);
  return response.data;
}

// 게시글 좋아요 취소
export async function unlikePost(postId: number): Promise<BoardPost> {
  const response = await apiClient.delete(`/board/posts/${postId}/like`);
  return response.data;
}

// 댓글 목록 조회
export async function fetchComments(postId: number): Promise<BoardComment[]> {
  const response = await apiClient.get(`/board/posts/${postId}/comments`);
  return response.data;
}

// 댓글 작성
export async function createComment(
  comment: CreateCommentRequest,
): Promise<BoardComment> {
  const response = await apiClient.post(`/board/comments`, comment);
  return response.data;
}

// 댓글 수정
export async function updateComment(
  commentId: number,
  content: string,
): Promise<BoardComment> {
  const response = await apiClient.put(`/board/comments/${commentId}`, {
    content,
  });
  return response.data;
}

// 댓글 삭제
export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/board/comments/${commentId}`);
}
