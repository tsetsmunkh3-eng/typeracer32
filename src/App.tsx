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
  Sparkle,
  Users,
  Copy,
  LogOut,
  Crown,
  UserCheck,
  RefreshCw,
  User
} from 'lucide-react';
import { RacerType, Language, Difficulty, GameState, HistoryItem, QuoteItem, MultiplayerPlayer, MultiplayerLobby } from './types';
import { DEFAULT_QUOTES } from './data';
import { sounds } from './utils/audio';

// Components
import RaceTrack from './components/RaceTrack';
import MultiplayerRaceTrack from './components/MultiplayerRaceTrack';
import StatsPanel from './components/StatsPanel';
import TypingArea from './components/TypingArea';
import HistoryTable from './components/HistoryTable';
import Confetti from './components/Confetti';
import ImprovementGuide from './components/ImprovementGuide';

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

  // Multiplayer States
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [lobby, setLobby] = useState<MultiplayerLobby | null>(null);
  const [playerId, setPlayerId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [mpName, setMpName] = useState(() => {
    return localStorage.getItem('typeracer_mp_name') || '';
  });
  const [mpAvatar, setMpAvatar] = useState('🚗');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lobbyError, setLobbyError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [showMpSetup, setShowMpSetup] = useState(false);

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

  // Synchronize progress to server in multiplayer
  useEffect(() => {
    if (isMultiplayer && ws && ws.readyState === WebSocket.OPEN && gameState === 'playing') {
      const currentMatchingLength = getMatchingLength(typedText, currentQuote.text);
      const progressRatio = currentQuote.text.length > 0 ? (currentMatchingLength / currentQuote.text.length) : 0;
      const percentage = Math.round(progressRatio * 100);

      const elapsed = elapsedSeconds || 1;
      const liveWpm = Math.round((currentMatchingLength / 5) / (elapsed / 60));
      const liveAccuracy = typedText.length > 0
        ? Math.max(0, Math.min(Math.round((currentMatchingLength / typedText.length) * 100), 100))
        : 100;

      ws.send(JSON.stringify({
        type: "progress",
        payload: {
          progress: percentage,
          wpm: liveWpm,
          accuracy: liveAccuracy
        }
      }));
    }
  }, [typedText, isMultiplayer, gameState, elapsedSeconds]);

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

  // Multiplayer client logic
  const handleJoinRoom = (code: string) => {
    if (!mpName.trim()) {
      setLobbyError("Нэрээ оруулна уу.");
      return;
    }
    setLobbyError("");
    const upperCode = code.trim().toUpperCase();
    if (!upperCode) {
      setLobbyError("Өрөөний кодоо оруулна уу.");
      return;
    }

    localStorage.setItem('typeracer_mp_name', mpName.trim());

    if (ws) {
      ws.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "join",
        payload: {
          lobbyId: upperCode,
          playerName: mpName.trim(),
          avatar: mpAvatar,
          lang: language,
          difficulty: difficulty
        }
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "joined") {
          setPlayerId(data.payload.playerId);
          setCreatedRoomCode(data.payload.lobbyId);
          setIsMultiplayer(true);
          setCurrentQuote(data.payload.quote);
          setTypedText("");
          setErrors(0);
          setElapsedSeconds(0);
          setGameState("idle");
        }
        else if (data.type === "lobby_state") {
          const serverLobby = data.payload;
          setLobby(serverLobby);
          
          if (serverLobby.lang) setLanguage(serverLobby.lang);
          if (serverLobby.difficulty) setDifficulty(serverLobby.difficulty);
          if (serverLobby.quote) setCurrentQuote(serverLobby.quote);

          if (serverLobby.state === 'countdown') {
            setGameState('countdown');
            setCountdown(serverLobby.countdown);
          } else if (serverLobby.state === 'playing') {
            setGameState('playing');
          } else if (serverLobby.state === 'finished') {
            setGameState('finished');
          } else if (serverLobby.state === 'waiting') {
            setGameState('idle');
          }
        }
        else if (data.type === "race_started") {
          setGameState("playing");
          setTypedText("");
          setErrors(0);
          setElapsedSeconds(0);
          setStartTime(data.payload.startTime);
          setCurrentQuote(data.payload.quote);
          sounds.playSuccess();
        }
        else if (data.type === "error") {
          setLobbyError(data.payload);
          socket.close();
        }
      } catch (e) {
        console.error("Error parsing WS message:", e);
      }
    };

    socket.onclose = () => {
      setIsMultiplayer(false);
      setLobby(null);
      setWs(null);
    };

    socket.onerror = (err) => {
      console.error("WS error:", err);
      setLobbyError("Сэрвэртэй холбогдоход алдаа гарлаа.");
    };

    setWs(socket);
  };

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    handleJoinRoom(code);
  };

  const handleToggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "ready",
        payload: { isReady: newReadyState }
      }));
    }
  };

  const handleStartMpRace = () => {
    if (ws && ws.readyState === WebSocket.OPEN && lobby?.players[playerId]?.isHost) {
      ws.send(JSON.stringify({
        type: "start_race"
      }));
    }
  };

  const handleLeaveLobby = () => {
    if (ws) {
      ws.close();
    }
    setIsMultiplayer(false);
    setLobby(null);
    setWs(null);
    setGameState('idle');
    setTypedText('');
    setErrors(0);
    setElapsedSeconds(0);
  };

  const handleLobbyConfigChange = (newLang: Language, newDiff: Difficulty) => {
    setLanguage(newLang);
    setDifficulty(newDiff);
    if (ws && ws.readyState === WebSocket.OPEN && lobby?.players[playerId]?.isHost) {
      ws.send(JSON.stringify({
        type: "config_change",
        payload: { lang: newLang, difficulty: newDiff }
      }));
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

  // Alignment helper that allows skipping specified punctuation characters
  const getAlignedTypedText = (rawInput: string, targetText: string): string => {
    const OPTIONAL_CHARS = [',', ':', "'", '"', ';', '‘', '’', '“', '”', '`', '«', '»', '—', '-'];
    
    let targetIdx = 0;
    let result = '';
    
    for (let inputIdx = 0; inputIdx < rawInput.length; inputIdx++) {
      const inputChar = rawInput[inputIdx];
      
      // Auto-advance target index over any optional characters that the user did NOT type
      while (
        targetIdx < targetText.length && 
        OPTIONAL_CHARS.includes(targetText[targetIdx]) && 
        targetText[targetIdx] !== inputChar
      ) {
        result += targetText[targetIdx];
        targetIdx++;
      }
      
      if (targetIdx < targetText.length) {
        const targetChar = targetText[targetIdx];
        if (inputChar === targetChar) {
          result += targetChar;
          targetIdx++;
        } else {
          // Mismatch
          result += inputChar;
          targetIdx++;
        }
      } else {
        result += inputChar;
      }
    }

    // Auto-advance any remaining optional trailing characters at the end
    while (
      targetIdx < targetText.length && 
      (OPTIONAL_CHARS.includes(targetText[targetIdx]) || ['.', '!', '?'].includes(targetText[targetIdx]))
    ) {
      result += targetText[targetIdx];
      targetIdx++;
    }
    
    return result;
  };

  // Keystroke value analysis & error detection
  const handleTypedTextChange = (rawInput: string) => {
    if (gameState !== 'playing') return;

    const targetText = currentQuote.text;
    const alignedText = getAlignedTypedText(rawInput, targetText);

    // Completion is checked on the aligned text matching targetText fully
    const isCompleted = alignedText === targetText;

    const isAddition = alignedText.length > typedText.length;
    
    if (isAddition) {
      let hasErrorInStroke = false;
      // Evaluate correctness of all newly added characters in the aligned text
      for (let i = typedText.length; i < alignedText.length; i++) {
        if (alignedText[i] !== targetText[i]) {
          hasErrorInStroke = true;
          break;
        }
      }

      if (!hasErrorInStroke) {
        sounds.playKey();
      } else {
        setErrors((prev) => prev + 1);
        sounds.playError();
      }
    }

    setTypedText(alignedText);

    // Finish Condition
    if (isCompleted) {
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
      <Confetti active={gameState === 'finished'} />
      
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
            
            {/* Top Config Row (Filters / Avatar Picker / Multiplayer Mode) */}
            {gameState === 'idle' && (
              <div id="game-settings-panel" className="p-6 rounded-2xl bg-[#1e293b] border border-slate-800 flex flex-col gap-4 shadow-xl">
                {/* Mode Tabs */}
                {!isMultiplayer && (
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    <button
                      onClick={() => { setShowMpSetup(false); setUseCustomText(false); }}
                      className={`py-2 text-xs md:text-sm font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !showMpSetup 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🎯 Ганцаарчилсан дасгал</span>
                    </button>
                    <button
                      onClick={() => setShowMpSetup(true)}
                      className={`py-2 text-xs md:text-sm font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        showMpSetup 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>👥 Олон тоглогчийн өрөө</span>
                    </button>
                  </div>
                )}

                {/* Conditional views */}
                {isMultiplayer && lobby ? (
                  /* MULTIPLAYER LOBBY SCREEN */
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <span className="text-sm font-extrabold uppercase tracking-wider text-slate-100 font-sans">
                          Уралдааны Өрөө
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 font-sans">Өрөөний код:</span>
                        <div className="flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                          <span className="font-mono font-black text-emerald-400 tracking-wider text-base">
                            {lobby.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(lobby.id);
                              sounds.playSuccess();
                            }}
                            className="p-1 hover:text-emerald-400 text-slate-500 transition-colors cursor-pointer"
                            title="Кодыг хуулах"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Room Config Info / Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="font-semibold text-slate-400 font-sans">Дасгалын хэл ба хүндрэл:</span>
                        {lobby.players[playerId]?.isHost ? (
                          <div className="flex gap-2">
                            <select
                              value={language}
                              onChange={(e) => handleLobbyConfigChange(e.target.value as Language, difficulty)}
                              className="bg-[#1e293b] border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none text-xs font-sans cursor-pointer"
                            >
                              <option value="mn">Монгол</option>
                              <option value="en">English</option>
                            </select>
                            <select
                              value={difficulty}
                              onChange={(e) => handleLobbyConfigChange(language, e.target.value as Difficulty)}
                              className="bg-[#1e293b] border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none text-xs font-sans cursor-pointer"
                            >
                              <option value="easy">Амархан</option>
                              <option value="medium">Дундаж</option>
                              <option value="hard">Хэцүү</option>
                              <option value="impossible">Боломжгүй</option>
                            </select>
                          </div>
                        ) : (
                          <span className="font-bold font-sans text-indigo-400 flex items-center gap-1.5">
                            <span>🌍</span> {lobby.lang === 'mn' ? 'Монгол' : 'English'} — {lobby.difficulty === 'easy' ? 'Амархан' : lobby.difficulty === 'medium' ? 'Дундаж' : lobby.difficulty === 'hard' ? 'Хэцүү' : 'Боломжгүй'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-semibold text-slate-400 font-sans">Өрөөний статус:</span>
                        <span className="font-bold text-slate-300 font-sans flex items-center gap-1.5">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                          <span>Бусад уралдагчдыг хүлээж байна...</span>
                        </span>
                      </div>
                    </div>

                    {/* Lobby Player List cards */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Холбогдсон тоглогчид:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(Object.values(lobby.players) as MultiplayerPlayer[]).map((p) => (
                          <div 
                            key={p.id} 
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              p.id === playerId 
                                ? 'bg-indigo-950/20 border-indigo-500/30' 
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{p.avatar || '🚗'}</span>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-200 font-sans flex items-center gap-1">
                                  {p.name}
                                  {p.id === playerId && <span className="text-[9px] text-indigo-400 font-sans bg-indigo-500/10 px-1 py-0.2 rounded ml-1">Би</span>}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {p.id}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {p.isHost ? (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                                  <Crown className="w-3 h-3" /> Эзэн
                                </span>
                              ) : p.isReady ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                                  <UserCheck className="w-3 h-3" /> Бэлэн
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                                  ⏳ Бэлдэж буй
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Room lobby buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <button
                        onClick={handleLeaveLobby}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl font-sans transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Өрөөнөөс гарах</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {!lobby.players[playerId]?.isHost && (
                          <button
                            onClick={handleToggleReady}
                            className={`px-5 py-2 text-xs font-extrabold rounded-xl font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                              isReady 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isReady ? 'Бэлэн' : 'Бэлэн дарах'}</span>
                          </button>
                        )}

                        {lobby.players[playerId]?.isHost && (
                          <button
                            onClick={handleStartMpRace}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl font-sans transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer animate-pulse"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Уралдааныг эхлүүлэх</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : showMpSetup ? (
                  /* MULTIPLAYER SETUP SCREEN */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
                        Олон тоглогчийн өрөөний тохиргоо
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 font-sans">Таны нэр:</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            maxLength={15}
                            value={mpName}
                            onChange={(e) => setMpName(e.target.value)}
                            placeholder="Өөрийн нэрээ оруулна уу"
                            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-sans text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Avatar chooser */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 font-sans">Дуртай аватар хөлөг сонгох:</label>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                          {['🚗', '🏎️', '🚀', '🐎', '🛸', '🏍️', '🛹', '🐯', '🦖', '🦁'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setMpAvatar(emoji)}
                              className={`py-1 text-center text-lg rounded transition-all cursor-pointer ${
                                mpAvatar === emoji 
                                  ? 'bg-indigo-600/30 scale-110 border border-indigo-500/40 shadow-inner' 
                                  : 'hover:bg-slate-800'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Join / Create actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                      {/* Join Room */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 font-sans">Кодоор өрөөнд орох:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Кодоо оруулна уу (жишээ: ABCD)"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="flex-1 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono tracking-widest text-slate-200 uppercase outline-none focus:border-indigo-500 transition-colors"
                          />
                          <button
                            onClick={() => handleJoinRoom(roomCode)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg font-sans transition-colors cursor-pointer"
                          >
                            Өрөөнд орох
                          </button>
                        </div>
                      </div>

                      {/* Create Room */}
                      <div className="flex flex-col justify-end">
                        <button
                          onClick={handleCreateRoom}
                          className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-indigo-400 font-bold text-xs rounded-lg font-sans transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <span>👥 Өрөө шинээр үүсгэх</span>
                        </button>
                      </div>
                    </div>

                    {/* Lobby joining error */}
                    {lobbyError && (
                      <p className="text-xs text-rose-400 font-sans flex items-center gap-1 mt-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{lobbyError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* SINGLE PLAYER PRACTICE SETUP */
                  <>
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
                        <div className="grid grid-cols-4 gap-1 md:gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                          {(['easy', 'medium', 'hard', 'impossible'] as Difficulty[]).map((d) => (
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
                              {d === 'easy' ? 'Амархан' : d === 'medium' ? 'Дундаж' : d === 'hard' ? 'Хэцүү' : 'Боломжгүй'}
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
                  </>
                )}
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
            {isMultiplayer ? (
              <MultiplayerRaceTrack 
                players={lobby?.players || {}} 
                selfId={playerId} 
              />
            ) : (
              <RaceTrack 
                progress={progressRatio} 
                racer={racer} 
                isFinished={gameState === 'finished'} 
              />
            )}

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

            {/* Multiplayer Leaderboard Podium */}
            {isMultiplayer && lobby && gameState === 'finished' && (
              <div className="p-5 rounded-2xl bg-[#1e293b]/80 border border-emerald-500/30 shadow-xl flex flex-col gap-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
                  <span>🏆</span> Уралдааны Тэргүүлэгчид (Leaderboard)
                </h3>
                <div className="flex flex-col gap-2">
                  {(Object.values(lobby.players) as MultiplayerPlayer[])
                    .sort((a, b) => {
                      if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
                      if (a.finished) return -1;
                      if (b.finished) return 1;
                      return b.progress - a.progress;
                    })
                    .map((p, index) => {
                      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏎️';
                      return (
                        <div 
                          key={p.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            p.id === playerId 
                              ? 'bg-indigo-950/40 border-indigo-500/30 font-bold' 
                              : 'bg-slate-900/50 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{medal}</span>
                            <span className="text-sm font-sans text-slate-200">
                              {p.name} {p.id === playerId && <span className="text-[10px] text-indigo-400 font-sans ml-1">(Би)</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 font-mono text-xs">
                            {p.finished ? (
                              <span className="text-emerald-400 font-bold">
                                {((p.finishTime || 0) / 1000).toFixed(1)}с ({Math.round(p.wpm)} WPM)
                              </span>
                            ) : (
                              <span className="text-slate-500">
                                Шивж байна ({Math.round(p.progress)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="flex justify-end mt-2">
                  {lobby.players[playerId]?.isHost && (
                    <button
                      onClick={handleStartMpRace}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg font-sans transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Дахин уралдах</span>
                    </button>
                  )}
                </div>
              </div>
            )}


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

        {/* Ways to Improve Typing Speed */}
        <ImprovementGuide 
          lastWpm={history[0]?.wpm}
          lastAccuracy={history[0]?.accuracy}
          lastErrors={history[0]?.errors}
          hasFinishedLastRace={history.length > 0}
        />
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
