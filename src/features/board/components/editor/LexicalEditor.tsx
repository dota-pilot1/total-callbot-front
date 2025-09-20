import React, { useCallback, useRef } from "react";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import type { EditorState, TextFormatType } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  ListItemNode,
  ListNode,
  $createListItemNode,
  $createListNode,
} from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

// 에디터 테마
const theme = {
  paragraph: "mb-2 text-gray-900 leading-relaxed",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    code: "bg-gray-100 px-1 py-0.5 rounded text-sm font-mono",
  },
  heading: {
    h1: "text-2xl font-bold mb-4",
    h2: "text-xl font-bold mb-3",
    h3: "text-lg font-bold mb-2",
  },
  list: {
    listitem: "ml-4 mb-1",
    ul: "list-disc ml-6 mb-4",
    ol: "list-decimal ml-6 mb-4",
  },
  quote: "border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4",
  code: "bg-gray-100 p-3 rounded font-mono text-sm mb-4 overflow-x-auto",
  link: "text-blue-600 hover:text-blue-800 underline",
};

// 툴바 컴포넌트
function ToolbarPlugin(): React.ReactElement {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = React.useState(new Set<string>());

  // 포맷 상태 업데이트
  const updateFormats = useCallback(() => {
    editor.read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const formats = new Set<string>();
        if (selection.hasFormat("bold")) formats.add("bold");
        if (selection.hasFormat("italic")) formats.add("italic");
        if (selection.hasFormat("underline")) formats.add("underline");
        if (selection.hasFormat("code")) formats.add("code");
        setActiveFormats(formats);
      }
    });
  }, [editor]);

  React.useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFormats();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateFormats]);

  // 포맷 토글 함수
  const toggleFormat = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  // 리스트 추가 함수
  const insertList = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const listNode = $createListNode("bullet");
        const listItemNode = $createListItemNode();
        listItemNode.append($createTextNode(""));
        listNode.append(listItemNode);
        selection.insertNodes([listNode]);
      }
    });
  };

  const toolbarItems = [
    {
      format: "bold" as TextFormatType,
      icon: BoldIcon,
      title: "굵게",
      shortcut: "Ctrl+B",
    },
    {
      format: "italic" as TextFormatType,
      icon: ItalicIcon,
      title: "기울임",
      shortcut: "Ctrl+I",
    },
    {
      format: "underline" as TextFormatType,
      icon: UnderlineIcon,
      title: "밑줄",
      shortcut: "Ctrl+U",
    },
    {
      format: "code" as TextFormatType,
      icon: CodeBracketIcon,
      title: "인라인 코드",
      shortcut: "Ctrl+E",
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
      {toolbarItems.map(({ format, icon: Icon, title, shortcut }) => (
        <button
          key={format}
          type="button"
          onClick={() => toggleFormat(format)}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors
            ${activeFormats.has(format) ? "bg-blue-100 text-blue-700" : "text-gray-600"}
          `}
          title={`${title} (${shortcut})`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={insertList}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
        title="불릿 리스트"
      >
        <ListBulletIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// 메인 에디터 인터페이스
interface LexicalEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  onChange,
  placeholder = "내용을 입력하세요...",
  error,
  disabled = false,
}) => {
  const isFirstRender = useRef(true);

  // 에디터 초기 설정
  const initialConfig: InitialConfigType = {
    namespace: "BoardEditor",
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
  };

  // 에디터 상태 변경 핸들러 - 단순화된 버전
  const handleChange = useCallback(
    (editorState: EditorState) => {
      // 첫 번째 렌더링에서는 onChange 호출하지 않음
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();

        // 텍스트 컨텐츠만 전달 (HTML 없이)
        onChange(textContent);
      });
    },
    [onChange],
  );

  return (
    <div className="space-y-1">
      <LexicalComposer initialConfig={initialConfig}>
        <div
          className={`
          border rounded-lg overflow-hidden
          ${error ? "border-red-300" : "border-gray-300"}
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
        >
          <ToolbarPlugin />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="min-h-32 max-h-96 overflow-y-auto p-4 outline-none resize-none"
                  style={{ wordBreak: "break-word" }}
                />
              }
              placeholder={
                <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>

        <OnChangePlugin onChange={handleChange} />
        <HistoryPlugin />
      </LexicalComposer>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
