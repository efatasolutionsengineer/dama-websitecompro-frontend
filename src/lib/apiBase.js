const browserBase = '/api';

export const API_BASE = import.meta.env.SSR
    ? (process.env.BUILD_API_URL || 'https://damastudio.id/api')
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
