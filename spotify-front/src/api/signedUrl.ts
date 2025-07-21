import { songsApi } from "./songsApi";

export const getSignedUrl = async (songId: string) => {
  const response = await songsApi.get(`/stream/${songId}`);
  return response.data.url as string;
};
