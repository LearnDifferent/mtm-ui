import http from './http';

export function logout() {
  return http.get('/logout');
}
