/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ConfettiProps {
  active: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'square' | 'triangle';
}

const CONFETTI_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-sky-400',
  'bg-teal-400',
  'bg-yellow-400'
];

export default function Confetti({ active }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const generated: Particle[] = Array.from({ length: 120 }).map((_, i) => {
        const shapeRand = Math.random();
        const shape = shapeRand < 0.4 ? 'circle' : shapeRand < 0.8 ? 'square' : 'triangle';
        return {
          id: i,
          x: Math.random() * 100, // percentage horizontal start
          y: -10 - Math.random() * 20, // start above the viewport
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          size: Math.random() * 10 + 6, // 6px to 16px
          rotation: Math.random() * 360,
          delay: Math.random() * 0.8, // staggered falling
          duration: Math.random() * 2.5 + 2, // fall duration 2s to 4.5s
          shape
        };
      });
      setParticles(generated);
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div id="confetti-overlay" className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => {
        const shapeClass = 
          p.shape === 'circle' 
            ? 'rounded-full' 
            : p.shape === 'triangle' 
              ? 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-current bg-transparent' 
              : 'rounded-sm';

        return (
          <motion.div
            key={p.id}
            className={`absolute ${shapeClass} ${p.shape !== 'triangle' ? p.color : ''}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.shape !== 'triangle' ? p.size : undefined,
              height: p.shape !== 'triangle' ? p.size : undefined,
              color: p.shape === 'triangle' ? 'rgba(99, 102, 241, 0.8)' : undefined,
              opacity: Math.random() * 0.4 + 0.6
            }}
            initial={{ 
              y: '-10%', 
              x: `${p.x}%`, 
              rotation: p.rotation, 
              scale: 0.2 
            }}
            animate={{ 
              y: '110vh', 
              x: `${p.x + (Math.random() * 16 - 8)}%`,
              rotate: p.rotation + Math.random() * 720,
              scale: [0.2, 1, 1, 0.8]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
              repeat: 0
            }}
          />
        );
      })}
    </div>
  );
}
