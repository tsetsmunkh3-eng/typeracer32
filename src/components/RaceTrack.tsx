/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { RacerType } from '../types';

interface RaceTrackProps {
  progress: number; // 0 to 1
  racer: RacerType;
  isFinished: boolean;
}

export default function RaceTrack({ progress, racer, isFinished }: RaceTrackProps) {
  // Determine themes based on racer
  const getTrackStyle = () => {
    switch (racer) {
      case 'horse':
        return {
          bg: 'bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
          lane: 'bg-emerald-950/40 border-y border-dashed border-emerald-500/20',
          emoji: '🐎',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
          name: 'Морьт уралдаан',
          indicator: '🟢',
          trackLines: 'border-emerald-700/20'
        };
      case 'car':
        return {
          bg: 'bg-slate-900/60 border-slate-800 shadow-[0_0_15px_rgba(99,102,241,0.05)]',
          lane: 'bg-slate-950/70 border-y border-dashed border-slate-700/30',
          emoji: '🚗',
          glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
          name: 'Авто уралдаан',
          indicator: '🔵',
          trackLines: 'border-slate-800'
        };
      case 'rocket':
        return {
          bg: 'bg-indigo-950/20 border-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.1)]',
          lane: 'bg-slate-950/80 border-y border-dashed border-indigo-500/20',
          emoji: '🚀',
          glow: 'shadow-[0_0_25px_rgba(129,140,248,0.5)]',
          name: 'Сансрын аялал',
          indicator: '🟣',
          trackLines: 'border-indigo-900/30'
        };
    }
  };

  const track = getTrackStyle();
  const percentage = Math.min(Math.max(progress * 100, 0), 100);

  return (
    <div id="race-track-container" className={`relative w-full rounded-2xl border p-4 md:p-6 transition-all duration-300 ${track.bg}`}>
      {/* Track info header */}
      <div id="track-header" className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400 font-sans">Сонгосон хөлөг:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-sans bg-slate-800 text-slate-100">
            <span>{track.emoji}</span>
            <span>{track.name}</span>
          </span>
        </div>
        <div id="track-progress-badge" className="text-xs font-semibold font-mono text-slate-400">
          Ахиц: {Math.round(percentage)}%
        </div>
      </div>

      {/* Main Track Lane */}
      <div 
        id="race-track-lane" 
        className={`relative h-24 w-full rounded-xl overflow-hidden flex items-center transition-all duration-300 ${track.lane}`}
      >
        {/* Grassy fields or Space Dust effects */}
        {racer === 'rocket' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            {/* Stars */}
            <div className="absolute top-4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
            <div className="absolute top-12 left-2/3 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            <div className="absolute top-8 left-1/2 w-0.5 h-0.5 bg-indigo-200 rounded-full" />
            <div className="absolute top-16 left-10 w-1 h-1 bg-white rounded-full opacity-60" />
            <div className="absolute top-18 left-[80%] w-1 h-1 bg-indigo-300 rounded-full animate-pulse" />
          </div>
        )}

        {racer === 'car' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-around">
            <div className="w-12 h-[2px] bg-slate-800" />
            <div className="w-12 h-[2px] bg-slate-800" />
            <div className="w-12 h-[2px] bg-slate-800" />
            <div className="w-12 h-[2px] bg-slate-800" />
            <div className="w-12 h-[2px] bg-slate-800" />
            <div className="w-12 h-[2px] bg-slate-800" />
          </div>
        )}

        {racer === 'horse' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-between opacity-20 px-8">
            <span className="text-emerald-300 text-lg">🌾</span>
            <span className="text-emerald-300 text-lg">🌾</span>
            <span className="text-emerald-300 text-lg">🌾</span>
          </div>
        )}

        {/* Start Line */}
        <div id="start-line" className="absolute left-4 top-0 bottom-0 w-1.5 bg-slate-500/20 border-r border-dashed border-slate-500/40 flex flex-col justify-between py-1 text-[8px] font-mono select-none text-slate-500">
          <span>S</span><span>T</span><span>A</span><span>R</span><span>T</span>
        </div>

        {/* End Finish Line */}
        <div id="finish-line" className="absolute right-12 top-0 bottom-0 w-12 flex flex-col justify-center items-center select-none bg-gradient-to-r from-transparent to-black/20">
          <div className="grid grid-cols-2 w-5 h-full opacity-30 gap-0.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 ${
                  (Math.floor(i / 2) + i) % 2 === 0 ? 'bg-white' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="absolute -top-1 text-xl animate-bounce">🏁</span>
        </div>

        {/* Track Progress Path Line */}
        <div className="absolute left-10 right-16 top-1/2 h-[4px] -translate-y-1/2 bg-slate-800/40 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${
              racer === 'horse' ? 'bg-emerald-500' : racer === 'car' ? 'bg-indigo-500' : 'bg-indigo-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </div>

        {/* Animated Racer Avatar Wrapper */}
        <div className="absolute left-6 right-20 inset-y-0 flex items-center pointer-events-none">
          <motion.div
            className={`absolute flex items-center justify-center w-14 h-14 rounded-full transition-all duration-100 ${track.glow}`}
            animate={{ 
              left: `${percentage}%`,
              scale: isFinished ? [1, 1.15, 1] : 1,
              rotate: isFinished ? [0, -5, 5, -5, 0] : 0
            }}
            transition={{ 
              left: { type: 'spring', stiffness: 100, damping: 18 },
              scale: { duration: 0.5 },
              rotate: { duration: 0.5 }
            }}
            style={{ x: '-50%' }}
          >
            {/* Trail particles when moving */}
            {percentage > 0 && percentage < 100 && (
              <motion.div 
                className={`absolute right-full mr-2 h-1 rounded-full opacity-60 filter blur-[1px] ${
                  racer === 'horse' ? 'bg-emerald-400' : racer === 'car' ? 'bg-indigo-400' : 'bg-indigo-300'
                }`}
                animate={{ width: [10, 25, 10], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            )}

            {/* Vehicle Emoji & Mini Effect */}
            <div className="relative text-3xl md:text-4xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {track.emoji}
              
              {/* Speed lines */}
              {percentage > 0 && !isFinished && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                  <span className="block w-2.5 h-[1.5px] bg-white/40 rounded animate-pulse" />
                  <span className="block w-4 h-[1.5px] bg-white/30 rounded animate-pulse delay-75" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
