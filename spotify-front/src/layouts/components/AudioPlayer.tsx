// import { usePlayerStore } from "@/store/usePlayerStore";
// import { useEffect, useRef } from "react";

// const AudioPlayer = () => {
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const prevSongRef = useRef<string | null>(null);

//   const { currentSong, isPlaying, playNext } = usePlayerStore();

//   // handle play/pause logic
//   useEffect(() => {
//     if (isPlaying) audioRef.current?.play();
//     else audioRef.current?.pause();
//   }, [isPlaying]);

//   // handle song ends
//   useEffect(() => {
//     const audio = audioRef.current;

//     const handleEnded = () => {
//       playNext();
//     };

//     audio?.addEventListener("ended", handleEnded);

//     return () => audio?.removeEventListener("ended", handleEnded);
//   }, [playNext]);

//   // handle song changes
//   useEffect(() => {
//     if (!audioRef.current || !currentSong) return;

//     const audio = audioRef.current;

//     // check if this is actually a new song
//     const isSongChange = prevSongRef.current !== currentSong?.audioKey;
//     if (isSongChange) {
//       audio.src = currentSong?.audioKey;
//       // reset the playback position
//       audio.currentTime = 0;

//       prevSongRef.current = currentSong?.audioKey;

//       if (isPlaying) audio.play();
//     }
//   }, [currentSong, isPlaying]);

//   return <audio ref={audioRef} />;
// };
// export default AudioPlayer;

import { usePlayerStore } from "@/store/usePlayerStore";
import { useEffect, useRef } from "react";
import { getSignedUrl } from "@/api/signedUrl"; // make sure path is correct

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
