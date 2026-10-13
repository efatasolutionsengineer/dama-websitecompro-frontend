import { API_BASE } from '../../lib/apiBase.js';
import { slugify } from '../../lib/slugify.js';
import { useEffect, useState } from 'react';
import WorkDetailContent from './workdetailcontent.jsx';
import PageNotFound from './pagenotfound.jsx';

export default function WorkBySlug() {
    const [work, setWork] = useState(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const segment = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
        let decoded = segment;
        try { decoded = decodeURIComponent(segment); } catch { decoded = segment; }
        const slug = slugify(decoded);
        fetch(`${API_BASE}/works`)
            .then((response) => response.json())
            .then((works) => {
                const match = (Array.isArray(works) ? works : []).find((item) => slugify(item.work_title) === slug);
                if (!match) {
                    setStatus('missing');
                    return;
                }
                setWork(match);
                setStatus('ready');
                document.title = match.work_title || 'Our Work';
            })
            .catch(() => setStatus('missing'));
    }, []);

    if (status === 'loading') {
        return <p style={{ padding: '2rem' }}>Loading work...</p>;
    }

    if (!work) {
        return <PageNotFound backHref="/works" backLabel="Back to Our Works" />;
    }

    return <WorkDetailContent work={work} />;
}
