import React, { memo, useState, useCallback } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';

interface PostImageGalleryProps {
  /** 이미지 URL 배열 */
  imageUrls: string[];
  /** 추가 CSS 클래스 */
  className?: string;
}

const PostImageGallery = memo<PostImageGalleryProps>(({
  imageUrls,
  className = ''
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  // 빈 배열이거나 유효하지 않은 경우 렌더링하지 않음
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handlePrevImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : imageUrls.length - 1;
      setSelectedImageIndex(newIndex);
    }
  }, [selectedImageIndex, imageUrls.length]);

  const handleNextImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      const newIndex = selectedImageIndex < imageUrls.length - 1 ? selectedImageIndex + 1 : 0;
      setSelectedImageIndex(newIndex);
    }
  }, [selectedImageIndex, imageUrls.length]);

  const handleImageError = useCallback((index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
  }, []);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (selectedImageIndex === null) return;

    switch (e.key) {
      case 'Escape':
        handleCloseModal();
        break;
      case 'ArrowLeft':
        handlePrevImage();
        break;
      case 'ArrowRight':
        handleNextImage();
        break;
    }
  }, [selectedImageIndex, handleCloseModal, handlePrevImage, handleNextImage]);

  return (
    <>
      {/* 갤러리 그리드 */}
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MagnifyingGlassPlusIcon className="w-4 h-4" />
          <span>첨부된 이미지 ({imageUrls.length}개)</span>
          <span className="text-xs text-gray-400">클릭하여 크게 보기</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="
                relative aspect-video bg-gray-100 rounded-lg overflow-hidden
                border border-gray-200 cursor-pointer group hover:shadow-lg
                transition-all duration-200
              "
              onClick={() => handleImageClick(index)}
            >
              {!imageLoadErrors.has(index) ? (
                <img
                  src={url}
                  alt={`첨부 이미지 ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MagnifyingGlassPlusIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">이미지를 불러올 수 없습니다</p>
                  </div>
                </div>
              )}

              {/* 호버 오버레이 */}
              <div className="
                absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20
                transition-all duration-200 flex items-center justify-center
              ">
                <MagnifyingGlassPlusIcon className="
                  w-8 h-8 text-white opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                " />
              </div>

              {/* 이미지 번호 */}
              <div className="
                absolute top-2 right-2 bg-black bg-opacity-60 text-white
                text-xs px-2 py-1 rounded
              ">
                {index + 1}/{imageUrls.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 이미지 뷰어 모달 */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={handleCloseModal}
            className="
              absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20
              hover:bg-opacity-30 rounded-full text-white transition-colors
            "
            title="닫기 (ESC)"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* 이전 이미지 버튼 */}
          {imageUrls.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="
                absolute left-4 top-1/2 transform -translate-y-1/2 z-10
                p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full
                text-white transition-colors
              "
              title="이전 이미지 (←)"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}

          {/* 다음 이미지 버튼 */}
          {imageUrls.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="
                absolute right-4 top-1/2 transform -translate-y-1/2 z-10
                p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full
                text-white transition-colors
              "
              title="다음 이미지 (→)"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}

          {/* 이미지 */}
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrls[selectedImageIndex]}
              alt={`첨부 이미지 ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={() => handleImageError(selectedImageIndex)}
            />

            {/* 이미지 정보 */}
            <div className="
              absolute bottom-4 left-1/2 transform -translate-x-1/2
              bg-black bg-opacity-60 text-white text-sm px-4 py-2 rounded
            ">
              {selectedImageIndex + 1} / {imageUrls.length}
            </div>
          </div>

          {/* 썸네일 네비게이션 (이미지가 많을 때) */}
          {imageUrls.length > 1 && (
            <div className="
              absolute bottom-4 left-1/2 transform -translate-x-1/2
              flex gap-2 max-w-full overflow-x-auto px-4
            ">
              {imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden
                    transition-all duration-200
                    ${index === selectedImageIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-70 hover:opacity-100'
                    }
                  `}
                >
                  <img
                    src={url}
                    alt={`썸네일 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* 키보드 단축키 안내 */}
          <div className="
            absolute top-4 left-4 text-white text-xs bg-black bg-opacity-60
            px-3 py-2 rounded space-y-1
          ">
            <div>ESC: 닫기</div>
            {imageUrls.length > 1 && (
              <>
                <div>← →: 이미지 이동</div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
});

PostImageGallery.displayName = 'PostImageGallery';

export default PostImageGallery;
