import { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import {
  StandardCard,
  StandardButton,
  VStack,
  HStack,
} from "../../../components/ui";
import type { IntervalListeningSettings } from "../types";

interface AudioPlayerProps {
  text: string;
  settings: IntervalListeningSettings;
  onPlaybackComplete?: () => void;
  onPlayCountChange?: (count: number) => void;
  disabled?: boolean;
}

export function AudioPlayer({
  text,
  settings,
  onPlaybackComplete,
  onPlayCountChange,
  disabled = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = () => {
    if (!text || disabled) return;

    // 기존 음성 중지
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.audioSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      const newCount = playCount + 1;
      setPlayCount(newCount);
      onPlayCountChange?.(newCount);
      onPlaybackComplete?.();

      // 자동 반복 설정이 켜져있으면 다시 재생
      if (settings.autoRepeat && newCount < 3) {
        setTimeout(() => {
          speak();
        }, settings.playbackDelay * 1000);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const resetPlayCount = () => {
    setPlayCount(0);
    onPlayCountChange?.(0);
  };

  useEffect(() => {
    if (settings.autoPlay && text && !disabled) {
      speak();
    }
  }, [text, settings.autoPlay, disabled]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <StandardCard padding="lg">
      <VStack size="lg">
        {/* 오디오 텍스트 */}
        {settings.showTranscript && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">오디오 텍스트:</p>
            <p className="text-foreground leading-relaxed">{text}</p>
          </div>
        )}

        {/* 컨트롤 버튼들 */}
        <div className="flex items-center justify-center">
          <HStack size="md">
            <StandardButton
              variant="outline"
              height="md"
              onClick={resetPlayCount}
              disabled={disabled || playCount === 0}
              icon={<ArrowPathIcon />}
            >
              리셋
            </StandardButton>

            <StandardButton
              variant="default"
              height="lg"
              onClick={isPlaying ? stopSpeaking : speak}
              disabled={disabled}
              className="px-8"
              icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            >
              {isPlaying ? "정지" : "재생"}
            </StandardButton>

            <div className="text-sm text-muted-foreground min-w-[60px] text-center">
              재생 {playCount}회
            </div>
          </HStack>
        </div>

        {/* 설정 정보 */}
        <VStack size="xs" className="text-xs text-muted-foreground text-center">
          <div>재생 속도: {settings.audioSpeed}x</div>
          {settings.autoRepeat && (
            <div>자동 반복: {settings.playbackDelay}초 간격</div>
          )}
        </VStack>
      </VStack>
    </StandardCard>
  );
}
