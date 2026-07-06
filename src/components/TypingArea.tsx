/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Keyboard, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { QuoteItem, GameState } from '../types';
import { sounds } from '../utils/audio';

interface TypingAreaProps {
  quote: QuoteItem;
  gameState: GameState;
  countdown: number;
  typedText: string;
  onTypedTextChange: (text: string) => void;
  onStartGame: () => void;
  onResetGame: () => void;
}

export default function TypingArea({
  quote,
  gameState,
  countdown,
  typedText,
  onTypedTextChange,
  onStartGame,
  onResetGame
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto focus input when game state shifts to playing or countdown
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Handle focus container click
  const handleContainerClick = () => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Analyze matching text to show correct/incorrect/untyped characters
  const getCharacterStatuses = () => {
    const chars = quote.text.split('');
    const typedChars = typedText.split('');
    
    // Find first mistake index
    let firstMistakeIndex = -1;
    for (let i = 0; i < typedChars.length; i++) {
      if (typedChars[i] !== chars[i]) {
        firstMistakeIndex = i;
        break;
      }
    }

    return chars.map((char, index) => {
      let status: 'untyped' | 'correct' | 'incorrect' | 'current' = 'untyped';
      
      if (index < typedText.length) {
        if (firstMistakeIndex === -1 || index < firstMistakeIndex) {
          status = 'correct';
        } else if (index === firstMistakeIndex) {
          status = 'incorrect';
        } else {
          // Beyond the first mistake, we don't paint them red/green, they are just "untyped" or muted error
          status = 'incorrect';
        }
      } else if (index === typedText.length) {
        // If there's no mistake so far, this is the current active char
        if (firstMistakeIndex === -1) {
          status = 'current';
        }
      }

      return { char, index, status };
    });
  };

  const charStatuses = getCharacterStatuses();
  const hasError = charStatuses.some(c => c.status === 'incorrect');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onTypedTextChange(val);
  };

  return (
    <div id="typing-area-wrapper" className="w-full flex flex-col gap-6">
      {/* Target sentence display box */}
      <div 
        id="sentence-card"
        onClick={handleContainerClick}
        className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-300 cursor-pointer shadow-xl ${
          isFocused && gameState === 'playing'
            ? 'bg-[#1e293b] border-slate-700 shadow-indigo-500/5' 
            : 'bg-[#1e293b]/60 border-slate-800 hover:border-slate-750'
        }`}
      >
        {/* Helper focus tag */}
        {gameState === 'playing' && !isFocused && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center transition-all z-10">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white shadow-xl flex items-center gap-2"
            >
              <Keyboard className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Энд дарж бичиж эхэлнэ үү</span>
            </motion.div>
          </div>
        )}

        {/* Text Area */}
        <div 
          id="target-text-display" 
          className="text-xl md:text-2xl leading-relaxed tracking-wide select-none font-sans font-medium text-slate-100 break-words"
        >
          {charStatuses.map(({ char, index, status }) => {
            let className = '';
            if (status === 'correct') {
              // Correctly typed
              className = 'text-emerald-400 border-b-2 border-transparent transition-colors duration-150';
            } else if (status === 'incorrect') {
              // Mistake
              className = 'text-rose-500 bg-rose-500/10 font-bold border-b-2 border-rose-500 rounded px-0.5';
            } else if (status === 'current') {
              // Current character to type
              className = 'text-indigo-300 bg-indigo-500/10 font-bold border-b-2 border-indigo-500 animate-pulse px-0.5 rounded-sm';
            } else {
              // Untyped
              className = 'text-slate-400 opacity-60';
            }

            return (
              <span key={index} className={className}>
                {char === ' ' ? ' ' : char}
              </span>
            );
          })}
        </div>

        {/* Author / Source attribution */}
        <div id="sentence-author" className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-sans">
            <span className="opacity-50">Эх сурвалж:</span>
            <span className="font-semibold text-slate-300">{quote.author}</span>
          </div>
          <div className="flex items-center gap-1 font-sans">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {quote.lang === 'mn' ? 'Монгол' : 'Англи'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              quote.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
              quote.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              quote.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {quote.difficulty === 'easy' ? 'Амархан' :
               quote.difficulty === 'medium' ? 'Дундаж' :
               quote.difficulty === 'hard' ? 'Хэцүү' : 'Боломжгүй'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Actions & Input Layer */}
      <div id="typing-input-controls" className="w-full flex flex-col gap-4">
        {gameState === 'idle' && (
          <button
            id="btn-start-game"
            onClick={onStartGame}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 p-4 font-bold text-white shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer text-lg font-sans"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Play className="w-5 h-5 fill-white" />
            <span>УРАЛДААНЫГ ЭХЛҮҮЛЭХ</span>
          </button>
        )}

        {/* Countdown state banner */}
        {gameState === 'countdown' && (
          <div id="countdown-banner" className="w-full h-16 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-extrabold text-indigo-400 font-mono tracking-wider flex items-center gap-2"
              >
                <span>🚦 {countdown === 0 ? 'УРАЛДААН ЭХЭЛЛЭЭ!' : `${countdown}...`}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Playing state active typing input */}
        {gameState === 'playing' && (
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              id="typeracer-input-field"
              value={typedText}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Дээрх өгүүлбэрийг алдаагүй, хурдан бичнэ үү..."
              className={`w-full p-4 md:p-5 rounded-2xl bg-slate-900 text-white font-mono text-base md:text-lg border transition-all outline-none ${
                hasError 
                  ? 'border-rose-500/60 bg-rose-950/10 focus:border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
              }`}
            />
            {/* Real-time floating status badge */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
              {hasError ? (
                <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold font-sans flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Алдаа засна уу</span>
                </div>
              ) : typedText.length > 0 ? (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-sans flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Зөв байна!</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Completed Game state banner */}
        {gameState === 'finished' && (
          <div id="finished-banner" className="flex flex-col md:flex-row gap-3 w-full">
            <div className="flex-1 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-sans">Баяр хүргэе! Уралдаан амжилттай дууслаа.</h4>
                <p className="text-xs text-slate-400 font-sans">Доорх статистикоос та шивэх хурдны үзүүлэлтээ харна уу.</p>
              </div>
            </div>
            <button
              id="btn-play-again"
              onClick={onResetGame}
              className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 font-bold text-white hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer text-base font-sans"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Дахин тоглох</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
