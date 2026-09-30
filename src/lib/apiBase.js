const browserBase = '/api';

export const API_BASE = import.meta.env.SSR
    ? (process.env.BUILD_API_URL || 'http://208.87.132.238:8160')
    : browserBase;

if (!import.meta.env.SSR && typeof window !== 'undefined' && !window.__damaFetchPatched) {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url || '';
        if (url.startsWith(browserBase) || url.startsWith('/api/')) {
            init = { ...init, credentials: 'include' };
        }
        return originalFetch(input, init);
    };
    window.__damaFetchPatched = true;
}
