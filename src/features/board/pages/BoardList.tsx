import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui";
import { Button } from "../../../components/ui";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import BoardHeader from "../../../components/layout/BoardHeader";
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import type { BoardPost, PostCategory } from "../types";
import { useBoardPosts } from "../hooks";
import PostImageThumbnail from "../components/PostImageThumbnail";
import { BoardWriteDialog } from "../components/BoardWriteDialog";

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
  const [showWriteDialog, setShowWriteDialog] = useState(false);

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

  const handleWriteClick = () => {
    setShowWriteDialog(true);
  };

  const handleWriteSuccess = (postId: number) => {
    // 게시글 작성 성공 시 해당 게시글로 이동
    navigate(`/board/${postId}`);
  };

  // 서버에서 이미 필터링된 데이터를 사용
  const pinnedPosts = posts.filter((post) => post.isPinned);
  const regularPosts = posts.filter((post) => !post.isPinned);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BoardHeader onWriteClick={handleWriteClick} />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BoardHeader onWriteClick={handleWriteClick} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">
            {selectedCategory === "all"
              ? "게시판"
              : CATEGORY_LABELS[selectedCategory]}
          </h1>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="게시글 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button type="submit" size="sm" className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-4 w-4" />
              검색
            </Button>
          </div>
        </form>

        {/* 고정 게시글 */}
        {pinnedPosts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">
              📌 고정 게시글
            </h2>
            <div className="space-y-3">
              {pinnedPosts.map((post) => (
                <PostCard key={post.id} post={post} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* 일반 게시글 */}
        <div className="space-y-3">
          {regularPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">게시글이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            regularPosts.map((post) => (
              <PostCard key={post.id} post={post} navigate={navigate} />
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {postsData && postsData.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {[...Array(Math.min(postsData.totalPages, 10))].map((_, i) => (
                <Button
                  key={i}
                  variant={postsData.pageable.pageNumber === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", i.toString());
                    setSearchParams(params);
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 게시글 작성 슬라이드 다이얼로그 */}
      <FullScreenSlideDialog
        isOpen={showWriteDialog}
        onClose={() => setShowWriteDialog(false)}
        title="✍️ 게시글 작성"
      >
        <BoardWriteDialog
          onClose={() => setShowWriteDialog(false)}
          onSuccess={handleWriteSuccess}
        />
      </FullScreenSlideDialog>
    </div>
  );
}

// 게시글 카드 컴포넌트
function PostCard({
  post,
  navigate,
}: {
  post: BoardPost;
  navigate: (path: string) => void;
}) {
  const handlePostClick = () => {
    navigate(`/board/${post.id}`);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handlePostClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* 카테고리와 제목 */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  CATEGORY_COLORS[post.category]
                }`}
              >
                {CATEGORY_LABELS[post.category]}
              </span>
              {post.isPinned && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  📌 고정
                </span>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {post.title}
            </h3>

            {post.content && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {post.content.replace(/<[^>]*>/g, "")}
              </p>
            )}

            {/* 작성자 및 날짜 */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>{post.author || "익명"}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              {/* 통계 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{post.viewCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>{post.commentCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4" />
                  <span>{post.likeCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 이미지 썸네일 */}
          {post.images && post.images.length > 0 && (
            <div className="flex-shrink-0">
              <PostImageThumbnail
                imageUrls={post.images.map((img) => img.webPath)}
                size="sm"
                className=""
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
