/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RacerType = 'horse' | 'car' | 'rocket';

export type Language = 'mn' | 'en';

export type Difficulty = 'easy' | 'medium' | 'hard';

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
