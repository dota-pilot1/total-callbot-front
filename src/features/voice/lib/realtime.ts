export type VoiceConnectOptions = {
  token: string;
  model: string;
  audioElement?: HTMLAudioElement | null;
};

export type VoiceConnection = {
  pc: RTCPeerConnection;
  dc: RTCDataChannel;
  localStream: MediaStream;
  stop: () => void;
};

// Establish a WebRTC connection to OpenAI Realtime API
export async function connectRealtimeVoice(opts: VoiceConnectOptions): Promise<VoiceConnection> {
  const pc = new RTCPeerConnection();

  // Optional: collect remote audio into provided element
  const remoteStream = new MediaStream();
  pc.ontrack = (event) => {
    event.streams[0].getAudioTracks().forEach(() => {
      // Attach the incoming stream
      remoteStream.addTrack(event.track);
    });
    if (opts.audioElement) {
      // Older browsers need srcObject set each ontrack
      opts.audioElement.srcObject = event.streams[0];
      opts.audioElement.play().catch(() => {/* autoplay might be blocked */});
    }
  };

  // Data channel for control events
  const dc = pc.createDataChannel('oai-events');
  dc.onopen = () => {
    // You can send an initial event to prompt a response if desired
    // dc.send(JSON.stringify({ type: 'response.create', response: { modalities: ['audio'] } }));
  };

  // Mic capture and add to peer connection
  const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  for (const track of localStream.getTracks()) {
    pc.addTrack(track, localStream);
  }

  // Create local offer
  const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
  await pc.setLocalDescription(offer);

  // Send SDP to OpenAI and get answer
  const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(opts.model)}`, {
    method: 'POST',
    body: (offer.sdp || ''),
    headers: {
      'Authorization': `Bearer ${opts.token}`,
      'Content-Type': 'application/sdp',
      'OpenAI-Beta': 'realtime=v1',
    },
  });
  const answerSdp = await sdpResponse.text();
  await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

  const stop = () => {
    try { dc.close(); } catch {}
    try { pc.close(); } catch {}
    try { localStream.getTracks().forEach(t => t.stop()); } catch {}
  };

  return { pc, dc, localStream, stop };
}

