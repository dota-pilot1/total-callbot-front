import React, { memo, useCallback, useRef, useState } from "react";
import { PhotoIcon, ArrowUpTrayIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { uploadImage } from "../api/imageApi";

export interface AttachedImage {
  id: string;
  name: string;
  size: number;
  preview: string; // 웹 경로 (업로드 후)
  webPath: string; // 서버 업로드 후 웹 경로
  mimeType: string;
  isUploaded: boolean; // 서버 업로드 완료 여부
  isUploading: boolean; // 업로드 진행 중 여부
}

interface ImageAttachmentProps {
  images?: AttachedImage[];
  maxImages?: number;
  maxSizePerImage?: number; // bytes
  onImagesChange: (images: AttachedImage[]) => void;
  disabled?: boolean;
  error?: string;
}

const ImageAttachment = memo<ImageAttachmentProps>(
  ({
    images = [],
    maxImages = 3,
    maxSizePerImage = 5 * 1024 * 1024, // 5MB
    onImagesChange,
    disabled = false,
    error,
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // 파일 크기를 읽기 쉬운 형태로 변환
    const formatFileSize = useCallback((bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }, []);

    // 파일 유효성 검사
    const validateFile = useCallback(
      (file: File) => {
        if (!file.type.startsWith("image/")) {
          return "이미지 파일만 업로드할 수 있습니다.";
        }
        if (file.size > maxSizePerImage) {
          return `파일 크기가 ${formatFileSize(maxSizePerImage)}를 초과합니다.`;
        }
        return null;
      },
      [maxSizePerImage, formatFileSize],
    );

    // 🎯 간단한 파일 처리 (useEffect 없이)
    const processFiles = useCallback(
      async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const currentImages = Array.isArray(images) ? images : [];

        for (const file of fileArray) {
          // 최대 개수 확인
          if (currentImages.length >= maxImages) {
            alert(`최대 ${maxImages}개의 이미지만 첨부할 수 있습니다.`);
            break;
          }

          // 파일 유효성 검사
          const validationError = validateFile(file);
          if (validationError) {
            alert(`${file.name}: ${validationError}`);
            continue;
          }

          // 중복 파일 확인
          const isDuplicate = currentImages.some(
            (img) => img.name === file.name && img.size === file.size,
          );
          if (isDuplicate) {
            alert(`${file.name}은 이미 첨부된 파일입니다.`);
            continue;
          }

          try {
            // 바로 서버에 업로드
            const uploadResult = await uploadImage(file);

            if (uploadResult.success && uploadResult.data) {
              // ✅ 업로드 성공 - 배열에 추가
              const newImage: AttachedImage = {
                id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                size: file.size,
                mimeType: file.type,
                preview: uploadResult.data.webPath,
                webPath: uploadResult.data.webPath,
                isUploaded: true,
                isUploading: false,
              };

              // 배열에 추가
              const updatedImages = [...currentImages, newImage];
              onImagesChange(updatedImages);
            } else {
              alert(
                `${file.name} 업로드 실패: ${uploadResult.error || "알 수 없는 오류"}`,
              );
            }
          } catch (error) {
            console.error("업로드 에러:", error);
            alert(`${file.name} 업로드 중 오류가 발생했습니다.`);
          }
        }
      },
      [images, maxImages, validateFile, onImagesChange],
    );

    // 파일 선택 핸들러
    const handleFileSelect = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          processFiles(files);
        }
        e.target.value = "";
      },
      [processFiles],
    );

    // 이미지 제거 핸들러
    const handleRemoveImage = useCallback(
      (imageId: string) => {
        const updatedImages = images.filter((img) => img.id !== imageId);
        onImagesChange(updatedImages);
      },
      [images, onImagesChange],
    );

    // 드래그 앤 드롭 핸들러들
    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          setDragActive(true);
        }
      },
      [disabled],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          processFiles(files);
        }
      },
      [disabled, processFiles],
    );

    // 파일 선택 버튼 클릭
    const handleSelectClick = useCallback(() => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, [disabled]);

    // 안정적인 이미지 배열 확보
    const stableImages = Array.isArray(images) ? images : [];
    const hasImages = stableImages.length > 0;

    return (
      <div className="space-y-3">
        {/* 헤더 (제목 + 이미지 태그들 + 토글 버튼) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm font-medium text-gray-700">
              첨부 이미지 (선택사항)
            </label>

            {/* 이미지 태그들 - 헤더 라인에 표시 */}
            {hasImages && (
              <div className="flex flex-wrap gap-1">
                {stableImages.map((image) => (
                  <div
                    key={image.id}
                    className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                      ${
                        image.isUploading
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : image.isUploaded
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                      }
                      transition-colors duration-200
                    `}
                  >
                    {/* 상태 아이콘 */}
                    {image.isUploading && (
                      <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {image.isUploaded && (
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    )}

                    {/* 파일명 (짧게 표시) */}
                    <span className="max-w-20 truncate" title={image.name}>
                      {image.name}
                    </span>

                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(image.id);
                      }}
                      disabled={disabled || image.isUploading}
                      className="flex-shrink-0 w-3 h-3 rounded-full bg-gray-400 hover:bg-red-500 text-white flex items-center justify-center text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="이미지 제거"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors border-none bg-transparent focus:outline-none flex-shrink-0"
            disabled={disabled}
          >
            <span>{isExpanded ? "접기" : "펼치기"}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* 접을 수 있는 영역 */}
        {isExpanded && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* 파일 선택 영역 */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : error
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleSelectClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden"
              />

              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {dragActive
                    ? "이미지를 여기에 놓아주세요"
                    : "이미지를 드래그하거나 클릭하여 선택하세요"}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <ArrowUpTrayIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    최대 {maxImages}개, 각 {formatFileSize(maxSizePerImage)}{" "}
                    이하
                  </span>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            {/* 도움말 */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 지원 형식: JPG, PNG, GIF, WebP</p>
              <p>• 이미지는 게시글 내용 하단에 표시됩니다</p>
              <p>
                • 드래그 앤 드롭으로 여러 이미지를 한 번에 선택할 수 있습니다
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ImageAttachment.displayName = "ImageAttachment";

export default ImageAttachment;
