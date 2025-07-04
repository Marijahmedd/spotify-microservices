import { songsApi } from "./songsApi";

export const getSignedUrl = async (songId: string) => {
  const response = await songsApi.get(`/stream/${songId}`);
  console.log(response);
  return response.data.url as string;
};
