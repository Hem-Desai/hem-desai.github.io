import React, { useEffect, useState } from "react";
import { Volume2, VolumeX, CloudRain, Trees, Piano } from "lucide-react";
import useSound from "use-sound";

interface SoundOption {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
}

interface AmbientPlayerProps {
  onAllSoundsPlayed?: () => void;
}

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "piano",
    name: "Soft Piano",
    url: "/sounds/piano.mp3",
    icon: <Piano className="w-4 h-4" />,
  },
  {
    id: "rain",
    name: "Gentle Rain",
    url: "/sounds/rain.mp3",
    icon: <CloudRain className="w-4 h-4" />,
  },
  {
    id: "forest",
    name: "Forest Sounds",
    url: "/sounds/forest.mp3",
    icon: <Trees className="w-4 h-4" />,
  },
];

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  onAllSoundsPlayed,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [previousVolume, setPreviousVolume] = useState(0.15);
  const [currentSound, setCurrentSound] = useState<SoundOption>(
    SOUND_OPTIONS[0]
  );
  const [showControls, setShowControls] = useState(false);
  const [playedSounds, setPlayedSounds] = useState<Set<string>>(new Set());

  const [play, { sound, stop }] = useSound(currentSound.url, {
    volume: isMuted ? 0 : volume,
    loop: true,
    interrupt: true,
  });

  useEffect(() => {
    if (!isMuted) {
      play();
    }
    return () => stop();
  }, [play, stop, currentSound, isMuted]);

  // Add effect to update volume
  useEffect(() => {
    if (sound) {
      sound.volume(isMuted ? 0 : volume);
    }
  }, [sound, volume, isMuted]);

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
      play();
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      stop();
    }
  };

  const changeSound = (sound: SoundOption) => {
    stop();
    setCurrentSound(sound);
    if (!isMuted) {
      play();
    }

    // Track played sounds and check for achievement
    const newPlayedSounds = new Set(playedSounds).add(sound.id);
    setPlayedSounds(newPlayedSounds);

    if (newPlayedSounds.size === SOUND_OPTIONS.length) {
      onAllSoundsPlayed?.();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPreviousVolume(newVolume);

    if (isMuted && newVolume > 0) {
      setIsMuted(false);
      play();
    }

    if (!isMuted && newVolume === 0) {
      setIsMuted(true);
      stop();
    }
  };

  return (
    <div
      className="fixed bottom-6 right-4 flex items-center gap-2 z-50"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div
        className={`flex items-center gap-2 transition-all duration-300 ${
          showControls
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 flex items-center border border-zinc-200 dark:border-zinc-700/20">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-zinc-300 dark:bg-white/30 rounded-lg appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-700 dark:[&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-zinc-700 dark:[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
              hover:bg-zinc-400 dark:hover:bg-white/40 transition-colors"
            aria-label="Volume control"
          />
        </div>
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-full p-1 flex items-center gap-1 border border-zinc-200 dark:border-zinc-700/20">
          {SOUND_OPTIONS.map((sound) => (
            <button
              key={sound.id}
              onClick={() => changeSound(sound)}
              className={`p-2 rounded-full text-zinc-700 dark:text-white
                hover:bg-zinc-200 dark:hover:bg-white/20 transition-all duration-300 
                ${
                  currentSound.id === sound.id
                    ? "bg-zinc-200 dark:bg-white/20"
                    : ""
                }`}
              aria-label={`Play ${sound.name}`}
            >
              {sound.icon}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={toggleMute}
        className="p-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm 
          hover:bg-zinc-200 dark:hover:bg-white/20 transition-all duration-300
          border border-zinc-200 dark:border-zinc-700/20
          text-zinc-700 dark:text-white"
        aria-label={isMuted ? "Unmute ambient sound" : "Mute ambient sound"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5 animate-pulse" />
        )}
      </button>
    </div>
  );
};
