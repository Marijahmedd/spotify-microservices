export interface Song {
  id: string;
  title: string;
  artist: string;
  albumId: string;
  imageUrl: string;
  audioKey: string;
  duration: number;
  createdAt: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  thumbnailKey: string;
  createdAt: string;
}

export interface Stats {
  totalSongs: number;
  totalAlbums: number;
  totalUsers: number;
  totalArtists: number;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  clerkId: string;
  fullName: string;
  imageUrl: string;
}

export interface FullAlbum extends Album {
  thumbnailUrl: string;
  songs: Song[];
}
