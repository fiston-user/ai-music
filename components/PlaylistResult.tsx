"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";

interface Song {
  name: string;
  artist: string;
  album?: string;
  year?: string;
  genres?: string[];
  explanation?: string;
  spotifyId?: string;
}

interface PlaylistResultProps {
  playlist: Song[];
}

export default function PlaylistResult({ playlist }: PlaylistResultProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    });
  };

  const copyAllSongs = () => {
    const allSongs = playlist
      .map((song, index) => `${index + 1}. ${song.name} - ${song.artist}`)
      .join("\n");
    copyToClipboard(allSongs);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const createSpotifyPlaylist = async () => {
    setCreatingPlaylist(true);
    try {
      const accessToken = localStorage.getItem("spotifyAccessToken");
      const tokenExpiry = localStorage.getItem("spotifyTokenExpiry");

      if (!accessToken || !tokenExpiry || Date.now() > parseInt(tokenExpiry)) {
        // Token is missing or expired, redirect to auth
        window.location.href = "/api/spotify/auth";
        return;
      }

      const response = await fetch("/api/spotify/create-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          playlistName: "AI Generated Playlist",
          tracks: playlist
            .map((song) =>
              song.spotifyId ? `spotify:track:${song.spotifyId}` : null
            )
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Playlist created successfully!");
      } else {
        throw new Error(data.error || "Failed to create playlist");
      }
    } catch (error) {
      console.error("Error creating Spotify playlist:", error);
      alert("Failed to create Spotify playlist. Please try again.");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mt-6 md:mt-10 bg-[#1a2a1a] border-2 border-green-700 rounded-xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl sm:text-2xl font-bold text-green-400">
          Generated Playlist
        </CardTitle>
        {playlist.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-green-400 border-green-700 hover:bg-green-700 hover:text-green-100"
            onClick={copyAllSongs}
          >
            {copiedAll ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copiedAll ? "Copied!" : "Copy All"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <ul className="space-y-4">
            {playlist.map((song, index) => (
              <li
                key={index}
                className="bg-[#0a2a0a] rounded-lg border-2 border-green-700 p-3 shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-semibold text-green-100">
                        {song.name}
                      </p>
                      <p className="text-sm text-green-400">{song.artist}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:bg-green-700 hover:text-green-100"
                    onClick={() =>
                      copyToClipboard(`${song.name} - ${song.artist}`, index)
                    }
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {(song.album || song.year || song.genres) && (
                  <div className="mt-2 text-xs text-green-300">
                    {song.album && (
                      <span className="mr-2">Album: {song.album}</span>
                    )}
                    {song.year && (
                      <span className="mr-2">Year: {song.year}</span>
                    )}
                    {song.genres && (
                      <span>Genres: {song.genres.join(", ")}</span>
                    )}
                  </div>
                )}
                {song.explanation && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:bg-green-700 hover:text-green-100 p-4"
                      onClick={() => toggleExpand(index)}
                    >
                      {expandedIndex === index
                        ? "Hide explanation"
                        : "Show explanation"}
                      {expandedIndex === index ? (
                        <ChevronUp className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      )}
                    </Button>
                    {expandedIndex === index && (
                      <p className="mt-2 text-sm text-green-200">
                        {song.explanation}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
        <Button
          onClick={createSpotifyPlaylist}
          disabled={creatingPlaylist}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {creatingPlaylist
            ? "Creating Playlist..."
            : "Create Spotify Playlist"}
        </Button>
      </CardContent>
    </Card>
  );
}
