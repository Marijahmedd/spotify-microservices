import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 1000,              
  duration: '90s',     
};

export default function () {
  let res = http.get('https://api.spotify.marij.me/api/song/stream/698c538d-faa6-4c3d-9084-1dfadbf04d4a'); 
  check(res, {
    'status was 200': (r) => r.status === 200,
  });
  sleep(1);
}

