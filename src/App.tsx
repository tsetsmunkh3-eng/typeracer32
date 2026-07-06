/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  Award, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Globe, 
  FileText, 
  History, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Play, 
  Check, 
  Info,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkle
} from 'lucide-react';
import { RacerType, Language, Difficulty, GameState, HistoryItem, QuoteItem } from './types';
import { DEFAULT_QUOTES } from './data';
import { sounds } from './utils/audio';

// Components
import RaceTrack from './components/RaceTrack';
import StatsPanel from './components/StatsPanel';
import TypingArea from './components/TypingArea';
import HistoryTable from './components/HistoryTable';

export default function App() {
  // Config & Customization States
  const [language, setLanguage] = useState<Language>('mn');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [racer, setRacer] = useState<RacerType>('car');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom text states
  const [useCustomText, setUseCustomText] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customError, setCustomError] = useState('');

  // Active game states
  const [currentQuote, setCurrentQuote] = useState<QuoteItem>(DEFAULT_QUOTES[0]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [typedText, setTypedText] = useState('');
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('typeracer_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading history', e);
      }
    }
  }, []);

  // Update sound controller when preference changes
  useEffect(() => {
    sounds.toggle(soundEnabled);
  }, [soundEnabled]);

  // Set initial random quote based on config
  useEffect(() => {
    if (!useCustomText) {
      selectRandomQuote(language, difficulty);
    }
  }, [language, difficulty, useCustomText]);

  // Random quote selector
  const selectRandomQuote = (lang: Language, diff: Difficulty) => {
    const filtered = DEFAULT_QUOTES.filter(q => q.lang === lang && q.difficulty === diff);
    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setCurrentQuote(filtered[randomIndex]);
    }
  };

  // Pre-race Countdown interval handler
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'countdown') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('playing');
            setStartTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // Active game timer elapsed tracker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // Handle setting/saving custom text
  const handleSaveCustomText = () => {
    const cleanText = customText.trim().replace(/\s+/g, ' ');
    if (cleanText.length < 10) {
      setCustomError('Бичвэр хэтэрхий богино байна (хамгийн багадаа 10 тэмдэгт).');
      return;
    }
    if (cleanText.length > 800) {
      setCustomError('Бичвэр хэтэрхий урт байна (дээд тал нь 800 тэмдэгт).');
      return;
    }

    setCustomError('');
    // Simple language detection (Cyrillic vs Latin characters)
    const hasCyrillic = /[а-яөүё]/i.test(cleanText);
    const lang: Language = hasCyrillic ? 'mn' : 'en';

    // Auto-difficulty based on text length
    let diff: Difficulty = 'easy';
    if (cleanText.length > 150) diff = 'hard';
    else if (cleanText.length > 60) diff = 'medium';

    setCurrentQuote({
      text: cleanText,
      author: 'Хэрэглэгчийн өөрийн бичвэр',
      lang: lang,
      difficulty: diff
    });
    setUseCustomText(false); // hide editor pane, show game ready state
  };

  // Start the entire countdown process
  const handleStartGame = () => {
    setTypedText('');
    setErrors(0);
    setStartTime(null);
    setEndTime(null);
    setElapsedSeconds(0);
    setCountdown(3);
    setGameState('countdown');
  };

  // Reset/Restart the game or skip to another quote
  const handleResetGame = () => {
    setGameState('idle');
    setTypedText('');
    setErrors(0);
    setStartTime(null);
    setEndTime(null);
    setElapsedSeconds(0);
    if (!useCustomText && currentQuote.author !== 'Хэрэглэгчийн өөрийн бичв') {
      selectRandomQuote(language, difficulty);
    }
  };

  // Helper to compute length of matching correct prefix characters typed
  const getMatchingLength = (typed: string, target: string) => {
    let matchCount = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) {
        matchCount++;
      } else {
        break;
      }
    }
    return matchCount;
  };

  // Keystroke value analysis & error detection
  const handleTypedTextChange = (newText: string) => {
    if (gameState !== 'playing') return;

    const isAddition = newText.length > typedText.length;
    
    if (isAddition) {
      const lastCharIndex = newText.length - 1;
      const expectedChar = currentQuote.text[lastCharIndex];
      const actualChar = newText[lastCharIndex];

      if (actualChar === expectedChar) {
        sounds.playKey();
      } else {
        setErrors((prev) => prev + 1);
        sounds.playError();
      }
    }

    setTypedText(newText);

    // Finish Condition
    if (newText === currentQuote.text) {
      const finishTime = Date.now();
      setEndTime(finishTime);
      setGameState('finished');
      sounds.playSuccess();

      // Final calculations
      const initialStart = startTime || finishTime - 1000;
      const finalTimeSec = Math.max(Math.round((finishTime - initialStart) / 1000), 1);
      const finalWpm = Math.round((currentQuote.text.length / 5) / (finalTimeSec / 60));
      const finalAccuracy = Math.max(0, Math.min(Math.round((currentQuote.text.length / (currentQuote.text.length + errors)) * 100), 100));

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        wpm: finalWpm,
        accuracy: finalAccuracy,
        errors: errors,
        timeSec: finalTimeSec,
        racer: racer,
        lang: currentQuote.lang,
        date: new Date().toLocaleDateString('mn-MN', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('typeracer_history', JSON.stringify(updatedHistory));
    }
  };

  // Clear local storage history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('typeracer_history');
  };

  // Live stats while typing
  const currentMatchingLength = getMatchingLength(typedText, currentQuote.text);
  const progressRatio = currentQuote.text.length > 0 ? (currentMatchingLength / currentQuote.text.length) : 0;

  const liveWpm = gameState === 'playing'
    ? Math.round((currentMatchingLength / 5) / (Math.max(elapsedSeconds, 1) / 60))
    : gameState === 'finished' && endTime && startTime
      ? Math.round((currentQuote.text.length / 5) / (Math.max(Math.round((endTime - startTime) / 1000), 1) / 60))
      : 0;

  const liveAccuracy = typedText.length > 0
    ? Math.max(0, Math.min(Math.round((currentMatchingLength / typedText.length) * 100), 100))
    : 100;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col justify-between font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Primary Header Bar */}
      <header className="flex items-center justify-between px-6 py-5 md:px-8 md:py-6 border-b border-slate-800 bg-[#1e293b]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-lg">
            TP
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white font-display">
              TypeMaster Pro <span className="text-[10px] lowercase normal-case px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-sans font-semibold">mn</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Training System v4.2</p>
          </div>
        </div>

        {/* Live Top Stats + Audio Control */}
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="hidden sm:block text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans">Хурд (WPM)</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-indigo-400">{liveWpm}</p>
          </div>
          <div className="hidden sm:block text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans">Алдаа</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-rose-400">{errors}</p>
          </div>
          <div className="hidden sm:block text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans">Хугацаа</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-emerald-400">{elapsedSeconds}с</p>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold font-sans cursor-pointer ${
              soundEnabled 
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' 
                : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? "Аудио асаалттай" : "Аудио унтраалттай"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        {/* Upper Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* LEFT: Game Space (8 Columns) */}
          <section className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
            
            {/* Top Config Row (Filters / Avatar Picker) */}
            {gameState === 'idle' && (
              <div id="game-settings-panel" className="p-6 rounded-2xl bg-[#1e293b] border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">Тоглоомын Тохиргоо</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Select Racer Avatar */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 font-sans">Уралдах хөлөг:</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {(['horse', 'car', 'rocket'] as RacerType[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRacer(r)}
                          className={`py-1.5 rounded-lg text-center text-xs md:text-sm transition-all cursor-pointer ${
                            racer === r 
                              ? 'bg-indigo-600 text-white font-bold shadow-md' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {r === 'horse' ? '🐎 Морь' : r === 'car' ? '🚗 Машин' : '🚀 Сансар'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Language */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 font-sans">Дасгалын хэл:</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {(['mn', 'en'] as Language[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setLanguage(l);
                            setUseCustomText(false);
                          }}
                          className={`py-1.5 rounded-lg text-center text-sm font-semibold transition-all cursor-pointer ${
                            language === l && !useCustomText
                              ? 'bg-indigo-600 text-white font-bold' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {l === 'mn' ? 'Монгол' : 'English'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Difficulty */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 font-sans">Хүндрэлийн түвшин:</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setDifficulty(d);
                            setUseCustomText(false);
                          }}
                          className={`py-1.5 rounded-lg text-center text-xs font-semibold transition-all cursor-pointer ${
                            difficulty === d && !useCustomText
                              ? 'bg-indigo-600 text-white font-bold' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {d === 'easy' ? 'Амархан' : d === 'medium' ? 'Дундаж' : 'Хэцүү'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Switch to custom text button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] md:text-xs text-slate-400 font-sans">Эсвэл өөрийн хүссэн бичвэрийг оруулан практик хийх боломжтой:</span>
                  <button
                    onClick={() => setUseCustomText(!useCustomText)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans border transition-all flex items-center gap-1.5 cursor-pointer ${
                      useCustomText 
                        ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Өөрийн бичвэр оруулах</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Text editor overlay pane */}
            {useCustomText && gameState === 'idle' && (
              <div id="custom-text-editor" className="p-6 rounded-2xl bg-[#1e293b] border border-slate-800 flex flex-col gap-3 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <span>📝</span> Та бичих текстээ оруулна уу
                </h3>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Энд практик хийх өгүүлбэрээ хуулж тавина уу. (Хамгийн багадаа 10, дээд тал нь 800 тэмдэгт)"
                  rows={4}
                  className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-sans text-slate-200 outline-none focus:border-indigo-500 transition-colors resize-none"
                />
                {customError && (
                  <p className="text-xs text-rose-400 font-sans flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{customError}</span>
                  </p>
                )}
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => {
                      setUseCustomText(false);
                      setCustomError('');
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white font-sans cursor-pointer"
                  >
                    Цуцлах
                  </button>
                  <button
                    onClick={handleSaveCustomText}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg font-sans transition-colors cursor-pointer"
                  >
                    Текстийг хадгалах
                  </button>
                </div>
              </div>
            )}

            {/* The Race Track */}
            <RaceTrack 
              progress={progressRatio} 
              racer={racer} 
              isFinished={gameState === 'finished'} 
            />

            {/* Core Typing Interaction Box */}
            <TypingArea
              quote={currentQuote}
              gameState={gameState}
              countdown={countdown}
              typedText={typedText}
              onTypedTextChange={handleTypedTextChange}
              onStartGame={handleStartGame}
              onResetGame={handleResetGame}
            />

            {/* Stats Dashboard Grid */}
            <StatsPanel
              wpm={liveWpm}
              accuracy={liveAccuracy}
              errors={errors}
              timeSec={elapsedSeconds}
              isFinished={gameState === 'finished'}
            />

            {/* Reset / Skip options if in active play state */}
            {gameState === 'playing' && (
              <div className="flex items-center justify-between px-2">
                <p className="text-xs text-slate-400 font-sans flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Бичиж дуустал талбар идэвхтэй байна. Алдаа гарвал <b>Backspace</b> дарж засна уу.</span>
                </p>
                <button
                  onClick={handleResetGame}
                  className="text-xs text-slate-400 hover:text-rose-400 font-bold transition-colors flex items-center gap-1 cursor-pointer font-sans"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Бууж өгөх / Дахин эхлэх</span>
                </button>
              </div>
            )}
          </section>

          {/* RIGHT: History log & Tips Panel (4 Columns) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Typing instructions & layout tips */}
            <div id="tips-panel" className="p-5 rounded-2xl bg-[#1e293b]/60 border border-slate-800 flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-sans">
                <Info className="w-4 h-4" />
                <span>Шивэх зөвлөмжүүд</span>
              </h3>
              
              <ul className="text-xs text-slate-400 flex flex-col gap-3 font-sans leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-semibold">1.</span>
                  <span><b>Нүдээ дэлгэцэнд байлга:</b> Гар луугаа харахгүй, зөвхөн дэлгэц дээрх өгүүлбэрийг уншин дагаж шивээрэй.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-semibold">2.</span>
                  <span><b>Алдааг шууд засах:</b> Алдаатай үсэг улаанаар будагдах бөгөөд алдааг засахгүйгээр дараагийн үсэгт шилжих боломжгүй.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-semibold">3.</span>
                  <span><b>Аудио дуу ашиглах:</b> Тоглоомын дуу нь зөв бичих үед зөөлөн товшилт, алдаа гаргахад сэрэмжлүүлэг өгч, шивэх хэмнэлийг тохируулна.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-semibold">4.</span>
                  <span><b>10 хуруугаар шивэх:</b> Гараа зөв байрлуулж 10 хуруугаар шивж сурах нь хурдыг 2-3 дахин өсгөх хамгийн гол түлхүүр юм.</span>
                </li>
              </ul>
            </div>

            {/* Saved Highscores / History logs */}
            <HistoryTable 
              history={history} 
              onClear={handleClearHistory} 
            />

          </aside>
        </div>
      </main>

      {/* Persistent Elegant Footer */}
      <footer className="border-t border-slate-800 py-6 bg-[#1e293b] mt-10 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TypeMaster Pro. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">🟢 WPM: Words Per Minute</span>
            <span>•</span>
            <span className="flex items-center gap-1">🐎 Морь, 🚗 Машин, 🚀 Сансар</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
