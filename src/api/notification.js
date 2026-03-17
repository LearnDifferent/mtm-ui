import http from './http';

export function getUnreadSystemNotificationCount() {
  return http.get('/notification/count/system');
}

export function getUnreadReplyNotificationCount() {
  return http.get('/notification/count/reply');
}
