import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreatePost, useUpdatePost, useBoardPost } from "./index";
import type { PostCategory, CreatePostRequest } from "../types";

interface BoardFormData {
  title: string;
  content: string;
  category: PostCategory;
}

interface UseBoardFormOptions {
  onSuccess?: (postId: number) => void;
  onError?: (error: Error) => void;
}

export const useBoardForm = (options: UseBoardFormOptions = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  // Form state
  const [formData, setFormData] = useState<BoardFormData>({
    title: "",
    content: "",
    category: "FREE",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  // Load existing post for edit mode
  const {
    data: existingPost,
    isLoading: loadingPost,
    error: loadError,
  } = useBoardPost(editId ? Number(editId) : 0);

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (existingPost && isEditMode) {
      setFormData({
        title: existingPost.title,
        content: existingPost.content,
        category: existingPost.category,
      });
    }
  }, [existingPost, isEditMode]);

  // Form handlers
  const updateField = <K extends keyof BoardFormData>(
    field: K,
    value: BoardFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "FREE",
    });
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "제목을 입력해주세요.";
    if (!formData.content.trim()) return "내용을 입력해주세요.";
    if (formData.title.length > 200) return "제목은 200자 이내로 입력해주세요.";
    if (formData.content.length > 2000)
      return "내용은 2000자 이내로 입력해주세요.";
    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    const validationError = validateForm();
    if (validationError) {
      throw new Error(validationError);
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editId) {
        await updatePostMutation.mutateAsync({
          postId: Number(editId),
          data: formData as CreatePostRequest,
        });
        const postId = Number(editId);
        options.onSuccess?.(postId);
      } else {
        const newPost = await createPostMutation.mutateAsync(
          formData as CreatePostRequest,
        );
        options.onSuccess?.(newPost.id);
      }
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("알 수 없는 오류가 발생했습니다.");
      options.onError?.(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = formData.title.trim() || formData.content.trim();

    if (hasChanges) {
      const message = isEditMode
        ? "수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?"
        : "작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?";

      if (confirm(message)) {
        if (isEditMode && editId) {
          navigate(`/board/${editId}`);
        } else {
          navigate("/board");
        }
      }
    } else {
      if (isEditMode && editId) {
        navigate(`/board/${editId}`);
      } else {
        navigate("/board");
      }
    }
  };

  // Computed values
  const isLoading = loadingPost || isSubmitting;
  const canSubmit =
    !isLoading &&
    !loadError &&
    formData.title.trim() &&
    formData.content.trim();

  return {
    // State
    formData,
    isEditMode,
    isLoading,
    isSubmitting,
    canSubmit,
    existingPost,
    loadError,

    // Actions
    updateField,
    resetForm,
    handleSubmit,
    handleCancel,

    // Utils
    validateForm,
  };
};
