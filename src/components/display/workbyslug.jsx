import { API_BASE } from '../../lib/apiBase.js';
import { slugify } from '../../lib/slugify.js';
import { useEffect, useState } from 'react';
import WorkDetailContent from './workdetailcontent.jsx';

export default function WorkBySlug() {
    const [work, setWork] = useState(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const slug = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop();
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
        return (
            <p style={{ padding: '2rem' }}>
                This project is not available. <a href="/works">Back to Our Works</a>
            </p>
        );
    }

    return <WorkDetailContent work={work} />;
}
