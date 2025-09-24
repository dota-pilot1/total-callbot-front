import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui";
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { HeaderAuthControls } from "./HeaderAuthControls";
import { useAuthStore } from "../../features/auth";

interface BoardHeaderProps {
  title?: string;
  showWriteButton?: boolean;
  onWriteClick?: () => void;
  showBackButton?: boolean;
}

export default function BoardHeader({
  title = "📝 게시판",
  showWriteButton = true,
  onWriteClick,
  showBackButton = true,
}: BoardHeaderProps) {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { logout } = useAuthStore();

  const handleSettings = () => {
    console.log("설정 메뉴");
  };

  const handleWritePost = () => {
    if (onWriteClick) {
      onWriteClick();
    } else {
      navigate("/board/write");
    }
  };

  const handleBack = () => {
    navigate(-1); // 브라우저 히스토리에서 뒤로 가기
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 왼쪽 영역 - 뒤로가기 버튼 + 제목 */}
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">뒤로</span>
                </Button>
              )}

              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <span className="ml-2 text-sm text-gray-500">v1.0</span>
              </div>
            </div>

            {/* 데스크탑 메뉴 */}
            <div className="hidden md:flex items-center gap-2">
              {showWriteButton && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleWritePost}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">글쓰기</span>
                </Button>
              )}
              {/* 공통 로그인/로그아웃 컴포넌트 */}
              <HeaderAuthControls />
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMobileMenu}
                className="flex items-center gap-2"
              >
                {showMobileMenu ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 슬라이드 메뉴 */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* 슬라이드 메뉴 */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="fixed top-16 right-0 bottom-0 w-80 bg-white shadow-xl z-50 md:hidden"
            >
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  메뉴
                </h3>

                {/* 메뉴 섹션 */}
                <div className="space-y-2">
                  {showBackButton && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        handleBack();
                        setShowMobileMenu(false);
                      }}
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      뒤로 가기
                    </Button>
                  )}

                  {showWriteButton && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        handleWritePost();
                        setShowMobileMenu(false);
                      }}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      글쓰기
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSettings();
                      setShowMobileMenu(false);
                    }}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    설정
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    title="로그아웃"
                    aria-label="로그아웃"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span className="sr-only">로그아웃</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
