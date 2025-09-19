export interface BoardPost {
  id: number;
  title: string;
  content: string;
  author: string;
  category: PostCategory;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
}

export interface BoardComment {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export type PostCategory = 'notice' | 'qna' | 'free' | 'review';

export interface CreatePostRequest {
  title: string;
  content: string;
  category: PostCategory;
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
}

export interface BoardListParams {
  page?: number;
  size?: number;
  category?: PostCategory;
  search?: string;
}
