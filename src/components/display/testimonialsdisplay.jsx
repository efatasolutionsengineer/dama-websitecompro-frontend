import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect, useRef } from "react";
import styles from "./testimonialsdisplay.module.css";

const TestimonialsDisplay = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transitionProgress, setTransitionProgress] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const animationFrameRef = useRef(0);

    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/testimonials`);
                if (response.ok) {
                    const data = await response.json();
                    setTestimonials(data);
                } else {
                    throw new Error("Failed to fetch testimonials.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    useEffect(() => {
        if (testimonials.length > 0) {
            const transitionInterval = 5000;
            const transitionDuration = 1000;

            const interval = setInterval(() => {
                setIsTransitioning(true);
                setTransitionProgress(0);
                animateTransition(transitionDuration);
            }, transitionInterval);

            return () => clearInterval(interval);
        }
    }, [testimonials]);

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
                setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
                setIsTransitioning(false);
            }
        };

        animationFrameRef.current = requestAnimationFrame(step);
    };

    useEffect(() => {
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading testimonials...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    const currentTestimonial = testimonials[currentTestimonialIndex];
    const nextTestimonial = testimonials[(currentTestimonialIndex + 1) % testimonials.length];

    return (
        <div className={styles.testimonialContainer}>
            <div className={styles.backgroundImage}>
                <img
                    src={currentTestimonial.testimonial_img}
                    alt={currentTestimonial.testimonial_from}
                    className={styles.testimonialImage}
                    style={{
                        transform: isTransitioning ? `translateX(-${transitionProgress * 100}%)` : "translateX(0%)",
                    }}
                />
                <img
                    src={nextTestimonial.testimonial_img}
                    alt={nextTestimonial.testimonial_from}
                    className={styles.testimonialImage}
                    style={{
                        transform: isTransitioning ? `translateX(${(1 - transitionProgress) * 100}%)` : "translateX(100%)",
                    }}
                />
            </div>
            <div className={styles.testimonialContent}>
                <h2>{currentTestimonial.testimonial_from}</h2>
                <p>{currentTestimonial.testimonial_text}</p>
            </div>
            <div className={styles.testimonialIndicators}>
                {testimonials.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.testimonialIndicator} ${index === currentTestimonialIndex ? styles.active : ""}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TestimonialsDisplay;
