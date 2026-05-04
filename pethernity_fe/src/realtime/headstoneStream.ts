import { apiBaseUrl } from '../api/client';
import type { HeadstoneDTO } from '../api/client';

export type HeadstoneStreamHandlers = {
  onCreated?: (h: HeadstoneDTO) => void;
  onUpdated?: (h: HeadstoneDTO) => void;
  onDeleted?: (id: string) => void;
  onOpen?: () => void;
  onError?: (e: Event) => void;
};

export function openHeadstoneStream(handlers: HeadstoneStreamHandlers): () => void {
  const source = new EventSource(`${apiBaseUrl}/headstones/stream`);

  source.addEventListener('hello', () => handlers.onOpen?.());

  source.addEventListener('headstone.created', (e: MessageEvent) => {
    try {
      handlers.onCreated?.(JSON.parse(e.data));
    } catch (err) {
      console.warn('SSE parse error (created)', err);
    }
  });

  source.addEventListener('headstone.updated', (e: MessageEvent) => {
    try {
      handlers.onUpdated?.(JSON.parse(e.data));
    } catch (err) {
      console.warn('SSE parse error (updated)', err);
    }
  });

  source.addEventListener('headstone.deleted', (e: MessageEvent) => {
    try {
      const { id } = JSON.parse(e.data);
      handlers.onDeleted?.(id);
    } catch (err) {
      console.warn('SSE parse error (deleted)', err);
    }
  });

  source.onerror = (e) => handlers.onError?.(e);

  return () => source.close();
}
