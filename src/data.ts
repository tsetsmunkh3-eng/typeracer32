/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuoteItem } from './types';

export const DEFAULT_QUOTES: QuoteItem[] = [
  // --- MONGOLIAN QUOTES (mn) ---
  // Easy (Short)
  {
    text: "Эв санал нэгдвэл хүч нэмэгдэнэ.",
    author: "Монгол ардын зүйр үг",
    lang: "mn",
    difficulty: "easy"
  },
  {
    text: "Ажил хийвэл ам тосодно.",
    author: "Монгол ардын зүйр үг",
    lang: "mn",
    difficulty: "easy"
  },
  {
    text: "Эрдэмт хүн далай, эгэл хүн булаг.",
    author: "Монгол зүйр цэцэн үг",
    lang: "mn",
    difficulty: "easy"
  },
  {
    text: "Цагийг алдвал алтыг алдана.",
    author: "Монгол зүйр цэцэн үг",
    lang: "mn",
    difficulty: "easy"
  },
  {
    text: "Тэвчээр шийдвэр хоёр уулыг ч нүүлгэж чадна.",
    author: "Монгол сургаал үг",
    lang: "mn",
    difficulty: "easy"
  },
  // Medium
  {
    text: "Хүн сурах тусам улам ухаантай болж, өөрийнхөө мэддэггүй зүйлсийг илүү ихээр ойлгож эхэлдэг билээ.",
    author: "Сурган хүмүүжүүлэгч",
    lang: "mn",
    difficulty: "medium"
  },
  {
    text: "Монгол орны уудам тал нутагт морин дэл дээр давхиж яваа хүн дэлхий дээрх хамгийн эрх чөлөөтэй хүн шиг санагддаг.",
    author: "Аялагчдын тэмдэглэл",
    lang: "mn",
    difficulty: "medium"
  },
  {
    text: "Сурна гэдэг насан туршийн аялал бөгөөд хэзээ ч хожимддоггүй, хэзээ ч дуусдаггүй гайхалтай үйл явц юм.",
    author: "Монгол ухаан",
    lang: "mn",
    difficulty: "medium"
  },
  {
    text: "Ухаантай хүн алдаанаасаа суралцдаг бол ухаангүй хүн бусдыг буруутгаж, өөрийнхөө алдааг давтсаар байдаг.",
    author: "Гүн ухааны сургаал",
    lang: "mn",
    difficulty: "medium"
  },
  // Hard (Long/Complex layout)
  {
    text: "Хурдан бичиж сурах нь зөвхөн хурууны хөдөлгөөн төдийгүй тархи, нүд, гарны гайхалтай уялдан зохицох чадвар бөгөөд байнгын дасгал сургуулилалтын үр дүнд төгс хөгждөг ажээ.",
    author: "Технологийн зөвлөгөө",
    lang: "mn",
    difficulty: "hard"
  },
  {
    text: "Бидний амьдрал бол сонголтын цуглуулга бөгөөд өнөөдөр хийсэн жижигхэн зөв сонголт, тууштай хөдөлмөр ирээдүйн агуу амжилт, аз жаргалын бат бөх үндэс суурь болох нь дамжиггүй.",
    author: "Хөгжлийн сургаал",
    lang: "mn",
    difficulty: "hard"
  },
  {
    text: "Монгол улсын тусгаар тогтнол, үндэсний соёл урлаг, эх хэл минь бидний оршин тогтнохын баталгаа тул залуу хойч үе маань түүнийг хайрлан хамгаалж, уламжлан хөгжүүлэх үүрэгтэй билээ.",
    author: "Түүхийн сургаал",
    lang: "mn",
    difficulty: "hard"
  },
  // Impossible (Complex punctuations & symbols & long length)
  {
    text: "Хорвоогийн хамгийн хүнд бичвэрийг 99.9% нарийвчлалтай шивэхэд: Нар, Сар, Одон орон, Газар шорооны хувьсал лугаа адил төвлөрөл шаардана (Жишээ нь: 'Байгаль-Орчин', 123-р сургууль, @Твиттер/Фэйсбүүк, $100.50)!",
    author: "Шивэлтийн сорилт",
    lang: "mn",
    difficulty: "impossible"
  },
  {
    text: "Монгол хэлний өвөрмөц хэлцүүд: 'Аргагүй амраг', 'Эрээгүй хэрүүл', 'Шударга ёс' зэрэг холбоо үгс, цэг, таслал, хашилт тэмдэг («...»), зураас (—) зэргийг туйлын зөв, тууштай бичих нь таныг супер түвшинд хүргэнэ.",
    author: "Эх хэлний соёл",
    lang: "mn",
    difficulty: "impossible"
  },

  // --- ENGLISH QUOTES (en) ---
  // Easy (Short)
  {
    text: "The quick brown fox jumps over the lazy dog.",
    author: "Pangram",
    lang: "en",
    difficulty: "easy"
  },
  {
    text: "Practice makes perfect when you are persistent.",
    author: "Proverb",
    lang: "en",
    difficulty: "easy"
  },
  {
    text: "Believe you can and you are halfway there.",
    author: "Theodore Roosevelt",
    lang: "en",
    difficulty: "easy"
  },
  {
    text: "Simple is better than complex and messy.",
    author: "Zen of Python",
    lang: "en",
    difficulty: "easy"
  },
  // Medium
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    lang: "en",
    difficulty: "medium"
  },
  {
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
    author: "Steve Jobs",
    lang: "en",
    difficulty: "medium"
  },
  {
    text: "In the middle of every difficulty lies a beautiful opportunity to grow and learn.",
    author: "Albert Einstein",
    lang: "en",
    difficulty: "medium"
  },
  // Hard
  {
    text: "Typography is the craft of endowing a human language with a durable visual form, turning thoughts and spoken words into beautiful and long-lasting works of art.",
    author: "Robert Bringhurst",
    lang: "en",
    difficulty: "hard"
  },
  {
    text: "Programming is not about what you know; it is about what you can figure out, combined with the patience to test, debug, and learn from constant failures.",
    author: "Software Engineer",
    lang: "en",
    difficulty: "hard"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us, for we possess the power to shape our own destiny with determination.",
    author: "Ralph Waldo Emerson",
    lang: "en",
    difficulty: "hard"
  },
  // Impossible (Symbols, numbers, complex typography)
  {
    text: "The dynamic multi-threaded CPU executed 1,500,000 instructions/sec while utilizing 98.7% of L1/L2 caches; this successfully minimized system latency (i.e. <0.05ms) by ~12.5% under heavy stress!",
    author: "System Benchmarks",
    lang: "en",
    difficulty: "impossible"
  },
  {
    text: "Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them? To die: to sleep; no more; and by a sleep to say we end!",
    author: "William Shakespeare (Hamlet)",
    lang: "en",
    difficulty: "impossible"
  }
];
