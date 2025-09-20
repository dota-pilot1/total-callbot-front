import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { uploadImage } from "../api/imageApi";

export interface UploadedImage {
  id: string;
  name: string;
  size: number;
  webPath: string;
  mimeType: string;
}

interface ImageUploaderProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizePerImage?: number;
  disabled?: boolean;
  resetTrigger?: number; // 이 값이 변경되면 이미지 초기화
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  maxImages = 3,
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  disabled = false,
  resetTrigger,
}) => {
  console.log("🎯 [NEW ImageUploader] 컴포넌트 렌더링됨!");
  // 🎯 독립적인 상태 관리 (부모 폼과 분리)
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔧 게시글 저장 후 이미지 초기화
  useEffect(() => {
    if (resetTrigger !== undefined) {
      console.log("🧹 [ImageUploader] 게시글 저장 완료 - 이미지 초기화");
      setImages([]);
      onImagesChange([]);
    }
  }, [resetTrigger, onImagesChange]);

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 파일 검증
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "이미지 파일만 업로드할 수 있습니다.";
    }
    if (file.size > maxSizePerImage) {
      return `파일 크기가 ${formatFileSize(maxSizePerImage)}를 초과합니다.`;
    }
    return null;
  };

  // 🚀 파일 업로드 처리 (단순하고 안정적)
  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        // 최대 개수 확인
        if (images.length + uploadingCount >= maxImages) {
          alert(`최대 ${maxImages}개의 이미지만 첨부할 수 있습니다.`);
          break;
        }

        // 파일 검증
        const error = validateFile(file);
        if (error) {
          alert(`${file.name}: ${error}`);
          continue;
        }

        // 중복 확인
        if (
          images.some((img) => img.name === file.name && img.size === file.size)
        ) {
          alert(`${file.name}은 이미 첨부된 파일입니다.`);
          continue;
        }

        // 업로딩 카운트 증가
        setUploadingCount((prev) => prev + 1);

        try {
          const result = await uploadImage(file);

          if (result.success && result.data) {
            const newImage: UploadedImage = {
              id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              size: file.size,
              webPath: result.data.webPath,
              mimeType: file.type,
            };

            // 🎯 내부 상태 업데이트
            setImages((prev) => {
              const updated = [...prev, newImage];
              // 부모에게 최종 결과 전달
              onImagesChange(updated);
              return updated;
            });
          } else {
            alert(
              `${file.name} 업로드 실패: ${result.error || "알 수 없는 오류"}`,
            );
          }
        } catch (error) {
          console.error("업로드 에러:", error);
          alert(`${file.name} 업로드 중 오류가 발생했습니다.`);
        } finally {
          // 업로딩 카운트 감소
          setUploadingCount((prev) => prev - 1);
        }
      }
    },
    [images, uploadingCount, maxImages, maxSizePerImage, onImagesChange],
  );

  // 이미지 제거
  const handleRemoveImage = useCallback(
    (imageId: string) => {
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== imageId);
        onImagesChange(updated);
        return updated;
      });
    },
    [onImagesChange],
  );

  // 파일 선택
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files);
      }
      e.target.value = "";
    },
    [handleFileUpload],
  );

  // 드래그 앤 드롭
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setDragActive(true);
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
        handleFileUpload(files);
      }
    },
    [disabled, handleFileUpload],
  );

  const handleSelectClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm font-medium text-gray-700">
            첨부 이미지 (선택사항)
          </label>

          {/* 이미지 태그들 */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200 transition-colors duration-200"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="max-w-20 truncate" title={image.name}>
                    {image.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.id);
                    }}
                    disabled={disabled}
                    className="flex-shrink-0 w-3 h-3 rounded-full bg-gray-400 hover:bg-red-500 text-white flex items-center justify-center text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="이미지 제거"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 업로딩 중 표시 */}
          {uploadingCount > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
              <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>업로드 중... ({uploadingCount})</span>
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

      {/* 펼쳐지는 영역 */}
      {isExpanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
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
                  최대 {maxImages}개, 각 {formatFileSize(maxSizePerImage)} 이하
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• 지원 형식: JPG, PNG, GIF, WebP</p>
            <p>• 이미지는 게시글 내용 하단에 표시됩니다</p>
            <p>• 드래그 앤 드롭으로 여러 이미지를 한 번에 선택할 수 있습니다</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
