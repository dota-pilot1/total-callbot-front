import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { Switch } from "../../../components/ui/Switch";
import { Slider } from "../../../components/ui/Slider";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import type { IntervalListeningSettings } from "../types";

interface ListeningSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: IntervalListeningSettings;
  onSettingsChange: (settings: IntervalListeningSettings) => void;
}

export function ListeningSettingsDialog({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: ListeningSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<IntervalListeningSettings>(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: IntervalListeningSettings = {
      audioSpeed: 1.0,
      autoPlay: false,
      showTranscript: false,
      autoRepeat: false,
      playbackDelay: 2,
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={onClose}
      title="듣기 설정"
    >
      <div className="space-y-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">오디오 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 재생 속도 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                재생 속도: {localSettings.audioSpeed}x
              </Label>
              <Slider
                value={[localSettings.audioSpeed]}
                onValueChange={([value]) =>
                  setLocalSettings(prev => ({ ...prev, audioSpeed: value }))
                }
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5x (느림)</span>
                <span>2.0x (빠름)</span>
              </div>
            </div>

            {/* 자동 재생 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">자동 재생</Label>
              <Switch
                checked={localSettings.autoPlay}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({ ...prev, autoPlay: checked }))
                }
              />
            </div>

            {/* 자동 반복 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">자동 반복</Label>
                <Switch
                  checked={localSettings.autoRepeat}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({ ...prev, autoRepeat: checked }))
                  }
                />
              </div>

              {localSettings.autoRepeat && (
                <div className="space-y-2 ml-4">
                  <Label className="text-sm text-muted-foreground">
                    반복 간격: {localSettings.playbackDelay}초
                  </Label>
                  <Slider
                    value={[localSettings.playbackDelay]}
                    onValueChange={([value]) =>
                      setLocalSettings(prev => ({ ...prev, playbackDelay: value }))
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1초</span>
                    <span>10초</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">표시 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 자막 표시 */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">자막 표시</Label>
                <p className="text-xs text-muted-foreground">
                  오디오 텍스트를 화면에 표시합니다
                </p>
              </div>
              <Switch
                checked={localSettings.showTranscript}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({ ...prev, showTranscript: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 버튼들 */}
        <div className="space-y-3">
          <Button
            onClick={handleSave}
            className="w-full"
            size="lg"
          >
            설정 저장
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
            size="lg"
          >
            기본값으로 재설정
          </Button>
        </div>
      </div>
    </FullScreenSlideDialog>
  );
}
