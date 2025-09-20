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
  images?: BoardImageInfo[];
}

export interface BoardComment {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export type PostCategory = "NOTICE" | "QNA" | "FREE" | "REVIEW" | "FEEDBACK";

export interface CreatePostRequest {
  title: string;
  content: string;
  category: PostCategory;
  images?: BoardImageInfo[];
}

export interface BoardImageInfo {
  originalName: string;
  webPath: string;
  fileSize: number;
  mimeType: string;
  displayOrder: number;
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
