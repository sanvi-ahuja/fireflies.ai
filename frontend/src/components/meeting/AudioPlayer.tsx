"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, FastForward } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string;
  currentTime: number;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number) => void;
}

export default function AudioPlayer({ audioUrl, currentTime, onSeek, onTimeUpdate }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Sync external seek jumps
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleSpeedChange = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#121721] border border-[#202b3d] rounded-xl p-4 flex items-center justify-between shadow-lg">
      <audio
        ref={audioRef}
        src={audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Controls Left */}
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-md shadow-violet-600/30 hover:scale-105 transition-all cursor-pointer"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={() => {
            if (audioRef.current) {
              const newT = Math.max(0, audioRef.current.currentTime - 5);
              audioRef.current.currentTime = newT;
              onSeek(newT);
            }
          }}
          title="Rewind 5s"
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1c2433]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Waveform Slider Center */}
      <div className="flex-1 mx-6 flex items-center space-x-3">
        <span className="text-xs font-mono text-violet-300 w-12 text-right">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-[#1e2736] rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
        <span className="text-xs font-mono text-slate-400 w-12">{formatTime(duration)}</span>
      </div>

      {/* Controls Right */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleSpeedChange}
          className="px-2.5 py-1 rounded bg-[#1c2433] border border-[#253145] text-xs font-mono text-violet-300 font-semibold hover:border-violet-500 transition-colors"
        >
          {playbackRate}x
        </button>
        <Volume2 className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}
