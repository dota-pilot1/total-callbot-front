import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";
import { chatApi } from "../features/chat/api/chat";
import { PaperAirplaneIcon, CogIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
// no solid icons needed currently
import { voiceApi } from "../features/voice/api/voice";
import {
  connectRealtimeVoice,
  type VoiceConnection,
} from "../features/voice/lib/realtime";
import VoicePulse from "../components/VoicePulse";
import MobileSettingsDropdown from "../components/MobileSettingsDropdown";
import { examApi } from "../features/exam/api/exam";
import MobileModelAnswerDialog from "../components/MobileModelAnswerDialog";

export default function MobileChat() {
  const { logout, getUser } = useAuthStore();
  
  // 사용자 정보 상태
  const [user, setUser] = useState(getUser());
  
  // 컴포넌트 마운트 시 사용자 정보 확인
  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, [getUser]);

  // 기본 챗봇 설정 (선택 없이 바로 연결)
  const defaultChatbot = {
    id: "total-callbot",
    name: "Total Callbot",
    description: "AI 음성 대화 전문 어시스턴트",
    color: "from-indigo-500 to-purple-600",
  };

  // 캐릭터/목소리 프리셋 (목소리만 선택 가능)
  const CHARACTER_PRESETS = [
    { id: 'buddy', name: '버디', emoji: '🤖', color: 'from-indigo-500 to-purple-600', defaultVoice: 'verse' },
    { id: 'sage', name: '세이지', emoji: '🧠', color: 'from-emerald-500 to-teal-600', defaultVoice: 'sage' },
    { id: 'spark', name: '스파크', emoji: '⚡️', color: 'from-amber-500 to-orange-600', defaultVoice: 'alloy' },
  ] as const;
  const VOICE_OPTIONS = ['verse', 'alloy', 'sage'] as const;

  // 채팅 관련 상태
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isIMEComposing, setIsIMEComposing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 음성 관련 상태
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceConn, setVoiceConn] = useState<VoiceConnection | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  
  // 설정 관련 상태
  const [speechLang, setSpeechLang] = useState<"auto" | "ko" | "en">("auto");
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(false);
  const [coalesceDelayMs, setCoalesceDelayMs] = useState(800);
  const [debugEvents, setDebugEvents] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [examSending, setExamSending] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  // Model answers dialog state (mobile)
  const [answersOpen, setAnswersOpen] = useState(false);
  const [answersQuestion, setAnswersQuestion] = useState<string>("");
  const [answersTopic, _setAnswersTopic] = useState<string | undefined>(undefined);
  const [answersLevel, _setAnswersLevel] = useState<string | undefined>(undefined);

  // 캐릭터/음성 선택 상태
  const [selectedCharacterId, setSelectedCharacterId] = useState<(typeof CHARACTER_PRESETS)[number]['id']>(CHARACTER_PRESETS[0].id);
  const [selectedVoice, setSelectedVoice] = useState<string>(CHARACTER_PRESETS[0].defaultVoice);

  // 캐릭터 변경 시 기본 음성 동기화
  useEffect(() => {
    const c = CHARACTER_PRESETS.find(c => c.id === selectedCharacterId) || CHARACTER_PRESETS[0];
    setSelectedVoice(c.defaultVoice);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCharacterId]);

  // 현재 선택된 캐릭터 메타
  const currentCharacter = (CHARACTER_PRESETS.find(c => c.id === selectedCharacterId) || CHARACTER_PRESETS[0]);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userPartialRef = useRef<string>("");
  const assistantPartialRef = useRef<string>("");
  const lastUserFinalRef = useRef<string>("");
  const lastAssistantFinalRef = useRef<string>("");

  // 텍스트 정규화 함수
  const normalizeText = (s: string) => {
    try {
      if (!s || typeof s !== 'string') return '';
      let normalized = s.normalize("NFC");
      normalized = normalized.replace(/[\uFFFD\u0000-\u001F]/g, "");
      normalized = normalized.replace(/\s+/g, " ").trim();
      return normalized;
    } catch (error) {
      console.warn('텍스트 정규화 실패:', error);
      return (s || "").trim();
    }
  };

  // 자동 스크롤
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }, [messages]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    const userMessage = {
      id: messages.length + 1,
      sender: "user" as const,
      message: normalizeText(messageContent),
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text" as const,
    };

    setMessages((prev) => [...prev, userMessage]);

    // 실시간 음성 연결이 있으면 전송
    try {
      if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
        voiceConn.dc.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text: userMessage.message }],
            },
          }),
        );
        voiceConn.dc.send(
          JSON.stringify({
            type: "response.create",
            response: { modalities: ["audio", "text"], conversation: "auto", voice: selectedVoice },
          }),
        );
        return;
      }
    } catch (e) {
      console.error("Realtime 텍스트 전송 실패:", e);
    }

    // 시뮬레이션 응답
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: "callbot" as const,
        message: `"${messageContent}"에 대해 답변드리겠습니다. 백엔드 개발 관점에서 도움을 드릴 수 있습니다.`,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text" as const,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  // toggleConnection 함수 제거됨 - 더 이상 사용하지 않음

  // 음성 시작
  const startVoice = async () => {
    if (voiceConn) return;
    try {
      const session = await voiceApi.createSession({ lang: speechLang, voice: selectedVoice });
      const conn = await connectRealtimeVoice({
        token: session.token,
        model: session.model,
        audioElement: audioRef.current,
        voice: selectedVoice,
        audioConstraints: {
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          channelCount: 1,
        },
        onEvent: (evt) => {
          const e: any = evt as any;
          const t = e?.type as string | undefined;
          if (t === "input_audio_buffer.speech_started") setIsListening(true);
          if (t === "input_audio_buffer.speech_stopped") setIsListening(false);
          if (t === "output_audio_buffer.started") setIsResponding(true);
          if (t === "response.done" || t === "output_audio_buffer.stopped")
            setIsResponding(false);
        },
        onUserTranscript: (text, isFinal) => {
          if (isFinal) {
            const finalText = normalizeText(text.trim());
            if (finalText && finalText !== normalizeText(lastUserFinalRef.current)) {
              setMessages((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  sender: 'user' as const,
                  message: finalText,
                  timestamp: new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  type: 'text' as const,
                },
              ]);
              lastUserFinalRef.current = finalText;
            }
          }
        },
        onAssistantText: (text, isFinal) => {
          if (isFinal) {
            const finalText = normalizeText(assistantPartialRef.current || text);
            const normalizedFinal = normalizeText(finalText);
            const normalizedLast = normalizeText(lastAssistantFinalRef.current);
            if (normalizedFinal && normalizedFinal !== normalizedLast) {
              setMessages((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  sender: "callbot" as const,
                  message: finalText,
                  timestamp: new Date().toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  type: "text" as const,
                },
              ]);
              lastAssistantFinalRef.current = finalText.trim();
            }
            assistantPartialRef.current = "";
          } else {
            assistantPartialRef.current += text;
          }
        },
      });
      setVoiceConn(conn);
      setIsRecording(true);
    } catch (e) {
      console.error("음성 연결 실패:", e);
    }
  };

  // 음성 정지
  const stopVoice = () => {
    try {
      voiceConn?.stop();
    } catch {}
    setVoiceConn(null);
    setIsRecording(false);
  };

  // 시험 주제 목록 (영/한)
  const EXAM_TOPICS = [
    { id: 1,  en: 'Personal statement & career goals',            ko: '개인 소개와 진로 목표' },
    { id: 2,  en: 'Job interview (behavioral & technical)',       ko: '면접(행동/기술)' },
    { id: 3,  en: 'Project explanation & trade-offs',             ko: '프로젝트 설명과 트레이드오프' },
    { id: 4,  en: 'Technical troubleshooting & root cause',       ko: '기술 트러블슈팅과 원인 분석' },
    { id: 5,  en: 'Data interpretation (charts/tables)',          ko: '데이터 해석(차트/표 설명)' },
    { id: 6,  en: 'Product pitch & sales',                        ko: '제품 피치/세일즈' },
    { id: 7,  en: 'Customer support escalation',                  ko: '고객 지원/에스컬레이션' },
    { id: 8,  en: 'Negotiation & compromise',                     ko: '협상과 타협' },
    { id: 9,  en: 'Meeting facilitation & action items',          ko: '회의 진행과 액션아이템 정리' },
    { id: 10, en: 'Cross-cultural communication',                 ko: '다문화 커뮤니케이션' },
    { id: 11, en: 'Ethical dilemma discussion',                   ko: '윤리적 딜레마 토론' },
    { id: 12, en: 'Crisis communication & apology',               ko: '위기 커뮤니케이션/사과' },
    { id: 13, en: 'Email etiquette & drafting',                   ko: '이메일 에티켓/작성' },
    { id: 14, en: 'Presentation Q&A handling',                    ko: '발표 질의응답 대응' },
    { id: 15, en: 'Travel & immigration interview',               ko: '여행/출입국 인터뷰' },
    { id: 16, en: 'Healthcare/doctor consultation',               ko: '병원/의료 상담' },
    { id: 17, en: 'Banking & finance appointment',                ko: '은행/금융 상담' },
    { id: 18, en: 'Academic discussion & summarization',          ko: '학술 토론과 요약' },
    { id: 19, en: 'News summary & opinion',                       ko: '뉴스 요약과 의견' },
    { id: 20, en: 'Remote collaboration tools & process',         ko: '원격 협업 도구/프로세스' },
  ] as const;

  // Exam sequence: instruct assistant to run a 5-question quiz and scoring (bilingual questions)
  const buildExamPrompt = (topic: typeof EXAM_TOPICS[number]) => {
    const header = [
      `[KO] 이번 시험 주제: ${topic.ko}`,
      `[EN] Selected topic: ${topic.en}`,
      '',
      '[EN] This is an English academy oral placement test. Strict grading applies.',
      '[KO] 영어학원 입학 구술 시험입니다. 매우 엄격하게 채점합니다.',
      '[EN] You will receive a total of 5 questions.',
      '[KO] 총 5문항으로 진행됩니다.',
      '',
    ];
    const format = [
      'Format / 형식:',
      '- Ask exactly 5 questions SEQUENTIALLY.',
      '- Each question MUST be bilingual on two lines: first [EN] then [KO] (clear Korean translation).',
      '  예:',
      '  Q1/5:',
      '  [EN] Describe a time you resolved a conflict in a team.',
      '  [KO] 팀 내 갈등을 해결했던 경험을 설명해 주세요.',
      '',
      '- At the beginning of every question, prefix with "QX/5:" (e.g., "Q1/5:").',
      '- DO NOT include any evaluation text (e.g., Score/Rationale/feedback) during the questions.',
      '- After the user answers Q1, send only Q2 (no evaluation). Repeat until Q5 is completed.',
      '- Keep a clear separation between messages so that a question is never merged with evaluation content.',
      '',
      'Level selection / 난이도 선택:',
      '- BEFORE Q1/5, ask the tester to choose their level among exactly THREE options: Absolute Beginner(완전 초보), Beginner(초보), Intermediate(중급).',
      '- Wait for their answer; if no reply within 20 seconds, default to Beginner(초보).',
      '- Confirm the chosen level and ADAPT the question difficulty accordingly (vocabulary/structures/examples).',
      '',
    ];
    const grading = [
      'Grading / 채점 기준:',
      '- Scoring is performed ONLY AFTER all 5 answers are received.',
      '- Provide a final evaluation with per-question scores (1–10 each, no 0) and a total out of 50.',
      '- Deduct points for grammar errors, pronunciation issues, unnatural phrasing, limited vocabulary, weak content, or poor task response.',
      '- Criteria: Fluency, Pronunciation, Grammar, Vocabulary range, Comprehension/Task response.',
      '',
      'Silence handling / 무응답 처리:',
      '- If the user provides no answer for 20 seconds, politely move to the next question; mark that question low in the final evaluation.',
      '- 사용자가 20초 내에 아무 대답도 하지 않으면 정중히 다음 문제로 넘어가고, 최종 평가에서 해당 문항은 낮은 점수로 처리하세요.',
      '',
    ];
    const closing = [
      'Final summary / 최종 요약 (only after Q5 answer):',
      '- Scores by question: Q1 X/10, Q2 X/10, Q3 X/10, Q4 X/10, Q5 X/10',
      '- Total: NN/50',
      '- Level: Level 1–10 (examples)',
      '  • Level 1: 초등학생 수준',
      '  • Level 5: 일상 대화 기본 가능',
      '  • Level 7: 업무 커뮤니케이션 가능',
      '  • Level 9: 원어민 수준',
      '  • Level 10: 동시통역사 수준',
      '- Key phrases to study (8–12): list with "- " bullets, each on a new line.',
      '- References: brief docs/links/keywords as "- " bullets.',
      '',
      'Formatting / 가독성:',
      '- Use clear paragraph breaks: questions are separate from the final evaluation. Do NOT merge them into one message.',
      '- Keep responses concise in voice mode; focus on essentials.',
    ];
    return [...header, ...format, ...grading, ...closing].join('\\n');
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const ensureConnectedAndReady = async () => {
    // Ensure chat room joined
    if (!isConnected) {
      setIsConnecting(true);
      try {
        const chatRoomData = await chatApi.getOrCreateChatRoom({
          chatbotId: defaultChatbot.id,
          chatbotName: defaultChatbot.name,
        });
        await chatApi.joinChatRoom(chatRoomData.id);
        setIsConnected(true);
      } catch (e) {
        console.error('방 참여 실패:', e);
        setIsConnecting(false);
        throw e;
      }
      setIsConnecting(false);
    }

    // Ensure voice connection
    if (!voiceEnabled || !voiceConn) {
      setVoiceEnabled(true);
      await startVoice();
    }

    // Wait for data channel open
    for (let i = 0; i < 20; i++) {
      if (voiceConn?.dc && voiceConn.dc.readyState === 'open') return;
      await sleep(200);
    }
    // last attempt if state lagged
    if (!(voiceConn?.dc && voiceConn.dc.readyState === 'open')) {
      throw new Error('데이터 채널이 준비되지 않았습니다');
    }
  };

  const triggerExam = async () => {
    try {
      if (examSending) return;
      setExamSending(true);
      await ensureConnectedAndReady();
    } catch (e) {
      alert('연결에 실패했습니다. 마이크 권한 또는 네트워크 상태를 확인해주세요.');
      return;
    }

    const topic = EXAM_TOPICS[Math.floor(Math.random() * EXAM_TOPICS.length)];
    const prompt = buildExamPrompt(topic);
    try {
      setMessages((prev) => ([
        ...prev,
        {
          id: prev.length + 1,
          sender: 'callbot' as const,
          message: `이번 시험 주제: ${topic.ko}\n총 5문항으로 진행됩니다.`,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          type: 'text' as const,
        },
      ]));
    } catch {}
    try {
      // Add user instruction into the conversation for traceability
      voiceConn!.dc.send(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: prompt }],
          },
        })
      );
      // Ask assistant to respond (audio + text) using current voice
      voiceConn!.dc.send(
        JSON.stringify({
          type: 'response.create',
          response: { modalities: ['audio', 'text'], conversation: 'auto', voice: selectedVoice },
        })
      );
    } catch (e) {
      console.error('Exam 트리거 실패:', e);
      alert('Exam 지시를 전송하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setExamSending(false);
    }
  };

  // 녹음 토글
  const toggleRecording = () => {
    if (!isConnected || !voiceEnabled) return;
    if (isRecording) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  // 채팅 지우기
  const handleClearChat = () => {
    setMessages([]);
    lastUserFinalRef.current = "";
    lastAssistantFinalRef.current = "";
    assistantPartialRef.current = "";
    userPartialRef.current = "";
  };
  // AI 제안: 모범답안 엔진을 이용해 1개 제안을 받아 인풋에 채우기
  const handleSuggestReply = async () => {
    if (suggestLoading) return;
    const rev = [...messages].reverse();
    const lastBot = rev.find(m => m.sender === 'callbot')?.message || '';
    const lastUsr = rev.find(m => m.sender === 'user')?.message || '';
    if (!lastBot && !lastUsr) return;
    try {
      setSuggestLoading(true);
      setNewMessage('');
      const question = (lastBot || lastUsr || '').trim();
      const resp = await examApi.getSampleAnswers({ question, topic: 'conversation', level: 'intermediate', count: 1, englishOnly: true });
      const text = (resp.samples?.[0]?.text || '').trim();
      if (text) setNewMessage(text);
    } catch (e) {
      console.error('Suggest reply failed (sample-answers):', e);
    } finally {
      setSuggestLoading(false);
    }
  };
  const openModelAnswers = (questionText: string) => {
    setAnswersQuestion(questionText);
    setAnswersOpen(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Hidden audio sink for AI voice */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />
      
      {/* 고정 헤더 */}
      <div className="bg-white shadow-sm border-b flex-shrink-0 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${currentCharacter.color || defaultChatbot.color} rounded-full flex items-center justify-center`}>                
                <span className="text-xl" aria-label={currentCharacter.name} title={currentCharacter.name}>
                  {currentCharacter.emoji || '🤖'}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {defaultChatbot.name}
                </h1>
                <p className="text-xs text-gray-600">
                  {user?.name ? `${user.name}님` : user?.email ? `${user.email}님` : "로그인된 사용자"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <CogIcon className="h-5 w-5 text-gray-600" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Logout button clicked in MobileChat");
                  logout();
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 챗봇 정보 및 연결 상태 */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="text-center">
          {/* <p className="text-sm text-gray-600 mb-3">{defaultChatbot.description}</p> */}
          
          {/* 연결 상태 */}
          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium mb-3 ${
            isConnected 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : isConnecting 
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse" 
                : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500" : "bg-gray-400"
            }`}></div>
            {isConnecting ? "연결중..." : isConnected ? "연결됨" : "연결 대기중"}
          </div>

          {/* 음성 시작 버튼 또는 파동 표시 */}
          <div className="flex justify-center items-center space-x-4">
            {voiceEnabled && isRecording ? (
              <>
                {/* 음성 파동 표시 */}
                <div className="bg-white rounded-full p-4 shadow-lg border border-gray-200">
                  <VoicePulse active={isListening || isResponding} size={48} />
                </div>
                
                {/* 중단 버튼 */}
                <button
                  onClick={() => {
                    stopVoice();
                    setVoiceEnabled(false);
                    setIsConnected(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-colors"
                  title="음성 연결 중단"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Exam 버튼 (녹음 중에도 가능) */}
                <Button
                  onClick={triggerExam}
                  variant="outline"
                  className="px-5 py-3"
                  disabled={isConnecting || examSending}
                >
                  {examSending ? 'Sending...' : 'Exam'}
                </Button>
              </>
            ) : (
              <>
              {/* Start 버튼 */}
              <Button
                onClick={async () => {
                  if (!isConnected) {
                    // 먼저 연결
                    setIsConnecting(true);
                    try {
                      const chatRoomData = await chatApi.getOrCreateChatRoom({
                        chatbotId: defaultChatbot.id,
                        chatbotName: defaultChatbot.name,
                      });
                      await chatApi.joinChatRoom(chatRoomData.id);
                      setIsConnected(true);
                    } catch (error) {
                      console.error("방 참여 실패:", error);
                      alert("채팅방 참여에 실패했습니다.");
                      setIsConnecting(false);
                      return;
                    }
                    setIsConnecting(false);
                  }
                  
                  // 음성 시작
                  if (!voiceEnabled) {
                    setVoiceEnabled(true);
                    await startVoice();
                  }
                }}
                variant="default"
                className="px-8 py-3 text-lg"
                disabled={isConnecting}
              >
                {isConnecting ? "연결중..." : "Start"}
              </Button>
              </>
            )}
          </div>

          {/* 음성 상태 표시 */}
          {voiceEnabled && isRecording && (
            <div className={`flex items-center justify-center space-x-2 text-sm mt-3 ${
              isListening 
                ? "text-red-600" 
                : isResponding 
                  ? "text-blue-600" 
                  : "text-gray-500"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isListening 
                  ? "bg-red-500 animate-pulse" 
                  : isResponding 
                    ? "bg-blue-500 animate-pulse" 
                    : "bg-gray-400"
              }`}></div>
              <span>
                {isListening ? "듣는 중..." : isResponding ? "응답 중..." : "대기 중"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">대화를 시작해 보세요!</p>
            <p className="text-sm">음성으로 말하거나 아래 입력창을 사용하세요.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg ${message.sender === "user" ? "bg-indigo-500 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className={`text-xs ${message.sender === "user" ? "text-indigo-100" : "text-gray-500"}`}>{message.timestamp}</p>
                  {message.sender !== 'user' && (
                    <button onClick={() => openModelAnswers(message.message)} className="ml-3 text-xs px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50" title="답변 예시 보기">답변 예시</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      {isConnected && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* 챗봇 제안 버튼 (마이크 대신) */}
            <button
              onClick={handleSuggestReply}
              className={`p-3 rounded-full transition-colors ${suggestLoading ? 'bg-indigo-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              title="AI가 다음 답변을 제안합니다"
              disabled={suggestLoading}
            >
              <SparklesIcon className="h-5 w-5" />
            </button>

            {/* 텍스트 입력 */}
            <div className="flex-1 flex items-center space-x-2">
              <textarea
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onCompositionStart={() => setIsIMEComposing(true)}
                onCompositionEnd={() => setIsIMEComposing(false)}
                onKeyDown={(e) => {
                  const anyEvt = e.nativeEvent as any;
                  const composing = isIMEComposing || anyEvt?.isComposing || anyEvt?.keyCode === 229;
                  if (e.key === "Enter" && !e.shiftKey && !composing) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={suggestLoading ? "AI 응답 생성 중…" : "메시지를 입력하세요..."}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                style={{ minHeight: '4.5rem' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                className="px-3"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 설정 드롭다운 */}
      <MobileSettingsDropdown
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        // 캐릭터/목소리 선택 관련
        characterOptions={CHARACTER_PRESETS.map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={(id: string) => setSelectedCharacterId(id as (typeof CHARACTER_PRESETS)[number]['id'])}
        voiceOptions={[...VOICE_OPTIONS]}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        voiceEnabled={voiceEnabled}
        onVoiceEnabledChange={setVoiceEnabled}
        speechLang={speechLang}
        onSpeechLangChange={setSpeechLang}
        echoCancellation={echoCancellation}
        onEchoCancellationChange={setEchoCancellation}
        noiseSuppression={noiseSuppression}
        onNoiseSuppressionChange={setNoiseSuppression}
        autoGainControl={autoGainControl}
        onAutoGainControlChange={setAutoGainControl}
        coalesceDelayMs={coalesceDelayMs}
        onCoalesceDelayChange={setCoalesceDelayMs}
        debugEvents={debugEvents}
        onDebugEventsChange={setDebugEvents}
        onClearChat={handleClearChat}
      />

      {/* Model Answers Dialog (mobile) */}
      <MobileModelAnswerDialog
        open={answersOpen}
        onClose={() => setAnswersOpen(false)}
        question={answersQuestion}
        topic={answersTopic}
        level={answersLevel}
      />
    </div>
  );
}
