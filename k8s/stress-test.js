import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 1000,              
  duration: '60s',     
};

export default function () {
  let res = http.get('https://api.spotify.marij.me/api/song/stream/d9cb767a-346d-4682-8a88-3e9afd7c8748'); 
  check(res, {
    'status was 200': (r) => r.status === 200,
  });
  sleep(1);
}

