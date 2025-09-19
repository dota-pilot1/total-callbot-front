import { useState, useEffect } from "react";
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

const CATEGORY_LABELS: Record<PostCategory, string> = {
  notice: "공지사항",
  qna: "질문/답변",
  free: "자유게시판",
  review: "학습후기",
};

const CATEGORY_COLORS: Record<PostCategory, string> = {
  notice: "bg-red-100 text-red-800",
  qna: "bg-blue-100 text-blue-800",
  free: "bg-green-100 text-green-800",
  review: "bg-purple-100 text-purple-800",
};

export default function BoardList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState<
    PostCategory | "all"
  >((searchParams.get("category") as PostCategory) || "all");

  // 더미 데이터 (나중에 API 연동으로 교체)
  useEffect(() => {
    const dummyPosts: BoardPost[] = [
      {
        id: 1,
        title: "듣기시험 기능이 새롭게 추가되었습니다!",
        content: "새로운 영어 듣기시험 기능을 확인해보세요.",
        author: "관리자",
        category: "notice",
        createdAt: "2025-09-20T10:00:00Z",
        updatedAt: "2025-09-20T10:00:00Z",
        viewCount: 152,
        likeCount: 23,
        commentCount: 5,
        isPinned: true,
      },
      {
        id: 2,
        title: "AI 챗봇 대화에서 발음 연습은 어떻게 하나요?",
        content: "발음 교정 기능을 찾고 있는데 어디서 사용할 수 있을까요?",
        author: "학습자123",
        category: "qna",
        createdAt: "2025-09-20T09:30:00Z",
        updatedAt: "2025-09-20T09:30:00Z",
        viewCount: 45,
        likeCount: 12,
        commentCount: 8,
        isPinned: false,
      },
      {
        id: 3,
        title: "토익 900점 달성 후기",
        content: "이 플랫폼으로 공부해서 드디어 목표 점수를 달성했습니다!",
        author: "영어마스터",
        category: "review",
        createdAt: "2025-09-20T08:15:00Z",
        updatedAt: "2025-09-20T08:15:00Z",
        viewCount: 89,
        likeCount: 34,
        commentCount: 12,
        isPinned: false,
      },
      {
        id: 4,
        title: "같이 스터디 하실 분 구해요",
        content: "영어회화 스터디 멤버를 모집합니다.",
        author: "스터디리더",
        category: "free",
        createdAt: "2025-09-20T07:45:00Z",
        updatedAt: "2025-09-20T07:45:00Z",
        viewCount: 67,
        likeCount: 18,
        commentCount: 25,
        isPinned: false,
      },
    ];

    setTimeout(() => {
      setPosts(dummyPosts);
      setLoading(false);
    }, 500);
  }, []);

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

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pinnedPosts = filteredPosts.filter((post) => post.isPinned);
  const regularPosts = filteredPosts.filter((post) => !post.isPinned);

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">게시판</h1>
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
        >
          전체
        </Button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(key as PostCategory)}
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
              <Button className="mt-4" onClick={() => navigate("/board/write")}>
                첫 번째 글 작성하기
              </Button>
            </CardContent>
          </Card>
        )}
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
            <div className="flex items-center gap-2 mb-3">
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
