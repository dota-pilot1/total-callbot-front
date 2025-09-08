import { apiClient } from '../../../shared/api/client';

export type RealtimeSession = {
  token: string;
  model: string;
  expires_at?: string;
};

export const voiceApi = {
  createSession: async (opts?: { model?: string; voice?: string; lang?: string }): Promise<RealtimeSession> => {
    const params = new URLSearchParams();
    if (opts?.model) params.set('model', opts.model);
    if (opts?.voice) params.set('voice', opts.voice);
    if (opts?.lang) params.set('lang', opts.lang);
    const url = `/realtime/session${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await apiClient.post<RealtimeSession>(url);
    return res.data;
  },
};
