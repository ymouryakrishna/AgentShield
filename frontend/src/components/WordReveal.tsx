import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface WordRevealProps {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  word,
  index,
  total,
  progress,
}) => {
  const start = index / total;
  const end = (index + 1) / total;

  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const color = useTransform(
    progress,
    [start, end],
    ['hsl(0 0% 35%)', 'hsl(0 0% 100%)']
  );

  return (
    <motion.span
      style={{ opacity, color }}
      className="mr-[0.3em] inline-block will-change-[opacity,color]"
    >
      {word}
    </motion.span>
  );
};
