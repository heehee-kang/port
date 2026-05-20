const CACHE_NAME = 'portfolio-v1';
const ASSETS = [
  '/port/',
  '/port/index.html',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
];

// 설치 시 핵심 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 오래된 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', e => {
  // 외부 API(주가, 환율)는 캐시 없이 항상 네트워크
  const url = new URL(e.request.url);
  if (url.hostname.includes('finnhub') ||
      url.hostname.includes('frankfurter') ||
      url.hostname.includes('er-api') ||
      url.hostname.includes('yahoo')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
