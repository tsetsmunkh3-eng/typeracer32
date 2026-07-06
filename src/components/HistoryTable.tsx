/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, TrendingUp, Calendar, Zap } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryTableProps {
  history: HistoryItem[];
  onClear: () => void;
}

export default function HistoryTable({ history, onClear }: HistoryTableProps) {
  const getRacerEmoji = (racer: string) => {
    switch (racer) {
      case 'horse': return '🐎';
      case 'car': return '🚗';
      case 'rocket': return '🚀';
      default: return '🏎️';
    }
  };

  if (history.length === 0) {
    return (
      <div id="history-empty-state" className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 text-center">
        <TrendingUp className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-400 font-sans">Одоогоор уралдааны түүх байхгүй байна.</p>
        <p className="text-xs text-slate-500 mt-1 font-sans">Эхний уралдаанаа дуусгаж шивэх хурдныхаа түүхийг бүртгээрэй!</p>
      </div>
    );
  }

  // Calculate stats
  const averageWPM = Math.round(history.reduce((sum, item) => sum + item.wpm, 0) / history.length);
  const bestWPM = Math.max(...history.map(item => item.wpm));

  return (
    <div id="history-panel" className="w-full flex flex-col gap-4">
      {/* Mini Stats Summary */}
      <div id="history-header-summary" className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-medium">Хамгийн өндөр хурд</p>
            <p className="text-lg font-bold text-white font-mono">{bestWPM} <span className="text-xs font-normal text-slate-400">WPM</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-medium">Дундаж хурд</p>
            <p className="text-lg font-bold text-white font-mono">{averageWPM} <span className="text-xs font-normal text-slate-400">WPM</span></p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
          <span>📊</span> Өмнөх уралдааны үр дүнгүүд
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 hover:border-rose-800/60 rounded-lg transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Түүх цэвэрлэх</span>
        </button>
      </div>

      {/* Table & Responsive cards wrapper */}
      <div className="overflow-hidden border border-slate-800/80 rounded-xl bg-slate-950/30">
        {/* Desktop Table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="p-3.5 pl-4">Огноо</th>
                <th className="p-3.5">Хэл</th>
                <th className="p-3.5">Хөлөг</th>
                <th className="p-3.5 font-mono text-right">Хурд (WPM)</th>
                <th className="p-3.5 font-mono text-right">Нарийвчлал</th>
                <th className="p-3.5 text-right">Алдаа</th>
                <th className="p-3.5 pr-4 text-right">Хугацаа</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-3.5 pl-4 flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.date}
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.lang === 'mn' ? 'bg-sky-500/10 text-sky-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {item.lang === 'mn' ? 'Монгол' : 'English'}
                    </span>
                  </td>
                  <td className="p-3.5 text-lg select-none">
                    {getRacerEmoji(item.racer)}
                  </td>
                  <td className="p-3.5 font-bold font-mono text-right text-white">
                    {item.wpm}
                  </td>
                  <td className="p-3.5 font-mono text-right text-emerald-400">
                    {item.accuracy}%
                  </td>
                  <td className={`p-3.5 font-mono text-right ${item.errors > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {item.errors}
                  </td>
                  <td className="p-3.5 pr-4 font-mono text-right text-slate-400">
                    {item.timeSec}с
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid/List view */}
        <div className="block sm:hidden divide-y divide-slate-800">
          {history.map((item) => (
            <div key={item.id} className="p-4 flex flex-col gap-2.5 hover:bg-slate-900/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{item.date}</span>
                </div>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.lang === 'mn' ? 'bg-sky-500/10 text-sky-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.lang === 'mn' ? 'Монгол' : 'English'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl select-none">{getRacerEmoji(item.racer)}</span>
                  <div>
                    <p className="text-sm font-bold text-white font-mono">{item.wpm} WPM</p>
                    <p className="text-[10px] text-slate-500">Бичих Хурд</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400 font-mono">{item.accuracy}%</p>
                  <p className="text-[10px] text-slate-500">Нарийвчлал</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-300 font-mono">{item.timeSec}с</p>
                  <p className="text-[10px] text-slate-500">Хугацаа</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
