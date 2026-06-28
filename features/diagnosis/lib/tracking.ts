declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function getSrc() {
  if (typeof window === 'undefined') return 'direct';
  return new URLSearchParams(window.location.search).get('src') || 'direct';
}

export function track(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  window.gtag?.('event', eventName, {
    src: getSrc(),
    page_type: 'diagnosis_lp_v7',
    ...params,
  });
}
