import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../shared/chatbot-utils/messaging/model/chatStore";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { categories } from "./data/categories";
import { chatbots } from "./data/chatbots";
import { getChatbotHomeRoute } from "../lib/chatbotRoute";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const {} = useChatStore();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const chatbotHomeRoute = useMemo(getChatbotHomeRoute, []);

  const toggleCategory = (categoryId: string) => {
    if (collapsed) {
      // 축소된 상태에서는 사이드바를 펼치고 해당 카테고리 열기
      onToggle();
      setOpenCategories([categoryId]); // 해당 카테고리만 열기
      return;
    }

    // 펼쳐진 상태에서는 클릭한 카테고리만 열리고 나머지는 닫기
    setOpenCategories(
      (prev) =>
        prev.includes(categoryId)
          ? [] // 이미 열린 카테고리를 클릭하면 모두 닫기
          : [categoryId], // 새로운 카테고리만 열기
    );
    // 카테고리는 단순 토글 역할만 함 - 봇 선택 상태는 유지
  };

  const groupedChatbots = categories.map((category) => ({
    ...category,
    bots: chatbots.filter((bot) => bot.category === category.id),
  }));

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative bg-card border-r border-border shadow-sm flex flex-col h-full"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <h2 className="text-lg font-semibold text-gray-900">전문 챗봇</h2>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 네비게이션 */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          {collapsed ? (
            // 축소된 상태: 카테고리 아이콘만 표시
            <div className="space-y-2">
              {categories.map((category) => {
                const CategoryIcon = category.icon;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      onToggle(); // 사이드바 펼치기
                      setOpenCategories([category.id]); // 해당 카테고리만 열기 (독점적)
                    }}
                    className="relative group flex items-center justify-center w-full px-3 py-3 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  >
                    <CategoryIcon className="h-5 w-5 flex-shrink-0" />

                    {/* 간단한 카테고리 툴팁 */}
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2">
                      {category.name} - {category.description}
                      {/* 툴팁 화살표 */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 -mr-1"></div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // 펼쳐진 상태: 기존 전체 카테고리 구조
            groupedChatbots.map((category) => {
              const CategoryIcon = category.icon;
              const isOpen = openCategories.includes(category.id);
              // 카테고리 하이라이트 효과 완전 제거
              const shouldHighlight = false;

              return (
                <div key={category.id}>
                  {/* 카테고리 헤더 */}
                  <motion.button
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors relative group hover:bg-muted/30 ${
                      isOpen ? "bg-muted/40 text-foreground" : shouldHighlight ? "text-foreground" : "text-muted-foreground"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <CategoryIcon
                        className={`h-5 w-5 flex-shrink-0 ${isOpen ? "text-foreground" : shouldHighlight ? "text-foreground" : "text-muted-foreground"}`}
                      />
                      <span className="truncate flex-1">{category.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${isOpen ? "text-foreground bg-muted/50" : shouldHighlight ? "text-foreground bg-muted/40" : "text-muted-foreground bg-muted/20"}`}
                      >
                        {category.bots.length}
                      </span>
                    </div>

                    {/* 간단한 텍스트 툴팁 */}
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2">
                      {category.description}
                      {/* 툴팁 화살표 */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 -mr-1"></div>
                    </div>
                  </motion.button>

                  {/* 챗봇 목록 */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-1 space-y-1 overflow-hidden"
                      >
                        {category.bots.map((bot) => {
                          const BotIcon = bot.icon;
                          const isActive = selectedBot === bot.id;

                          const handleBotClick = (e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // 봇 선택 및 채팅 페이지로 이동
                            setSelectedBot(bot.id);
                            navigate(`/chat/bot/${bot.id}`, {
                              state: {
                                chatbot: {
                                  ...bot,
                                  icon: undefined, // 컴포넌트 아이콘 제외
                                },
                              },
                            });
                          };

                          return (
                            <button
                              key={bot.id}
                              onClick={handleBotClick}
                              className={`relative group flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-md transition-all duration-200 text-left border ${
                                isActive
                                  ? "border-primary bg-muted/60 text-foreground ring-1 ring-primary/30"
                                  : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:border-border"
                              }`}
                            >
                              <span className={`h-7 w-7 rounded-full flex items-center justify-center ${isActive ? "bg-primary/10" : "bg-muted/30"}`}>
                                <BotIcon className="h-4 w-4 flex-shrink-0" />
                              </span>
                              <span className="truncate">{bot.name}</span>

                              {/* 간단한 봇 툴팁 */}
                              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2">
                                {bot.description}
                                {/* 툴팁 화살표 */}
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 -mr-1"></div>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </nav>
      </div>

      {/* 푸터 */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-border"
          >
            <Link
              to={chatbotHomeRoute}
              className="flex items-center justify-center w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-colors border border-transparent hover:border-border"
            >
              📋 챗봇 목록으로
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
