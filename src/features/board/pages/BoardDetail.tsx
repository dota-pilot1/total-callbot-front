import { useState } from "react";
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
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

import {
  useBoardPost,
  useBoardComments,
  useLikePost,
  useUnlikePost,
  useCreateComment,
  useDeletePost,
} from "../hooks";
import AppHeader from "../../../components/layout/AppHeader";
import PostImageThumbnail from "../components/PostImageThumbnail";

const CATEGORY_LABELS = {
  NOTICE: "공지사항",
  QNA: "질문/답변",
  FREE: "자유게시판",
  REVIEW: "학습후기",
  FEEDBACK: "건의사항",
};

const CATEGORY_COLORS = {
  NOTICE: "bg-red-100 text-red-800",
  QNA: "bg-blue-100 text-blue-800",
  FREE: "bg-green-100 text-green-800",
  REVIEW: "bg-purple-100 text-purple-800",
  FEEDBACK: "bg-orange-100 text-orange-800",
};

export default function BoardDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
  const [imageModalData, setImageModalData] = useState<{
    urls: string[];
    currentIndex: number;
  } | null>(null);

  const postIdNum = Number(postId);

  // TanStack Query로 게시글과 댓글 조회
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useBoardPost(postIdNum);

  const { data: comments = [], isLoading: commentsLoading } =
    useBoardComments(postIdNum);

  const loading = postLoading || commentsLoading;

  // Mutations
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const createCommentMutation = useCreateComment();
  const deletePostMutation = useDeletePost();

  // 에러 처리
  if (postError) {
    alert("게시글을 불러오는데 실패했습니다.");
    navigate("/board");
    return null;
  }

  const handleLike = async () => {
    if (!post) return;

    try {
      if (isLiked) {
        await unlikePostMutation.mutateAsync(post.id);
      } else {
        await likePostMutation.mutateAsync(post.id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleEdit = () => {
    if (!post) return;
    // TODO: 수정 페이지로 이동 (쿼리 파라미터로 post 정보 전달)
    navigate(`/board/write?edit=${post.id}`);
  };

  const handleDelete = async () => {
    if (!post) return;

    if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await deletePostMutation.mutateAsync(post.id);
        alert("게시글이 삭제되었습니다.");
        navigate("/board");
      } catch (error) {
        console.error("게시글 삭제 실패:", error);
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    try {
      await createCommentMutation.mutateAsync({
        postId: post.id,
        content: newComment,
      });
      setNewComment("");
      setIsCommentFormOpen(false); // 댓글 작성 후 폼 닫기
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleCommentCancel = () => {
    setNewComment("");
    setIsCommentFormOpen(false);
  };

  const handleImageClick = (imageUrls: string[], clickedIndex: number) => {
    setImageModalData({
      urls: imageUrls,
      currentIndex: clickedIndex,
    });
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="게시판" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/board")}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            목록으로
          </Button>

          <div className="flex-1" />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <PencilIcon className="h-4 w-4 mr-2" />
              수정
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deletePostMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </div>

        {/* 게시글 + 댓글 통합 */}
        <Card>
          <CardContent className="px-6 py-8">
            {/* 카테고리와 제목 */}
            <div className="mb-4 mt-3">
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
            <div className="prose max-w-none mb-8">
              <p className="whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* 첨부 이미지 썸네일 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-8">
                <PostImageThumbnail
                  imageUrls={post.images.map((img) => img.webPath)}
                  size="lg"
                  maxImages={5}
                  onClick={handleImageClick}
                />
              </div>
            )}

            {/* 좋아요 버튼 */}
            <div className="flex justify-center mb-8">
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

            {/* 댓글 섹션 구분선 */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold">
                    댓글 {comments.length}개
                  </h2>
                </div>

                {/* 댓글 작성 토글 버튼 */}
                {!isCommentFormOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCommentFormOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    댓글 작성
                  </Button>
                )}
              </div>

              {/* 댓글 작성 폼 (토글) */}
              {isCommentFormOpen && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <textarea
                      placeholder="댓글을 작성해주세요..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 resize-none bg-white"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCommentCancel}
                        className="flex items-center gap-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        취소
                      </Button>
                      <Button
                        type="submit"
                        disabled={!newComment.trim()}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        등록
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={comment.id}>
                      <div className="flex items-start gap-4">
                        {/* 댓글 아바타 */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {comment.author.charAt(0)}
                            </span>
                          </div>
                        </div>

                        {/* 댓글 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                            {comment.content}
                          </p>
                        </div>
                      </div>

                      {/* 댓글 구분선 (마지막 댓글 제외) */}
                      {index < comments.length - 1 && (
                        <hr className="border-gray-100 mt-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">아직 댓글이 없습니다</p>
                    <p className="text-sm text-gray-400">
                      첫 번째 댓글을 작성해보세요!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이미지 뷰어 모달 */}
        {imageModalData && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setImageModalData(null)}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setImageModalData(null)}
              className="
                absolute top-4 right-4 z-10 p-3 bg-black bg-opacity-70
                hover:bg-opacity-90 rounded-full text-white transition-all
                border-2 border-white border-opacity-50 hover:border-opacity-80
                shadow-lg hover:scale-105
              "
              title="닫기 (ESC)"
            >
              <XMarkIcon className="w-7 h-7 stroke-2" />
            </button>

            {/* 이미지 */}
            <div
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageModalData.urls[imageModalData.currentIndex]}
                alt={`첨부 이미지 ${imageModalData.currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* 이미지 정보 */}
              <div
                className="
                absolute bottom-4 left-1/2 transform -translate-x-1/2
                bg-black bg-opacity-60 text-white text-sm px-4 py-2 rounded
              "
              >
                {imageModalData.currentIndex + 1} / {imageModalData.urls.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
