import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import FullScreenSlideDialog from '@/components/ui/FullScreenSlideDialog';
import { PlusIcon, UsersIcon, ClockIcon, HashtagIcon } from '@heroicons/react/24/outline';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: CreateRoomData) => void;
}

export interface CreateRoomData {
  title: string;
  description: string;
  hostNickname: string;
  maxParticipants: number;
  questionCount: number;
  timePerQuestion: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: 'GENERAL' | 'BUSINESS' | 'TRAVEL' | 'DAILY_LIFE' | 'ACADEMIC';
}

const difficultyOptions = [
  { value: 'BEGINNER', label: '쉬움', description: '기초적인 영어 표현' },
  { value: 'INTERMEDIATE', label: '보통', description: '일반적인 영어 회화' },
  { value: 'ADVANCED', label: '어려움', description: '고급 영어 표현' }
] as const;

const categoryOptions = [
  { value: 'GENERAL', label: '일반', description: '다양한 주제의 영어' },
  { value: 'BUSINESS', label: '비즈니스', description: '업무 관련 영어' },
  { value: 'TRAVEL', label: '여행', description: '여행 상황 영어' },
  { value: 'DAILY_LIFE', label: '일상', description: '일상생활 영어' },
  { value: 'ACADEMIC', label: '학술', description: '학문적 영어' }
] as const;

export default function CreateRoomDialog({ isOpen, onClose, onCreateRoom }: CreateRoomDialogProps) {
  const [formData, setFormData] = useState<CreateRoomData>({
    title: '',
    description: '',
    hostNickname: '',
    maxParticipants: 6,
    questionCount: 10,
    timePerQuestion: 30,
    difficulty: 'INTERMEDIATE',
    category: 'GENERAL'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateRoomData>>({});

  const handleInputChange = (field: keyof CreateRoomData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 입력 시 해당 필드 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateRoomData> = {};

    if (!formData.title.trim()) {
      newErrors.title = '퀴즈방 제목을 입력해주세요.';
    } else if (formData.title.length > 50) {
      newErrors.title = '제목은 50자 이내로 입력해주세요.';
    }

    if (!formData.hostNickname.trim()) {
      newErrors.hostNickname = '닉네임을 입력해주세요.';
    } else if (formData.hostNickname.length > 20) {
      newErrors.hostNickname = '닉네임은 20자 이내로 입력해주세요.';
    }

    if (formData.maxParticipants < 2 || formData.maxParticipants > 20) {
      newErrors.maxParticipants = 2;
    }

    if (formData.questionCount < 5 || formData.questionCount > 50) {
      newErrors.questionCount = 5;
    }

    if (formData.timePerQuestion < 10 || formData.timePerQuestion > 120) {
      newErrors.timePerQuestion = 10;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreateRoom(formData);
      onClose();
      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        hostNickname: '',
        maxParticipants: 6,
        questionCount: 10,
        timePerQuestion: 30,
        difficulty: 'INTERMEDIATE',
        category: 'GENERAL'
      });
    } catch (error) {
      console.error('방 생성 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="새 퀴즈방 만들기"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PlusIcon className="h-5 w-5 text-primary" />
                기본 정보
              </h3>

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  퀴즈방 제목 *
                </label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('title', e.target.value)
                  }
                  placeholder="예: 영어 단어 퀴즈 대결!"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  설명 (선택)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="퀴즈방에 대한 간단한 설명을 작성해주세요."
                  rows={3}
                  maxLength={200}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/200
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="hostNickname" className="text-sm font-medium text-foreground">
                  내 닉네임 *
                </label>
                <Input
                  id="hostNickname"
                  type="text"
                  value={formData.hostNickname}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('hostNickname', e.target.value)
                  }
                  placeholder="퀴즈방에서 사용할 닉네임"
                  className={errors.hostNickname ? 'border-destructive' : ''}
                />
                {errors.hostNickname && (
                  <p className="text-sm text-destructive">{errors.hostNickname}</p>
                )}
              </div>
            </div>

            {/* 퀴즈 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <HashtagIcon className="h-5 w-5 text-primary" />
                퀴즈 설정
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="maxParticipants" className="text-sm font-medium text-foreground">
                    최대 참여자 수
                  </label>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="maxParticipants"
                      type="number"
                      min={2}
                      max={20}
                      value={formData.maxParticipants}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          'maxParticipants',
                          Number.parseInt(e.target.value, 10)
                        )
                      }
                    />
                    <span className="text-sm text-muted-foreground">명</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="questionCount" className="text-sm font-medium text-foreground">
                    문제 개수
                  </label>
                  <Input
                    id="questionCount"
                    type="number"
                    min={5}
                    max={50}
                    value={formData.questionCount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        'questionCount',
                        Number.parseInt(e.target.value, 10)
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="timePerQuestion" className="text-sm font-medium text-foreground">
                    문제당 시간
                  </label>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="timePerQuestion"
                      type="number"
                      min={10}
                      max={120}
                      step={5}
                      value={formData.timePerQuestion}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          'timePerQuestion',
                          Number.parseInt(e.target.value, 10)
                        )
                      }
                    />
                    <span className="text-sm text-muted-foreground">초</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="difficulty" className="text-sm font-medium text-foreground">
                    난이도
                  </label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      handleInputChange('difficulty', e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  카테고리
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange('category', e.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* 하단 버튼 */}
        <div className="border-t border-border p-6 bg-card">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  퀴즈방 만들기
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </FullScreenSlideDialog>
  );
}
