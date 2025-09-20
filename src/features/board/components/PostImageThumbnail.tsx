import React, { memo } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface PostImageThumbnailProps {
  /** 이미지 URL 배열 */
  imageUrls: string[];
  /** 최대 표시할 이미지 개수 */
  maxImages?: number;
  /** 썸네일 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 클릭 핸들러 (이미지 뷰어 열기 등) */
  onClick?: (imageUrls: string[], clickedIndex: number) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

const PostImageThumbnail = memo<PostImageThumbnailProps>(({
  imageUrls,
  maxImages = 3,
  size = 'md',
  onClick,
  className = ''
}) => {
  // 빈 배열이거나 유효하지 않은 경우 렌더링하지 않음
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  // 크기별 스타일
  const sizeStyles = {
    sm: {
      container: 'h-16',
      image: 'h-16 w-16',
      grid: 'gap-1',
      text: 'text-xs',
      iconSize: 'w-3 h-3'
    },
    md: {
      container: 'h-20',
      image: 'h-20 w-20',
      grid: 'gap-2',
      text: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    lg: {
      container: 'h-24',
      image: 'h-24 w-24',
      grid: 'gap-2',
      text: 'text-base',
      iconSize: 'w-5 h-5'
    }
  };

  const styles = sizeStyles[size];
  const displayImages = imageUrls.slice(0, maxImages);
  const remainingCount = imageUrls.length - maxImages;

  const handleImageClick = (index: number) => {
    if (onClick) {
      onClick(imageUrls, index);
    }
  };

  return (
    <div className={`flex items-center ${styles.container} ${className}`}>
      <div className={`flex ${styles.grid}`}>
        {displayImages.map((url, index) => (
          <div
            key={index}
            className={`
              relative ${styles.image} rounded-md overflow-hidden bg-gray-100
              border border-gray-200 cursor-pointer group hover:shadow-md
              transition-all duration-200
            `}
            onClick={() => handleImageClick(index)}
            title={`이미지 ${index + 1} 보기`}
          >
            <img
              src={url}
              alt={`첨부 이미지 ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                // 이미지 로드 실패 시 플레이스홀더 표시
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.error-placeholder')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = `error-placeholder w-full h-full flex items-center justify-center bg-gray-100 text-gray-400`;
                  placeholder.innerHTML = `<svg class="${styles.iconSize}" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>`;
                  parent.appendChild(placeholder);
                }
              }}
            />
          </div>
        ))}

        {/* 추가 이미지 개수 표시 */}
        {remainingCount > 0 && (
          <div
            className={`
              ${styles.image} rounded-md bg-gray-800 bg-opacity-75
              flex items-center justify-center cursor-pointer
              hover:bg-opacity-60 transition-colors duration-200
            `}
            onClick={() => handleImageClick(maxImages)}
            title={`${remainingCount}개 이미지 더 보기`}
          >
            <div className="text-center text-white">
              <PhotoIcon className={`${styles.iconSize} mx-auto mb-1`} />
              <span className={`${styles.text} font-medium`}>
                +{remainingCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 이미지 개수 텍스트 (옵션) */}
      <div className={`ml-2 ${styles.text} text-gray-500`}>
        <PhotoIcon className={`${styles.iconSize} inline mr-1`} />
        {imageUrls.length}개
      </div>
    </div>
  );
});

PostImageThumbnail.displayName = 'PostImageThumbnail';

export default PostImageThumbnail;
