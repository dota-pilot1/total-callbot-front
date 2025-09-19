import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui";
import { Button } from "../../../components/ui";
import {
  ArrowLeftIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import type { BoardPost, BoardComment } from "../types";

const CATEGORY_LABELS = {
  notice: "공지사항",
  qna: "질문/답변",
  free: "자유게시판",
  review: "학습후기",
};

const CATEGORY_COLORS = {
  notice: "bg-red-100 text-red-800",
  qna: "bg-blue-100 text-blue-800",
  free: "bg-green-100 text-green-800",
  review: "bg-purple-100 text-purple-800",
};

export default function BoardDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // 더미 데이터
  useEffect(() => {
    const dummyPost: BoardPost = {
      id: Number(postId),
      title: "AI 챗봇 대화에서 발음 연습은 어떻게 하나요?",
      content: `안녕하세요! 영어 학습을 시작한 지 얼마 안 된 초보자입니다.

AI 챗봇과 대화를 나누면서 영어 실력을 늘리고 있는데, 발음 교정 기능이 있는지 궁금합니다.

제가 말하는 발음을 분석해서 피드백을 주는 기능이 있나요?
아니면 어떤 방법으로 발음 연습을 할 수 있을까요?

좋은 팁이나 방법이 있다면 공유해주세요!`,
      author: "학습자123",
      category: "qna",
      createdAt: "2025-09-20T09:30:00Z",
      updatedAt: "2025-09-20T09:30:00Z",
      viewCount: 45,
      likeCount: 12,
      commentCount: 3,
      isPinned: false,
    };

    const dummyComments: BoardComment[] = [
      {
        id: 1,
        postId: Number(postId),
        content:
          "음성 인식 기능을 활용해보세요! 챗봇과 대화할 때 마이크 버튼을 누르면 발음을 인식해줍니다.",
        author: "영어마스터",
        createdAt: "2025-09-20T10:15:00Z",
        updatedAt: "2025-09-20T10:15:00Z",
      },
      {
        id: 2,
        postId: Number(postId),
        content:
          "저도 같은 궁금증이 있었는데, 반복 연습이 가장 도움이 되더라고요. 챗봇이 틀린 발음을 지적해주기도 해요.",
        author: "스터디메이트",
        createdAt: "2025-09-20T11:00:00Z",
        updatedAt: "2025-09-20T11:00:00Z",
      },
      {
        id: 3,
        postId: Number(postId),
        content:
          "발음 연습 전용 모드가 따로 있으면 좋겠어요. 관리자님 검토 부탁드립니다!",
        author: "학습러버",
        createdAt: "2025-09-20T12:30:00Z",
        updatedAt: "2025-09-20T12:30:00Z",
      },
    ];

    setTimeout(() => {
      setPost(dummyPost);
      setComments(dummyComments);
      setLoading(false);
    }, 500);
  }, [postId]);

  const handleLike = () => {
    if (post) {
      setIsLiked(!isLiked);
      setPost({
        ...post,
        likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: BoardComment = {
      id: comments.length + 1,
      postId: Number(postId),
      content: newComment,
      author: "현재사용자", // 실제로는 로그인한 사용자 정보
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComments([...comments, comment]);
    setNewComment("");

    if (post) {
      setPost({
        ...post,
        commentCount: post.commentCount + 1,
      });
    }
  };

  if (loading || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/board")}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          목록으로
        </Button>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <PencilIcon className="h-4 w-4 mr-2" />
            수정
          </Button>
          <Button variant="outline" size="sm">
            <TrashIcon className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      {/* 게시글 본문 */}
      <Card className="mb-6">
        <CardContent className="px-6 py-8">
          {/* 카테고리와 제목 */}
          <div className="mb-4">
            <span
              className={`px-2 py-1 text-xs rounded-md ${CATEGORY_COLORS[post.category]}`}
            >
              {CATEGORY_LABELS[post.category]}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {/* 게시글 정보 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-4">
              <span className="font-medium">{post.author}</span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                <span>{post.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <HeartIcon className="h-4 w-4" />
                <span>{post.likeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* 게시글 내용 */}
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* 좋아요 버튼 */}
          <div className="flex justify-center">
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              {isLiked ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              좋아요 {post.likeCount}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            댓글 {comments.length}개
          </h2>

          {/* 댓글 작성 */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              placeholder="댓글을 작성해주세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim()}>
                댓글 작성
              </Button>
            </div>
          </form>

          <hr className="border-gray-200 mb-4" />

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-2 border-gray-200 pl-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {comment.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
