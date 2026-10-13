import { API_BASE } from '../../lib/apiBase.js';
import { slugify } from '../../lib/slugify.js';
import { useEffect, useState } from 'react';
import BlogDetailContent from './blogdetailcontent.jsx';
import PageNotFound from './pagenotfound.jsx';

export default function BlogBySlug() {
    const [blog, setBlog] = useState(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const segment = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
        let decoded = segment;
        try { decoded = decodeURIComponent(segment); } catch { decoded = segment; }
        const slug = slugify(decoded);
        fetch(`${API_BASE}/blogs`)
            .then((response) => response.json())
            .then((blogs) => {
                const match = (Array.isArray(blogs) ? blogs : []).find((item) => slugify(item.slug || item.title) === slug);
                if (!match) {
                    setStatus('missing');
                    return;
                }
                setBlog(match);
                setStatus('ready');
                document.title = match.title || 'Blog';
            })
            .catch(() => setStatus('missing'));
    }, []);

    if (status === 'loading') {
        return <p style={{ padding: '2rem' }}>Loading article...</p>;
    }

    if (!blog) {
        return <PageNotFound backHref="/blogs" backLabel="Back to Blog" />;
    }

    return <BlogDetailContent blog={blog} />;
}
