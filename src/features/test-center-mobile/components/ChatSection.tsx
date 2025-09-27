import { type FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../../../components/ui";
import { Textarea } from "../../../components/ui/textarea";
import type { ChatMessage } from "../types/exam";

export interface ChatSectionProps {
  messages: ChatMessage[];
  chatMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

export default function ChatSection({
  messages,
  chatMessage,
  onMessageChange,
  onSendMessage,
}: ChatSectionProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSendMessage();
  };

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">채팅</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-4">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">
              아직 메시지가 없습니다.
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    {message.userName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {message.timestamp}
                  </span>
                  {message.type === "system" && (
                    <span className="text-xs text-blue-600">시스템</span>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {message.message}
                </p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={chatMessage}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder="메시지를 입력하세요"
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!chatMessage.trim()}>
              전송
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
