/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RacerType = 'horse' | 'car' | 'rocket';

export type Language = 'mn' | 'en';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

export type GameState = 'idle' | 'countdown' | 'playing' | 'finished';

export interface HistoryItem {
  id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeSec: number;
  racer: RacerType;
  lang: Language;
  date: string;
}

export interface QuoteItem {
  text: string;
  author: string;
  lang: Language;
  difficulty: Difficulty;
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string; // Emoji
  progress: number; // 0-100
  wpm: number;
  accuracy: number;
  isHost: boolean;
  isReady: boolean;
  finished: boolean;
  finishTime?: number;
}

export interface MultiplayerLobby {
  id: string;
  lang: Language;
  difficulty: Difficulty;
  quote: QuoteItem;
  state: 'waiting' | 'countdown' | 'playing' | 'finished';
  countdown: number;
  players: Record<string, MultiplayerPlayer>;
  startTime?: number;
}
