"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PlaylistResult from "@/components/PlaylistResult";
import { Loader2, Music } from "lucide-react";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { FaGithub } from "react-icons/fa";

interface Song {
  name: string;
  artist: string;
  album?: string;
  year?: string;
  genres?: string[];
  explanation?: string;
}

export default function Home() {
  const [inputSong, setInputSong] = useState("");
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);

  const allSongs: Song[] = [
    { name: "Bohemian Rhapsody", artist: "Queen" },
    { name: "Imagine", artist: "John Lennon" },
    { name: "Like a Rolling Stone", artist: "Bob Dylan" },
    { name: "Smells Like Teen Spirit", artist: "Nirvana" },
    { name: "Billie Jean", artist: "Michael Jackson" },
    { name: "Hey Jude", artist: "The Beatles" },
    { name: "Purple Rain", artist: "Prince" },
    { name: "Stairway to Heaven", artist: "Led Zeppelin" },
    { name: "What's Going On", artist: "Marvin Gaye" },
    { name: "Respect", artist: "Aretha Franklin" },
    { name: "Born to Run", artist: "Bruce Springsteen" },
    { name: "Hotel California", artist: "Eagles" },
    { name: "Good Vibrations", artist: "The Beach Boys" },
    { name: "London Calling", artist: "The Clash" },
    { name: "Waterloo Sunset", artist: "The Kinks" },
  ];

  useEffect(() => {
    const getRandomSuggestions = (count: number) => {
      const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    setSuggestions(getRandomSuggestions(3));

    const interval = setInterval(() => {
      setSuggestions(getRandomSuggestions(6));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const generatePlaylist = async () => {
    setLoading(true);
    setError("");
    setPlaylist([]);

    try {
      if (!inputSong.trim()) {
        throw new Error("Please enter a song name");
      }

      const response = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song: inputSong }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setPlaylist(data.playlist);
    } catch (error) {
      console.error("Error generating playlist:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1a0a] text-green-300 font-sans">
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <Music className="w-6 h-6 text-green-500" />
          <span className="text-xl font-bold">AI Playlist Generator</span>
        </div>
        <a
          href="https://github.com/fiston-user/ai-music"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:text-green-400 transition-colors duration-200"
        >
          <FaGithub className="w-6 h-6" />
        </a>
      </header>

      <main className="flex flex-col items-center justify-center px-4 py-10 md:py-20 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 text-green-100">
          Generate AI Playlists <br className="hidden sm:inline" />
          in Seconds <span className="text-green-400">✨</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 text-green-400 max-w-2xl">
          Create personalized playlists based on your favorite songs{" "}
          <br className="hidden sm:inline" />
          using advanced AI technology.
        </p>
        <div className="w-full max-w-2xl mb-6">
          <NeonGradientCard>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter a song name"
                value={inputSong}
                onChange={(e) => setInputSong(e.target.value)}
                className="w-full bg-[#0a2a0a] text-green-100 pl-4 pr-20 py-6 md:py-10 rounded-xl text-base md:text-lg outline-none border-none placeholder-green-600 focus-visible:ring-0 focus:ring-green-500 focus:border-transparent"
              />
              <Button
                onClick={generatePlaylist}
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-700 hover:bg-green-600 text-green-100 h-10 px-3 md:px-4 rounded-full flex items-center justify-center text-sm md:text-base"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </NeonGradientCard>
        </div>

        <div className="mt-6 md:mt-8 w-full max-w-2xl">
          <div className="flex flex-wrap justify-center gap-4">
            {playlist.length > 0 ? null : (
              <div className="w-full">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                  Try these suggestions:
                </h3>
                <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                  {suggestions.map((song, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setInputSong(`${song.name} by ${song.artist}`)
                      }
                      className="bg-green-700 hover:bg-green-600 text-green-100 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm transition-colors duration-200"
                    >
                      {song.name} - {song.artist}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 mb-4 md:mb-7">{error}</p>}
        {!loading && playlist.length > 0 && (
          <PlaylistResult playlist={playlist} />
        )}
      </main>
    </div>
  );
}
