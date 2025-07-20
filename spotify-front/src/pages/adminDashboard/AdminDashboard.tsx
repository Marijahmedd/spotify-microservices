import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  Album,
  Plus,
  Trash2,
  Clock,
  User,
  Image,
  FileAudio,
  Loader2,
  Home,

} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { Link } from "react-router-dom";

const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL;

interface Album {
  id: string;
  name: string;
  artist: string;
  thumbnailKey: string;
  thumbnailUrl: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioKey: string;
  duration: number;
  imageUrl: string;
  albumId: string;
}

const AdminDashboard = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState({
    albums: false,
    songs: false,
    creatingAlbum: false,
    creatingSong: false,
    deletingAlbum: "",
    deletingSong: "",
  });

  const albumThumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const songAudioInputRef = useRef<HTMLInputElement | null>(null);
  const songImageInputRef = useRef<HTMLInputElement | null>(null);

  // Album form state
  const [albumName, setAlbumName] = useState("");
  const [albumArtist, setAlbumArtist] = useState("");
  const [albumThumbnailFile, setAlbumThumbnailFile] = useState<File | null>(
    null
  );

  // Song form state
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songAudioFile, setSongAudioFile] = useState<File | null>(null);
  const [songImageFile, setSongImageFile] = useState<File | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");

  const log = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    console.log(`[${timestamp}] ${emoji} ${message}`);
  };

  useEffect(() => {
    fetchAlbums();
    fetchAllSongs();
  }, []);

  const fetchAlbums = async () => {
    setLoading((prev) => ({ ...prev, albums: true }));
    log("Fetching albums...");
    try {
      const res = await adminApi.get("/album");
      log(`Successfully fetched ${res.data.albums.length} albums`, "success");
      setAlbums(res.data.albums);
    } catch (err) {
      log("Failed to fetch albums", "error");
      toast.error("Failed to fetch albums");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, albums: false }));
    }
  };

  const fetchAllSongs = async () => {
    setLoading((prev) => ({ ...prev, songs: true }));
    log("Fetching all songs...");
    try {
      const res = await adminApi.get("/song");
      setSongs(res.data.songs);
      log(`Successfully fetched ${res.data.songs.length} songs`, "success");
    } catch (err) {
      log("Failed to fetch songs", "error");
      toast.error("Failed to fetch songs");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, songs: false }));
    }
  };

  const uploadToS3 = async (file: File, type: "song" | "thumbnail") => {
    log(`Starting upload for ${type}: ${file.name}`);
    try {
      const { presignedURL, fileKey } = (
        await adminApi.post("/upload-url", { type })
      ).data;

      log(`Got presigned URL for ${type}, uploading to S3...`);
      await fetch(presignedURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      log(`Successfully uploaded ${type} to S3: ${fileKey}`, "success");
      return fileKey;
    } catch (err) {
      log(`Failed to upload ${type} to S3`, "error");
      throw err;
    }
  };

  const handleCreateAlbum = async () => {
    if (!albumThumbnailFile) {
      log("Album creation failed: No thumbnail file selected", "error");
      toast.error("Upload album image");
      return;
    }

    setLoading((prev) => ({ ...prev, creatingAlbum: true }));
    log("Creating new album...");

    try {
      const thumbnailKey = await uploadToS3(albumThumbnailFile, "thumbnail");

      await adminApi.post("/album", {
        name: albumName,
        artist: albumArtist,
        thumbnailKey,
      });

      log(
        `Album "${albumName}" by ${albumArtist} created successfully`,
        "success"
      );
      toast.success("Album created");
      setAlbumThumbnailFile(null);
      if (albumThumbnailInputRef.current) {
        albumThumbnailInputRef.current.value = "";
      }
      setAlbumName("");
      setAlbumArtist("");

      fetchAlbums();
    } catch (err) {
      log("Failed to create album", "error");
      toast.error("Failed to create album");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, creatingAlbum: false }));
    }
  };

  const handleCreateSong = async () => {
    if (!songAudioFile || !songImageFile) {
      log("Song creation failed: Missing audio or image file", "error");
      toast.error("Upload both audio and image");
      return;
    }
    if (!selectedAlbumId) {
      log("Song creation failed: No album selected", "error");
      toast.error("Select album");
      return;
    }

    setLoading((prev) => ({ ...prev, creatingSong: true }));
    log("Creating new song...");

    try {
      // Calculate duration first
      const audio = new Audio();
      audio.src = URL.createObjectURL(songAudioFile);
      const duration = await new Promise<number>((resolve) => {
        audio.onloadedmetadata = () => {
          const dur = Math.floor(audio.duration);
          log(`Audio duration calculated: ${dur} seconds`);
          resolve(dur);
        };
      });

      log("Uploading song files...");
      const [audioKey, imageKey] = await Promise.all([
        uploadToS3(songAudioFile, "song"),
        uploadToS3(songImageFile, "thumbnail"),
      ]);

      await adminApi.post("/song", {
        title: songTitle,
        artist: songArtist,
        audioKey,
        duration,
        albumId: selectedAlbumId,
        imageUrl: imageKey,
      });

      log(
        `Song "${songTitle}" by ${songArtist} created successfully`,
        "success"
      );

      toast.success("Song created");

      // Reset form
      if (songAudioInputRef.current) {
        songAudioInputRef.current.value = "";
      }
      if (songImageInputRef.current) {
        songImageInputRef.current.value = "";
      }
      setSongTitle("");
      setSongArtist("");
      setSongAudioFile(null);
      setSongImageFile(null);
      setSelectedAlbumId("");

      fetchAllSongs();
    } catch (err) {
      log("Failed to create song", "error");
      toast.error("Failed to create song");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, creatingSong: false }));
    }
  };

  const handleDeleteAlbum = async (id: string, name: string) => {
    setLoading((prev) => ({ ...prev, deletingAlbum: id }));
    log(`Deleting album: ${name}`);

    try {
      await adminApi.delete(`/album/${id}`);
      log(`Album "${name}" deleted successfully`, "success");
      toast.success("Album deleted");
      fetchAlbums();
      fetchAllSongs(); // Refresh songs as well since album songs are deleted
    } catch (err) {
      log(`Failed to delete album "${name}"`, "error");
      toast.error("Failed to delete album");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, deletingAlbum: "" }));
    }
  };

  const handleDeleteSong = async (id: string, title: string) => {
    setLoading((prev) => ({ ...prev, deletingSong: id }));
    log(`Deleting song: ${title}`);

    try {
      await adminApi.delete(`/song/${id}`);
      log(`Song "${title}" deleted successfully`, "success");
      toast.success("Song deleted");
      fetchAllSongs();
    } catch (err) {
      log(`Failed to delete song "${title}"`, "error");
      toast.error("Failed to delete song");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, deletingSong: "" }));
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // const getAlbumName = (albumId: string) => {
  //   const album = albums.find((a) => a.id === albumId);
  //   return album ? album.name : "Unknown Album";
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-slate-950 to-black-900">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="lg">
                <Home />
                Home
              </Button>
            </Link>
            <img src="/spotify.png" className="size-8" alt="Spotify logo" />
            Spotify Admin Dashboard
          </h1>
          <p className="text-slate-300">Manage your music library with ease</p>
        </div>

        <Tabs defaultValue="albums" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800 border-slate-700">
            <TabsTrigger
              value="albums"
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-black"
            >
              <Album className="w-4 h-4" />
              Albums
            </TabsTrigger>
            <TabsTrigger
              value="songs"
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-black"
            >
              <Music className="w-4 h-4" />
              Songs
            </TabsTrigger>
          </TabsList>

          {/* Albums Tab */}
          <TabsContent value="albums" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Create New Album
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Add a new album to your music library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Album Name
                    </label>
                    <Input
                      placeholder="Enter album name"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Artist
                    </label>
                    <Input
                      placeholder="Enter artist name"
                      value={albumArtist}
                      onChange={(e) => setAlbumArtist(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Album Cover
                    </label>
                    <div className="relative">
                      <Input
                        type="file"
                        ref={albumThumbnailInputRef}
                        accept="image/*"
                        onChange={(e) =>
                          setAlbumThumbnailFile(e.target.files?.[0] || null)
                        }
                        className="bg-slate-700 border-slate-600 text-white file:bg-green-500 file:text-black file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
                      />
                      <Image className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleCreateAlbum}
                      disabled={
                        loading.creatingAlbum ||
                        !albumName ||
                        !albumArtist ||
                        !albumThumbnailFile
                      }
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-medium"
                    >
                      {loading.creatingAlbum ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Album
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Album className="w-6 h-6 text-green-400" />
                Albums ({albums.length})
              </h2>

              {loading.albums ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                  <span className="ml-2 text-slate-300">Loading albums...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {albums.map((album) => (
                    <Card
                      key={album.id}
                      className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors group"
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square mb-4 relative rounded-lg overflow-hidden">
                          <img
                            src={`${CLOUDFRONT_URL}/${album.thumbnailKey}`}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 group-hover:bg-opacity-20 transition-opacity" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-white text-lg truncate">
                            {album.name}
                          </h3>
                          <p className="text-sm text-slate-400 truncate flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {album.artist}
                          </p>
                          <Separator className="bg-slate-600" />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteAlbum(album.id, album.name)
                            }
                            disabled={loading.deletingAlbum === album.id}
                            className="w-full bg-red-600 hover:bg-red-700"
                          >
                            {loading.deletingAlbum === album.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Songs Tab */}
          <TabsContent value="songs" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Create New Song
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Add a new song to your music library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Song Title
                    </label>
                    <Input
                      placeholder="Enter song title"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Artist
                    </label>
                    <Input
                      placeholder="Enter artist name"
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Album
                    </label>
                    <select
                      value={selectedAlbumId}
                      onChange={(e) => setSelectedAlbumId(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                    >
                      <option value="">Select an album</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.name} - {album.artist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Audio File
                    </label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="audio/*"
                        ref={songAudioInputRef}
                        onChange={(e) =>
                          setSongAudioFile(e.target.files?.[0] || null)
                        }
                        className="bg-slate-700 border-slate-600 text-white file:bg-green-500 file:text-black file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
                      />
                      <FileAudio className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Song Cover
                    </label>
                    <div className="relative">
                      <Input
                        type="file"
                        ref={songImageInputRef}
                        accept="image/*"
                        onChange={(e) =>
                          setSongImageFile(e.target.files?.[0] || null)
                        }
                        className="bg-slate-700 border-slate-600 text-white file:bg-green-500 file:text-black file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
                      />
                      <Image className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleCreateSong}
                      disabled={
                        loading.creatingSong ||
                        !songTitle ||
                        !songArtist ||
                        !songAudioFile ||
                        !songImageFile ||
                        !selectedAlbumId
                      }
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-medium"
                    >
                      {loading.creatingSong ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Song
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Music className="w-6 h-6 text-green-400" />
                All Songs ({songs.length})
              </h2>

              {loading.songs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                  <span className="ml-2 text-slate-300">Loading songs...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {songs.map((song) => (
                    <Card
                      key={song.id}
                      className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                              {song.imageUrl ? (
                                <img
                                  src={`${CLOUDFRONT_URL}/${song.imageUrl}`}
                                  alt={song.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white">
                                {song.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {song.artist}
                                </span>
                                {/* <span className="flex items-center gap-1">
                                  <Album className="w-3 h-3" />
                                  {getAlbumName(song.albumId)}
                                </span> */}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(song.duration)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteSong(song.id, song.title)
                            }
                            disabled={loading.deletingSong === song.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {loading.deletingSong === song.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
