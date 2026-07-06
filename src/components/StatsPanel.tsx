/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Award, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatsPanelProps {
  wpm: number;
  accuracy: number;
  errors: number;
  timeSec: number;
  isFinished: boolean;
}

export default function StatsPanel({ wpm, accuracy, errors, timeSec, isFinished }: StatsPanelProps) {
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="stats-panel-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Words Per Minute (WPM) */}
      <div 
        id="stat-wpm" 
        className={`flex flex-col justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
          isFinished 
            ? 'bg-indigo-950/40 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
            : 'bg-slate-900/50 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 font-sans uppercase">Бичих Хурд</span>
          <Award className={`w-4 h-4 ${isFinished ? 'text-indigo-400' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white">
            {wpm}
          </span>
          <span className="text-xs font-medium text-slate-400 font-sans">WPM</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 font-sans">
          Минутад бичсэн үг
        </div>
      </div>

      {/* Accuracy (%) */}
      <div 
        id="stat-accuracy" 
        className={`flex flex-col justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
          isFinished && accuracy >= 95
            ? 'bg-emerald-950/40 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
            : 'bg-slate-900/50 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 font-sans uppercase">Нарийвчлал</span>
          <CheckCircle className={`w-4 h-4 ${isFinished && accuracy >= 95 ? 'text-emerald-400' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white">
            {accuracy}
          </span>
          <span className="text-xs font-medium text-slate-400 font-sans">%</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 font-sans">
          Зөв бичсэн хувь
        </div>
      </div>

      {/* Errors count */}
      <div 
        id="stat-errors" 
        className={`flex flex-col justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
          errors > 0 
            ? 'bg-rose-950/25 border-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.05)]' 
            : 'bg-slate-900/50 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 font-sans uppercase">Алдаа</span>
          <AlertTriangle className={`w-4 h-4 ${errors > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tight ${errors > 0 ? 'text-rose-400' : 'text-white'}`}>
            {errors}
          </span>
          <span className="text-xs font-medium text-slate-400 font-sans">удаа</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 font-sans">
          Буруу дарсан үсэг
        </div>
      </div>

      {/* Time Elapsed */}
      <div id="stat-time" className="flex flex-col justify-between p-4 md:p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 font-sans uppercase">Хугацаа</span>
          <Clock className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white">
            {formatTime(timeSec)}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 font-sans">
          Нийт зарцуулсан цаг
        </div>
      </div>
    </div>
  );
}
