import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect, useRef } from "react";
import styles from "./taglinedisplay.module.css";

const TaglineDisplay = () => {
    const [taglines, setTaglines] = useState([]);
    const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transitionProgress, setTransitionProgress] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const animationFrameRef = useRef(0);

    useEffect(() => {
        const fetchTaglines = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/taglines`);
                if (response.ok) {
                    const data = await response.json();
                    setTaglines(data);
                } else {
                    throw new Error("Failed to fetch taglines.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTaglines();
    }, []);

    useEffect(() => {
        if (taglines.length > 0) {
            const transitionInterval = 5000;
            const transitionDuration = 1000;

            const interval = setInterval(() => {
                setIsTransitioning(true);
                setTransitionProgress(0);
                animateTransition(transitionDuration);
            }, transitionInterval);

            return () => clearInterval(interval);
        }
    }, [taglines]);

    const animateTransition = (duration) => {
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const normalizedProgress = Math.min(progress / duration, 1);

            setTransitionProgress(normalizedProgress);

            if (progress < duration) {
                animationFrameRef.current = requestAnimationFrame(step);
            } else {
                setCurrentTaglineIndex((prevIndex) => (prevIndex + 1) % taglines.length);
                setIsTransitioning(false);
            }
        };

        animationFrameRef.current = requestAnimationFrame(step);
    };

    useEffect(() => {
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading home...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    const currentTagline = taglines[currentTaglineIndex];
    const nextTagline = taglines[(currentTaglineIndex + 1) % taglines.length];

    return (
        <div className={styles.taglineContainer}>

            <div className={styles.backgroundImage}>
                <img
                    src={currentTagline.tagline_img}
                    alt={currentTagline.tagline_text}
                    className={styles.taglineImage}
                    style={{
                        transform: isTransitioning ? `translateX(-${transitionProgress * 100}%)` : "translateX(0%)",
                    }}
                />
                <img
                    src={nextTagline.tagline_img}
                    alt={nextTagline.tagline_text}
                    className={styles.taglineImage}
                    style={{
                        transform: isTransitioning ? `translateX(${(1 - transitionProgress) * 100}%)` : "translateX(100%)",
                    }}
                />
            </div>

            <div className={styles.taglineContent}>
                <h2>{currentTagline.tagline_text}</h2>
                <p>{currentTagline.tagline_sub_text}</p>
                <a href="/services" className={styles.servicesButton}>
                    Our Services
                </a>
            </div>

            <div className={styles.taglineIndicators}>
                {taglines.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.taglineIndicator} ${index === currentTaglineIndex ? styles.active : ""}`}
                    />
                ))}
            </div>
            
        </div>
    );
};


export default TaglineDisplay;