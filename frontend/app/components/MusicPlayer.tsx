"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react"; // Optional: install lucide-react for icons


const APIURL = process.env.NEXT_PUBLIC_APIURL;

function formatTime(time: number) {
    const mins = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const secs = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    return `${mins}:${secs}`;
}

export default function MusicPlayer({ musicid }: { musicid: number }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);


    const musicUrl = `${APIURL}/supradrive/music/${musicid}`;
    const token = sessionStorage.getItem("supradrivetoken");

    // Create a proxied URL with auth token if needed
    const src = token ? `${musicUrl}?token=${encodeURIComponent(token)}` : null;

    const changeVolume = (delta: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newVolume = Math.min(1, Math.max(0, volume + delta));
        setVolume(newVolume);
        audio.volume = newVolume;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const setAudioDuration = () => {
            setDuration(audio.duration);

            // Try autoplay after metadata is loaded
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch((error) => {
                        console.warn("Autoplay failed:", error);
                        setIsPlaying(false);
                    });
            }
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setAudioDuration);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
        };
    }, []);


    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * audio.duration;
        audio.currentTime = newTime;
    };


    return (
        <div>
            {src ? (
                <div className="w-full p-4 rounded-2xl bg-neutral-900 shadow-lg flex flex-col space-y-4 text-white">
                    <audio ref={audioRef} src={src} preload="metadata" />
                    <div className="flex items-center justify-between">
                        <button
                            onClick={togglePlay}
                            className="bg-neutral-800 hover:bg-neutral-700 transition rounded-full p-3 shadow-inner"
                        >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => changeVolume(-0.1)}
                                className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded-full"
                                title="Volume Down"
                            >
                                🔉
                            </button>
                            <span className="text-sm text-neutral-400 w-10 text-center">
                                {Math.round(volume * 100)}%
                            </span>
                            <button
                                onClick={() => changeVolume(0.1)}
                                className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded-full"
                                title="Volume Up"
                            >
                                🔊
                            </button>
                        </div>

                        <span className="text-sm text-neutral-400">
                            {formatTime(duration * (progress / 100))} / {formatTime(duration)}
                        </span>
                    </div>

                    <div
                        className="relative h-2 bg-neutral-700 rounded-full overflow-hidden cursor-pointer"
                        onClick={handleSeek}
                    >
                        <div
                            className="absolute h-full bg-purple-500 transition-all"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                </div>
            ) : (
                <p>Loading music...</p>
            )}
        </div>
    );
}
