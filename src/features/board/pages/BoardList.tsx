import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui";
import { Button } from "../../../components/ui";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import type { BoardPost, PostCategory } from "../types";
import { useBoardPosts } from "../hooks";
import AppHeader from "../../../components/layout/AppHeader";

const CATEGORY_LABELS: Record<PostCategory, string> = {
  NOTICE: "공지사항",
  QNA: "질문/답변",
  FREE: "자유게시판",
  REVIEW: "학습후기",
  FEEDBACK: "건의사항",
};

const CATEGORY_COLORS: Record<PostCategory, string> = {
  NOTICE: "bg-red-100 text-red-800",
  QNA: "bg-blue-100 text-blue-800",
  FREE: "bg-green-100 text-green-800",
  REVIEW: "bg-purple-100 text-purple-800",
  FEEDBACK: "bg-orange-100 text-orange-800",
};

export default function BoardList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState<
    PostCategory | "all"
  >((searchParams.get("category") as PostCategory) || "all");

  // TanStack Query로 게시글 목록 조회
  const { data: postsData, isLoading: loading } = useBoardPosts(
    selectedCategory,
    searchParams.get("search") || undefined,
    0,
    20,
  );

  const posts = postsData?.content || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category: PostCategory | "all") => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category !== "all") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  // 서버에서 이미 필터링된 데이터를 사용 (클라이언트 사이드 필터링 제거)
  const pinnedPosts = posts.filter((post) => post.isPinned);
  const regularPosts = posts.filter((post) => !post.isPinned);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="게시판" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">
            {selectedCategory === "all"
              ? "게시판"
              : CATEGORY_LABELS[selectedCategory]}
          </h1>
          <Button
            onClick={() => navigate("/board/write")}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            글쓰기
          </Button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
            className={`${
              selectedCategory === "all"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-300"
                : ""
            }`}
          >
            전체
          </Button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(key as PostCategory)}
              className={`${
                selectedCategory === key
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-300"
                  : ""
              }`}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="제목이나 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button>
              <MagnifyingGlassIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* 공지사항 (고정글) */}
        {pinnedPosts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-red-600">
              📌 공지사항
            </h2>
            <div className="space-y-3">
              {pinnedPosts.map((post) => (
                <PostCard key={post.id} post={post} isPinned />
              ))}
            </div>
          </div>
        )}

        {/* 일반 게시글 */}
        <div className="space-y-3">
          {regularPosts.length > 0 ? (
            regularPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <p className="text-muted-foreground">게시글이 없습니다.</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/board/write")}
                >
                  첫 번째 글 작성하기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  isPinned = false,
}: {
  post: BoardPost;
  isPinned?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        isPinned ? "border-red-200 bg-red-50/50" : ""
      }`}
      onClick={() => navigate(`/board/${post.id}`)}
    >
      <CardContent className="px-6 py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 mt-2">
              <span
                className={`px-2 py-1 text-xs rounded-md ${CATEGORY_COLORS[post.category]}`}
              >
                {CATEGORY_LABELS[post.category]}
              </span>
              {isPinned && (
                <span className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-800">
                  공지
                </span>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-2 truncate">
              {post.title}
            </h3>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {post.content}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{post.author}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <EyeIcon className="h-3 w-3" />
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartIcon className="h-3 w-3" />
                  <span>{post.likeCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="h-3 w-3" />
                  <span>{post.commentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
