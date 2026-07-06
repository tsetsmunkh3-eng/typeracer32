/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Keyboard, 
  Target, 
  Zap, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface ImprovementGuideProps {
  lastWpm?: number;
  lastAccuracy?: number;
  lastErrors?: number;
  hasFinishedLastRace?: boolean;
}

export default function ImprovementGuide({ 
  lastWpm = 0, 
  lastAccuracy = 0, 
  lastErrors = 0,
  hasFinishedLastRace = false 
}: ImprovementGuideProps) {
  const [activeTab, setActiveTab] = useState<'tips' | 'fingers' | 'posture'>('tips');

  // Generate personalized advice based on the last race stats
  const getPersonalizedAdvice = () => {
    if (!hasFinishedLastRace) {
      return {
        title: "Талбарт гарч уралдаарай!",
        description: "Эхний уралдаанаа дуусгасны дараа таны шивэлтэд тохирсон ухаалаг зөвлөмжүүд энд гарч ирнэ.",
        badge: "Бэлэн байдал",
        badgeColor: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
        icon: <Activity className="w-5 h-5 text-indigo-400" />
      };
    }

    if (lastAccuracy < 90) {
      return {
        title: "Нарийвчлалыг нэгдүгээрт тавь!",
        description: `Таны нарийвчлал ${lastAccuracy}% байна. Хурдан бичих гэж яаралгүйгээр эхлээд алдаагүй шивж сурах нь булчингийн санах ойг зөв хөгжүүлдэг. Алдаагүй бичиж сурвал хурд аяндаа өсөх болно.`,
        badge: "Анхаарах!",
        badgeColor: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        icon: <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
      };
    }

    if (lastAccuracy >= 90 && lastAccuracy < 97) {
      return {
        title: "Хурд болон нарийвчлалын тэнцвэр",
        description: `Сайн байна! Нарийвчлал ${lastAccuracy}% байна. Одоогийн хэмнэлээ хадгалж, хэцүү үсгүүдийн холбоосыг нүдээр харалгүйгээр хурууны мэдрэмжээр бичихэд илүү анхаараарай.`,
        badge: "Тэнцвэржүүлэх",
        badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        icon: <TrendingUp className="w-5 h-5 text-amber-400" />
      };
    }

    if (lastAccuracy >= 97 && lastWpm < 40) {
      return {
        title: "Хурдаа ахиулах цаг боллоо",
        description: `Маш өндөр нарийвчлалтай шивж байна (${lastAccuracy}%). Та сууриа маш сайн тавьсан тул одоо үгсийг бүтнээр нь харж, дараагийн үгийг урьдчилан уншиж хурдаа ахиулаарай.`,
        badge: "Хурдны Сорилт",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        icon: <Zap className="w-5 h-5 text-emerald-400" />
      };
    }

    return {
      title: "Та супер шивэгч байна!",
      description: `Гайхалтай! ${lastWpm} WPM хурдтай, ${lastAccuracy}% нарийвчлалтай байна. Буржгар хаалт, зураас гэх мэт тусгай тэмдэгтүүд оролцсон 'Боломжгүй' түвшний уралдаануудад хүчээ сориорой!`,
      badge: "Төгс Бүтээмж",
      badgeColor: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
      icon: <Award className="w-5 h-5 text-purple-400" />
    };
  };

  const advice = getPersonalizedAdvice();

  // Custom finger areas representation
  const fingerData = [
    { finger: "Чигчий (Зүүн)", keys: ["Ф", "Й", "Я", "1", "Q", "A", "Z", "Shift"], color: "border-rose-500/30 text-rose-400 bg-rose-500/5" },
    { finger: "Ядам (Зүүн)", keys: ["Ц", "Ы", "У", "2", "W", "S", "X"], color: "border-amber-500/30 text-amber-400 bg-amber-500/5" },
    { finger: "Дунд (Зүүн)", keys: ["Б", "Ү", "Ө", "3", "E", "D", "C"], color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" },
    { finger: "Долоовор (Зүүн)", keys: ["Ө", "А", "Р", "П", "4", "5", "R", "T", "F", "G", "V", "B"], color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5" },
    { finger: "Эрхий хуруунууд", keys: ["Зай авах (Spacebar)"], color: "border-slate-500/30 text-slate-400 bg-slate-500/5" },
    { finger: "Долоовор (Баруун)", keys: ["О", "Н", "Е", "М", "6", "7", "Y", "U", "H", "J", "N", "M"], color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5" },
    { finger: "Дунд (Баруун)", keys: ["Г", "И", "Т", "8", "I", "K", ","], color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" },
    { finger: "Ядам (Баруун)", keys: ["Ш", "Л", "Ь", "9", "O", "L", "."], color: "border-amber-500/30 text-amber-400 bg-amber-500/5" },
    { finger: "Чигчий (Баруун)", keys: ["Х", "Ж", "Э", "0", "P", ";", "/", "Enter"], color: "border-rose-500/30 text-rose-400 bg-rose-500/5" }
  ];

  return (
    <div id="improvement-guide" className="w-full bg-[#1e293b]/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 mt-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg md:text-xl font-bold font-display text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Шивэх хурдаа сайжруулах ухаалаг зөвлөгч</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">Төгс шивэгч болоход тань туслах шинжлэх ухааны үндэстэй зөвлөмжүүд</p>
        </div>

        {/* Dynamic / Interactive Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              activeTab === 'tips' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💡 Топ аргууд
          </button>
          <button
            onClick={() => setActiveTab('fingers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              activeTab === 'fingers' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⌨️ 10 Хурууны хуваарилалт
          </button>
          <button
            onClick={() => setActiveTab('posture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              activeTab === 'posture' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧘 Зөв суулт
          </button>
        </div>
      </div>

      {/* Dynamic Diagnostic Insights Bar */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 rounded-xl">
            {advice.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${advice.badgeColor}`}>
                {advice.badge}
              </span>
              <h4 className="text-xs font-bold text-slate-300 font-sans">Сүүлчийн шивэлтийн ухаалаг зөвлөгөө</h4>
            </div>
            <p className="text-sm font-semibold text-white font-sans mt-1">{advice.title}</p>
            <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-xl">{advice.description}</p>
          </div>
        </div>
        {hasFinishedLastRace && (
          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800 shrink-0 self-stretch sm:self-auto justify-around sm:justify-start">
            <div className="text-center">
              <p className="text-[9px] text-slate-400 uppercase font-sans">Хурд</p>
              <p className="text-sm font-mono font-bold text-indigo-400">{lastWpm} WPM</p>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="text-center">
              <p className="text-[9px] text-slate-400 uppercase font-sans">Нарийвчлал</p>
              <p className="text-sm font-mono font-bold text-emerald-400">{lastAccuracy}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid Content based on active tab */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tip 1 */}
          <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Эхлээд нарийвчлал, дараа нь хурд</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Булчингийн санах ой (Muscle Memory) нь алдаагүй давталт дээр үндэслэн бүрэлддэг. Алдаатай хурдан бичих нь буруу зуршлыг бататгадаг тул <b>100% нарийвчлалтай</b> болохыг зорилгоо болгоорой. Хурд аяндаа өсөх болно.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              <span>Гар руу хэзээ ч бүү хар</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Touch Typing-ийн үндсэн нууц бол гар луу харахгүйгээр дэлгэц дээрх бичвэрийг дагаж шивэх явдал юм. Гарны <b>F болон J (А ба О)</b> үсгүүд дээрх жижиг товгор зураас нь хуруугаа харахгүйгээр зөв байрлуулахад зориулагдсан.
            </p>
          </div>

          {/* Tip 3 */}
          <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Дараагийн үгийг урьдчилж унш</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Одоо бичиж буй үгэндээ зөвхөн хурууны хөдөлгөөнийг үлдээгээд, нүдээрээ дараагийн <b>1-2 үгийг урьдчилан уншиж</b> хэмнэлээ тасралтгүй хадгалж сураарай. Энэ нь шивэх хурдыг 50% хүртэл өсгөдөг супер техник юм.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'fingers' && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-500/20 text-xs text-indigo-400 font-sans leading-relaxed flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <span>
              <b>Зөв хуваарилалт:</b> Хуруу бүр гар дээр тодорхой бүсийг хариуцдаг. Доорх хүснэгтийн дагуу хуруунуудаа товшлууруудад дасгаснаар гарны бүх хэсгийг нүдгүйгээр мэдэрч чадна.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fingerData.map((f, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${f.color}`}>
                <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {f.finger}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.keys.map((k, kIdx) => (
                    <span key={kIdx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'posture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Эрүүл бие - Өндөр хурд</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Буруу суулт нь таныг хурдан ядрааж, бугуйнд ачаалал өгснөөр урт хугацаандаа гэмтэл авахад (Carpal Tunnel хамшинж) нөлөөлдөг. Тогтмол дараах дүрмийг баримтлаарай.
            </p>

            <ul className="text-xs text-slate-300 flex flex-col gap-2.5 font-sans list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><b>Тохой 90 хэм:</b> Гараа гарын түшлэг дээр тавихад тохой тэгш өнцөг үүсгэж байх ёстой.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><b>Бугуйг чөлөөтэй байлгах:</b> Бугуйг гарны өмнө хатуу хэсэгт тулж хэт дарахгүй, бага зэрэг хөндий эсвэл зөөлөн дэвсгэр ашиглана.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><b>Нүдний зай:</b> Дэлгэц нүднээс 45-70 см зайд, нүдний түвшнээс бага зэрэг доор байх нь хүзүүний чилэлтийг бууруулна.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl">
              🧘
            </div>
            <div>
              <p className="text-xs font-bold text-white font-sans">30-Минутын дүрэм</p>
              <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">
                Та 30 минут тутамд бичихээ түр зогсоож, бугуй болон хурууны сунгалтын дасгал хийж хэвшээрэй. Энэ нь цусны эргэлтийг сайжруулж, булчинг амраана.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
