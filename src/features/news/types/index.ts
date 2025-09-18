export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: NewsCategory;
  publishedAt: string;
  author: string;
  source: string;
  imageUrl?: string;
  readTime: number; // 읽는데 소요되는 시간 (분)
  tags: string[];
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface UserNewsPreference {
  userId: string;
  favoriteCategories: string[];
  readArticles: string[];
  savedArticles: string[];
  lastReadAt: string;
}

export interface NewsStats {
  readArticlesCount: number;
  savedArticlesCount: number;
  favoriteCategoriesCount: number;
  totalReadingTime: number; // 총 읽은 시간 (분)
}
