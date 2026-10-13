import { createContext, type MouseEvent } from 'react';
import type { BoundaryState } from './profile-boundary-state';

export type JourneyBox = { left: number; top: number; width: number; height: number };
export type JobPilotJourney = {
  key: string;
  url: string;
  routeState: Record<string, unknown>;
  historyIndex: number;
  screen: string;
  boundary?: BoundaryState;
  disclosure: boolean;
  position: { x: number; y: number };
  frame?: JourneyBox;
  title?: JourneyBox;
  number?: JourneyBox;
  capturedAt: number;
};

// The public layout owns this in-memory cache. History stores only a key and
// image identity; a reload/new tab does not resurrect fictional profile data.
export const JobPilotJourneyContext = createContext(new Map<string, JobPilotJourney>());
export function ordinaryActivation(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && (!event.currentTarget.target || event.currentTarget.target === '_self');
}
export function journeyBox(element: Element | null): JourneyBox | undefined {
  if (!element) return undefined;
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}
export function journeyTextBox(element: Element | null): JourneyBox | undefined {
  if (!element) return undefined;
  const range = document.createRange();
  range.selectNodeContents(element);
  const { left, top, width, height } = range.getBoundingClientRect();
  return { left, top, width, height };
}
