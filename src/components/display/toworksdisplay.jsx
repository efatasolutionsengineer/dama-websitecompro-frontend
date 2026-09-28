import { API_BASE } from '../../lib/apiBase.js';
import React, { useEffect, useState } from "react";
import styles from "./toworksdisplay.module.css";

const ToWorksDisplay = () => {
    const [toWorkData, setToWorkData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchToWorksData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/toworks`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setToWorkData(data[0]); // Assuming the first entry has the image data
                    }
                } else {
                    setMessage("Failed to fetch to works data.");
                }
            } catch (error) {
                console.error("Error fetching to works data:", error);
                setMessage("Failed to fetch to works data.");
            } finally {
                setLoading(false);
            }
        };

        fetchToWorksData();
    }, []);

    const handleImageClick = (link) => {
        if (link) {
            window.open(link, "_blank"); // Open link in a new tab
        }
    };

    return (
        <section className={styles.container}>
            {loading && <p className={styles.loading}>Loading...</p>}
            {message && <p className={styles.message}>{message}</p>}

            {toWorkData && (
                <div className={styles.toworkContent}>
                    <h1 className={styles.toworksText}>{toWorkData.toworks_text}</h1>
                    <p className={styles.toworksSubText}>{toWorkData.toworks_sub_text}</p>
                </div>
            )}

            <div className={styles.imageGallery}>
                {toWorkData && (
                    <>
                        {toWorkData.one_img && (
                            <div className={styles.imageContainer} onClick={() => handleImageClick(toWorkData.one_link)}>
                                <img src={toWorkData.one_img} alt={toWorkData.one_name} className={styles.workImage} />
                                <div className={styles.imageTitle}>{toWorkData.one_name}</div>
                            </div>
                        )}
                        {toWorkData.two_img && (
                            <div className={styles.imageContainer} onClick={() => handleImageClick(toWorkData.two_link)}>
                                <img src={toWorkData.two_img} alt={toWorkData.two_name} className={styles.workImage} />
                                <div className={styles.imageTitle}>{toWorkData.two_name}</div>
                            </div>
                        )}
                        {toWorkData.three_img && (
                            <div className={styles.imageContainer} onClick={() => handleImageClick(toWorkData.three_link)}>
                                <img src={toWorkData.three_img} alt={toWorkData.three_name} className={styles.workImage} />
                                <div className={styles.imageTitle}>{toWorkData.three_name}</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className={styles.buttonContainer}>
                <a href="/works" className={styles.portfolioButton}>View Our Portfolio</a>
            </div>
        </section>
    );
};

export default ToWorksDisplay;