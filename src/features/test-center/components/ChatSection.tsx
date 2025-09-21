import { Button } from '../../../components/ui';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { ChatMessage } from '../types/exam';

interface ChatSectionProps {
  messages: ChatMessage[];
  chatMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export default function ChatSection({
  messages,
  chatMessage,
  onMessageChange,
  onSendMessage
}: ChatSectionProps) {

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="h-48 border-t-2 border-gray-200 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <h4 className="font-medium text-gray-900">실시간 채팅</h4>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm italic">
            채팅을 시작해보세요!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`text-sm ${msg.type === 'system' ? 'text-center' : ''}`}>
              {msg.type === 'chat' ? (
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-blue-600">{msg.userName}</span>
                    <span className="text-gray-500 text-xs">{msg.timestamp}</span>
                  </div>
                  <div className="text-gray-800">{msg.message}</div>
                </div>
              ) : (
                <div className="bg-gray-200 rounded-full px-3 py-1 inline-block text-gray-600 text-xs">
                  📢 {msg.message}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={200}
          />
          <Button
            onClick={onSendMessage}
            disabled={!chatMessage.trim()}
            size="sm"
            className="px-4 flex items-center gap-1"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            <span className="hidden sm:inline">전송</span>
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Enter로 전송 • {chatMessage.length}/200자
        </div>
      </div>
    </div>
  );
}
