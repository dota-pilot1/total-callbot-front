import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { examApi } from '../features/exam/api/exam';

interface MobileTranslationDialogProps {
  open: boolean;
  onClose: () => void;
  text: string;
}

interface TranslationResponse {
  original: string;
  translation: string;
  language: string;
}

export default function MobileTranslationDialog({ 
  open, 
  onClose, 
  text 
}: MobileTranslationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<TranslationResponse | null>(null);
  const [error, setError] = useState<string>('');

  // 다이얼로그가 열릴 때 번역 요청
  useEffect(() => {
    if (open && text.trim()) {
      requestTranslation(text.trim());
    }
  }, [open, text]);

  const requestTranslation = async (textToTranslate: string) => {
    if (!textToTranslate || loading) return;
    
    setLoading(true);
    setError('');
    setTranslation(null);

    try {
      // examApi를 활용해서 번역 요청 (GPT 기반)
      const prompt = `Please translate the following text and provide both the original and Korean translation:

Text: "${textToTranslate}"

Please respond in this exact JSON format:
{
  "original": "original text here",
  "translation": "Korean translation here",
  "language": "detected language (English/Korean/etc)"
}`;

      const response = await examApi.getSampleAnswers({ 
        question: prompt, 
        topic: 'translation', 
        level: 'intermediate', 
        count: 1,
        englishOnly: false 
      });

      const result = response.samples?.[0]?.text || '';
      
      try {
        // JSON 파싱 시도
        const parsedResult = JSON.parse(result);
        setTranslation({
          original: parsedResult.original || textToTranslate,
          translation: parsedResult.translation || '번역을 생성할 수 없습니다.',
          language: parsedResult.language || 'Unknown'
        });
      } catch (parseError) {
        // JSON 파싱 실패 시 간단한 처리
        setTranslation({
          original: textToTranslate,
          translation: result || '번역을 생성할 수 없습니다.',
          language: 'Unknown'
        });
      }
    } catch (err) {
      console.error('Translation request failed:', err);
      setError('번역 요청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* 다이얼로그 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <LanguageIcon className="h-5 w-5 text-blue-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                번역 결과
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="닫기"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">번역 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => requestTranslation(text)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : translation ? (
              <div className="space-y-4">
                {/* 원문 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">원문</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {translation.language}
                    </span>
                  </div>
                  <p className="text-gray-900 leading-relaxed">
                    {translation.original}
                  </p>
                </div>

                {/* 번역 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">번역</h3>
                  <p className="text-blue-900 leading-relaxed">
                    {translation.translation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">번역할 텍스트가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}