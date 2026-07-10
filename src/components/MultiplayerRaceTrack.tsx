/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MultiplayerPlayer } from '../types';

interface MultiplayerRaceTrackProps {
  players: Record<string, MultiplayerPlayer>;
  selfId: string;
}

export default function MultiplayerRaceTrack({ players, selfId }: MultiplayerRaceTrackProps) {
  const playerList = Object.values(players).sort((a, b) => {
    // Keep self on top, or just order by join/id/progress
    if (a.id === selfId) return -1;
    if (b.id === selfId) return 1;
    return a.id.localeCompare(b.id);
  });

  return (
    <div id="mp-race-track-container" className="relative w-full rounded-2xl border border-indigo-900/40 bg-slate-900/80 p-4 md:p-6 shadow-2xl overflow-hidden">
      {/* Track Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-indigo-400 font-sans flex items-center gap-1.5">
            <span>🏁</span> Олон тоглогчийн уралдааны зам
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Тоглогчийн тоо: {playerList.length}
        </span>
      </div>

      {/* Track Lanes Stack */}
      <div className="flex flex-col gap-4">
        {playerList.map((player) => {
          const isSelf = player.id === selfId;
          const percentage = Math.min(Math.max(player.progress, 0), 100);

          return (
            <div 
              key={player.id} 
              className={`relative rounded-xl border p-2 transition-all ${
                isSelf 
                  ? 'bg-indigo-950/30 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'bg-slate-950/40 border-slate-800/80'
              }`}
            >
              {/* Lane Info Header */}
              <div className="flex items-center justify-between mb-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 font-sans truncate max-w-[150px] sm:max-w-[200px]">
                    {player.name} {isSelf && <span className="text-[10px] text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded ml-1 font-sans">Би</span>}
                    {player.isHost && <span className="text-[10px] text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded ml-1 font-sans">Админ</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">Нарийвчлал: <b className="text-slate-300">{Math.round(player.accuracy)}%</b></span>
                  <span className="text-indigo-400 font-bold">{Math.round(player.wpm)} WPM</span>
                  <span className="text-emerald-400 font-semibold">{Math.round(percentage)}%</span>
                </div>
              </div>

              {/* Lane Roadway */}
              <div className="relative h-12 w-full rounded-lg bg-slate-950/80 border border-slate-900/60 flex items-center overflow-hidden">
                {/* Dash Lines on Road */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-around opacity-15">
                  <div className="w-8 h-[1px] bg-slate-400" />
                  <div className="w-8 h-[1px] bg-slate-400" />
                  <div className="w-8 h-[1px] bg-slate-400" />
                  <div className="w-8 h-[1px] bg-slate-400" />
                  <div className="w-8 h-[1px] bg-slate-400" />
                  <div className="w-8 h-[1px] bg-slate-400" />
                  <div className="w-8 h-[1px] bg-slate-400" />
                </div>

                {/* Start Line */}
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-800 flex flex-col justify-between py-1 text-[6px] font-mono select-none text-slate-600">
                  <span>S</span><span>T</span>
                </div>

                {/* Finish Checkerboard Line */}
                <div className="absolute right-8 top-0 bottom-0 w-4 flex flex-col justify-center items-center opacity-25">
                  <div className="grid grid-cols-2 w-2 h-full gap-px">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-1.5 ${
                          (Math.floor(i / 2) + i) % 2 === 0 ? 'bg-white' : 'bg-slate-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Road surface progress fill indicator */}
                <div className="absolute left-6 right-12 top-1/2 h-[2px] -translate-y-1/2 bg-slate-900 rounded-full">
                  <motion.div 
                    className={`h-full rounded-full ${
                      isSelf ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 85, damping: 14 }}
                  />
                </div>

                {/* Avatar Car/Vehicle */}
                <div className="absolute left-4 right-14 inset-y-0 flex items-center pointer-events-none">
                  <motion.div
                    className="absolute flex items-center justify-center w-8 h-8 rounded-full"
                    animate={{ 
                      left: `${percentage}%`,
                      scale: player.finished ? [1, 1.15, 1] : 1,
                    }}
                    transition={{ 
                      left: { type: 'spring', stiffness: 90, damping: 16 }
                    }}
                    style={{ x: '-50%' }}
                  >
                    <span className="text-2xl filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                      {player.avatar || "🚗"}
                    </span>
                    {player.finished && (
                      <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold text-white border border-slate-950">
                        🏁
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
