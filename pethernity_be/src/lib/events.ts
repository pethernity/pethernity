import { EventEmitter } from 'node:events';

export type HeadstoneEvent =
  | { type: 'headstone.created'; payload: unknown }
  | { type: 'headstone.updated'; payload: unknown }
  | { type: 'headstone.deleted'; payload: { id: string } };

export const headstoneEvents = new EventEmitter();
headstoneEvents.setMaxListeners(0);

export function emitHeadstoneEvent(event: HeadstoneEvent) {
  headstoneEvents.emit('headstone', event);
}
