import { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
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
    utterance.lang = 'en-US';

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* 오디오 텍스트 */}
          {settings.showTranscript && (
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">오디오 텍스트:</p>
              <p className="text-lg text-foreground leading-relaxed">{text}</p>
            </div>
          )}

          {/* 컨트롤 버튼들 */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="default"
              onClick={resetPlayCount}
              disabled={disabled || playCount === 0}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              리셋
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={isPlaying ? stopSpeaking : speak}
              disabled={disabled}
              className="flex items-center gap-3 px-12 py-4 text-lg"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="h-6 w-6" />
                  정지
                </>
              ) : (
                <>
                  <PlayIcon className="h-6 w-6" />
                  재생
                </>
              )}
            </Button>

            <div className="text-base text-muted-foreground">
              재생 {playCount}회
            </div>
          </div>

          {/* 설정 정보 */}
          <div className="text-sm text-muted-foreground text-center space-y-1">
            <div>재생 속도: {settings.audioSpeed}x</div>
            {settings.autoRepeat && (
              <div>자동 반복: {settings.playbackDelay}초 간격</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
