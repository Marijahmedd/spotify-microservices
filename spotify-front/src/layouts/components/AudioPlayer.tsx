import { usePlayerStore } from "@/store/usePlayerStore";
import { useEffect, useRef } from "react";
import { getSignedUrl } from "@/api/signedUrl"; 

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSongRef = useRef<string | null>(null);
  const { currentSong, isPlaying, playNext } = usePlayerStore();

  // Fetch signed URL whenever currentSong changes
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!currentSong) return;

      try {
        const url = await getSignedUrl(currentSong.id);
        prevSongRef.current = currentSong.id;

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.currentTime = 0;
          if (isPlaying) audioRef.current.play();
        }
      } catch (err) {
        console.error("Error fetching signed URL:", err);
      }
    };

    const isSongChanged = currentSong?.id !== prevSongRef.current;
    if (isSongChanged && currentSong) {
      fetchSignedUrl();
    }
  }, [currentSong]);

  // Play/pause toggle
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) audioRef.current.play().catch(console.error);
    else audioRef.current.pause();
  }, [isPlaying]);

  // Play next when song ends
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => playNext();

    audio?.addEventListener("ended", handleEnded);
    return () => audio?.removeEventListener("ended", handleEnded);
  }, [playNext]);

  return <audio ref={audioRef} />;
};

export default AudioPlayer;
