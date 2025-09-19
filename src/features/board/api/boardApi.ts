import type {
  BoardPost,
  BoardComment,
  PostCategory,
  CreatePostRequest,
  CreateCommentRequest,
} from "../types";

const API_BASE_URL = "http://localhost:8080/api/board";

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

// 토큰 가져오기 헬퍼
function getAuthToken(): string | null {
  return localStorage.getItem("accessToken");
}

// 인증 헤더 생성
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
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

  const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("게시글 목록을 불러오는데 실패했습니다");
  }

  return response.json();
}

// 게시글 상세 조회
export async function fetchPost(postId: number): Promise<BoardPost> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("게시글을 불러오는데 실패했습니다");
  }

  return response.json();
}

// 게시글 작성
export async function createPost(post: CreatePostRequest): Promise<BoardPost> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error("게시글 작성에 실패했습니다");
  }

  return response.json();
}

// 게시글 수정
export async function updatePost(
  postId: number,
  post: CreatePostRequest,
): Promise<BoardPost> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error("게시글 수정에 실패했습니다");
  }

  return response.json();
}

// 게시글 삭제
export async function deletePost(postId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("게시글 삭제에 실패했습니다");
  }
}

// 게시글 좋아요
export async function likePost(postId: number): Promise<BoardPost> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("좋아요 처리에 실패했습니다");
  }

  return response.json();
}

// 게시글 좋아요 취소
export async function unlikePost(postId: number): Promise<BoardPost> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("좋아요 취소에 실패했습니다");
  }

  return response.json();
}

// 댓글 목록 조회
export async function fetchComments(postId: number): Promise<BoardComment[]> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("댓글을 불러오는데 실패했습니다");
  }

  return response.json();
}

// 댓글 작성
export async function createComment(
  comment: CreateCommentRequest,
): Promise<BoardComment> {
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(comment),
  });

  if (!response.ok) {
    throw new Error("댓글 작성에 실패했습니다");
  }

  return response.json();
}

// 댓글 수정
export async function updateComment(
  commentId: number,
  content: string,
): Promise<BoardComment> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    throw new Error("댓글 수정에 실패했습니다");
  }

  return response.json();
}

// 댓글 삭제
export async function deleteComment(commentId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("댓글 삭제에 실패했습니다");
  }
}
