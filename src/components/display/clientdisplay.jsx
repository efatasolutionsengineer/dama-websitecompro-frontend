import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect, useRef, useMemo } from 'react';

const ClientDisplay = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/ourclients`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setClients(data);
            } catch (err) {
                console.error("Error fetching clients:", err);
                setError("Failed to fetch clients.");
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const duplicatedClients = useMemo(() => {
        return [...clients, ...clients];
    }, [clients]);

    useEffect(() => {
        if (scrollContainerRef.current && duplicatedClients.length > 0) {
            const scrollContainer = scrollContainerRef.current;
            let scrollPosition = 0;
            const scrollSpeed = 1;
            let animationFrameId;

            const scroll = () => {
                scrollPosition += scrollSpeed;
                if (scrollPosition > scrollContainer.scrollWidth / 2) {
                    scrollPosition = 0;
                }
                scrollContainer.scrollLeft = scrollPosition;
                animationFrameId = requestAnimationFrame(scroll);
            };

            scroll();

            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [duplicatedClients]);

    if (loading) return <p style={{ marginBottom: '20px' }}>Loading clients...</p>;
    if (error) return <p style={{ color: 'red', marginBottom: '20px' }}>Error: {error}</p>;

    return (
        <section style={{ height: 'fit-content', textAlign: 'center', color: 'var(--color-4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderBottom: '1.5px solid #000' }}>
            <div
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    padding: '10px 0',
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none',
                }}
                ref={scrollContainerRef}
                role="region"
                aria-label="Client Logos"
            >
                {duplicatedClients.map((client) => (
                    <a
                        key={`${client.id}-${Math.random()}`}
                        href={client.client_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ margin: '0 32px', cursor: 'pointer', display: 'inline-block' }}
                        aria-label={`Client logo: ${client.client_name}`}
                    >
                        <img src={client.client_logo_img} alt={client.client_name} style={{ height: '80px', objectFit: 'contain', maxWidth: '160px' }} />
                    </a>
                ))}
            </div>
        </section>
    );
};

export default ClientDisplay;