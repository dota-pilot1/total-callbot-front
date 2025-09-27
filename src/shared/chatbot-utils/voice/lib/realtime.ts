// 음성(WebRTC) 연결 옵션
export type VoiceConnectOptions = {
  token: string;
  model: string;
  audioElement?: HTMLAudioElement | null;
  onUserTranscript?: (
    text: string,
    isFinal: boolean,
    meta?: { itemId?: string; eventId?: string },
  ) => void;
  onAssistantText?: (
    text: string,
    isFinal: boolean,
    meta?: { responseId?: string; outputIndex?: number; eventId?: string },
  ) => void;
  onEvent?: (evt: unknown) => void; // raw debug events
  audioConstraints?: MediaTrackConstraints;
  // Optional: choose output voice for Realtime responses (supported: 'verse', 'alloy', 'sage')
  voice?: string;
  // Optional: system-style instruction to steer assistant persona (not exposed in UI)
  instructions?: string;
};

// 음성(WebRTC) 연결 핸들
export type VoiceConnection = {
  pc: RTCPeerConnection;
  dc: RTCDataChannel;
  localStream: MediaStream;
  stop: () => void;
};

// OpenAI Realtime API와 WebRTC 연결을 수립
export async function connectRealtimeVoice(
  opts: VoiceConnectOptions,
): Promise<VoiceConnection> {
  const pc = new RTCPeerConnection();
  console.debug("[realtime] RTCPeerConnection created");

  // 원격 오디오 트랙을 <audio> 엘리먼트로 재생
  const remoteStream = new MediaStream();
  pc.ontrack = (event) => {
    event.streams[0].getAudioTracks().forEach(() => {
      // 들어온 트랙을 원격 스트림에 추가
      remoteStream.addTrack(event.track);
    });
    if (opts.audioElement) {
      // 일부 브라우저는 ontrack 때마다 srcObject를 설정해야 함
      opts.audioElement.srcObject = event.streams[0];
      opts.audioElement.play().catch(() => {
        /* autoplay might be blocked */
      });
    }
  };

  // 컨트롤/이벤트 수신용 데이터 채널
  let dc: RTCDataChannel = pc.createDataChannel("oai-events");

  const bindDataChannel = (channel: RTCDataChannel) => {
    dc = channel;
    console.debug("[realtime] datachannel created:", dc.label);
    dc.onopen = () => {
      console.debug("[realtime] datachannel open");
      // 자동 응답을 시작하지 않습니다. (사용자 입력/지시 시에만 response.create 전송)
    };
    dc.onmessage = (ev) => {
      // UTF-8 텍스트 인코딩 명시적 처리
      let raw: string;
      if (ev.data instanceof ArrayBuffer) {
        const decoder = new TextDecoder("utf-8");
        raw = decoder.decode(ev.data);
      } else if (ev.data instanceof Blob) {
        // Blob의 경우 비동기적으로 처리해야 하지만, 여기서는 동기적 처리 필요
        raw = String(ev.data || "");
      } else {
        raw = String(ev.data || "");
      }

      let msg: any = null;
      try {
        msg = JSON.parse(raw);
      } catch {
        /* not JSON */
      }
      if (msg) {
        opts.onEvent?.(msg);
        try {
          // 공통 Realtime 이벤트 추론 처리
          // 사용자 음성 전사: conversation.item.input_audio_transcription.* 만 사용 (중복 방지)
          if (
            msg.type === "conversation.item.input_audio_transcription.delta" &&
            typeof msg.delta === "string"
          ) {
            // 한글 문자 유효성 검증 후 전달
            const cleanDelta = msg.delta.normalize("NFC");
            opts.onUserTranscript?.(cleanDelta, false, {
              itemId: msg.item_id,
              eventId: msg.event_id,
            });
          }
          if (
            msg.type ===
              "conversation.item.input_audio_transcription.completed" &&
            typeof msg.transcript === "string"
          ) {
            // 완성된 텍스트는 NFC 정규화만 적용
            const cleanTranscript = msg.transcript.normalize("NFC");
            opts.onUserTranscript?.(cleanTranscript, true, {
              itemId: msg.item_id,
              eventId: msg.event_id,
            });
          }
          // 어시스턴트 텍스트 스트림
          if (
            (msg.type === "response.output_text.delta" ||
              msg.type === "response.text.delta") &&
            typeof msg.delta === "string"
          ) {
            // 스트리밍 중 한글 깨짐 방지를 위한 NFC 정규화
            const cleanDelta = msg.delta.normalize("NFC");
            opts.onAssistantText?.(cleanDelta, false);
          }
          if (
            (msg.type === "response.output_text.done" ||
              msg.type === "response.text.done") &&
            typeof msg.text === "string"
          ) {
            const cleanText = msg.text.normalize("NFC");
            opts.onAssistantText?.(cleanText, true, {
              responseId: msg.response_id,
              outputIndex: msg.output_index,
              eventId: msg.event_id,
            });
          }
          // 어시스턴트 오디오 전사(assistant가 말한 내용의 텍스트)
          if (
            msg.type === "response.audio_transcript.delta" &&
            typeof msg.delta === "string"
          ) {
            const cleanDelta = msg.delta.normalize("NFC");
            opts.onAssistantText?.(cleanDelta, false, {
              responseId: msg.response_id,
              outputIndex: msg.output_index,
              eventId: msg.event_id,
            });
          }
          if (
            msg.type === "response.audio_transcript.done" &&
            typeof msg.transcript === "string"
          ) {
            const cleanTranscript = msg.transcript.normalize("NFC");
            opts.onAssistantText?.(cleanTranscript, true, {
              responseId: msg.response_id,
              outputIndex: msg.output_index,
              eventId: msg.event_id,
            });
          }

          // 구조화된 아이템 형태로 오는 응답 처리 (텍스트만 사용)
          if (msg.type === "response.output_item.done" && msg.item) {
            const item = msg.item;
            if (Array.isArray(item.content)) {
              const texts: string[] = [];
              for (const part of item.content) {
                if (!part) continue;
                if (
                  part.type === "output_text" &&
                  typeof part.text === "string"
                )
                  texts.push(part.text);
                // 오디오 전사는 별도의 response.audio_transcript.done에서만 처리
              }
              if (texts.length) {
                opts.onAssistantText?.(texts.join(" "), true, {
                  responseId: msg.response_id,
                  outputIndex: msg.output_index,
                  eventId: msg.event_id,
                });
              }
            }
          }

          if (msg.type === "response.content_part.done" && msg.part) {
            const part = msg.part;
            if (part.type === "output_text" && typeof part.text === "string") {
              opts.onAssistantText?.(part.text, true, {
                responseId: msg.response_id,
                outputIndex: msg.output_index,
                eventId: msg.event_id,
              });
            }
          }
        } catch {}
      } else {
        // 텍스트/바이너리 등 비-JSON 페이로드
        opts.onEvent?.(raw);
      }
    };
  };

  // 서버가 데이터채널을 생성하는 방식도 대비하여 바인딩
  pc.ondatachannel = (evt) => {
    console.debug("[realtime] ondatachannel:", evt.channel?.label);
    bindDataChannel(evt.channel);
  };

  // 우선 우리가 만든 채널을 바인딩
  bindDataChannel(dc);

  // 마이크 캡처 후 피어 연결에 추가 (HTTPS/localhost 필요)
  const md =
    typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
  if (!md || typeof md.getUserMedia !== "function") {
    const secureHint =
      typeof window !== "undefined" &&
      (window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
        ? ""
        : " (HTTPS 또는 localhost 환경에서만 동작)";
    throw new Error(
      "브라우저에서 마이크 API(getUserMedia)를 사용할 수 없습니다" + secureHint,
    );
  }
  const localStream = await md.getUserMedia({
    audio: opts.audioConstraints ?? true,
  });
  for (const track of localStream.getTracks()) {
    pc.addTrack(track, localStream);
  }

  // 로컬 SDP 오퍼 생성
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
  });
  await pc.setLocalDescription(offer);

  // OpenAI로 SDP 전송 → 원격 SDP(answer) 수신
  const sdpResponse = await fetch(
    `https://api.openai.com/v1/realtime?model=${encodeURIComponent(opts.model)}`,
    {
      method: "POST",
      body: offer.sdp || "",
      headers: {
        Authorization: `Bearer ${opts.token}`,
        "Content-Type": "application/sdp",
        "OpenAI-Beta": "realtime=v1",
      },
    },
  );
  const answerSdp = await sdpResponse.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  // 정리 함수: 채널/피어/마이크 트랙 종료
  const stop = () => {
    try {
      dc.close();
    } catch {}
    try {
      pc.close();
    } catch {}
    try {
      localStream.getTracks().forEach((t) => t.stop());
    } catch {}
  };

  return { pc, dc, localStream, stop };
}
