"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

interface Song {
  name: string;
  artist: string;
}

interface SongSuggestionsProps {
  suggestions: Song[];
}

export default function SongSuggestions({ suggestions }: SongSuggestionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl bg-[#1a2a1a] border-2 border-green-700 rounded-xl p-6 text-left mt-8 shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-green-400 flex items-center">
        <Music2 className="mr-2" />
        You might also like
      </h2>
      <div className="flex flex-wrap gap-4">
        {suggestions.map((song, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="bg-gradient-to-r from-green-700 to-green-600 rounded px-4 py-2 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:from-green-600 group-hover:to-green-500">
              <p className="font-semibold text-green-100 text-sm">
                {song.name}
              </p>
              <p className="text-xs text-green-300">{song.artist}</p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: hoveredIndex === index ? 1 : 0,
                scale: hoveredIndex === index ? 1 : 0.8,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded flex items-center justify-center cursor-pointer shadow-md"
            >
              <span className="text-black text-xs font-bold">+</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
