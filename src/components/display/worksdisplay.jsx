import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./worksdisplay.module.css"; // Pastikan path ke CSS benar

const WorksDisplay = () => {
    const [worksData, setWorksData] = useState([]);
    const [filteredWorks, setFilteredWorks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [workPage, setWorkPage] = useState(null);
    const [loading, setLoading] = useState(true); // Tambahkan state loading

    const VALID_WORK_CATEGORIES = [
        "Start Up Package",
        "Brand Management",
        "Brand Consultation",
        "Collection Development",
        "TikTok Management",
        "Social Media Management",
        "Styling & Creative Direction",
        "Fabric Sourcing & Consulting"
    ];

    useEffect(() => {
        const fetchWorksData = async () => {
            try {
                const response = await fetch(`${API_BASE}/works`);
                if (response.ok) {
                    const data = await response.json();
                    setWorksData(data);
                } else {
                    console.error("Fetch error:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error fetching Works data:", error);
            } finally {
                setLoading(false); // Set loading ke false setelah selesai
            }
        };

        const fetchWorkPage = async () => {
            try {
                const response = await fetch(`${API_BASE}/work_page`);
                if (response.ok) {
                    const data = await response.json();
                    setWorkPage(data[0]); // Assuming we take the first work page
                } else {
                    console.error("Fetch error:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error fetching Work Page data:", error);
            }
        };

        fetchWorksData();
        fetchWorkPage();
    }, []);

    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredWorks(worksData);
        } else {
            const filtered = worksData.filter(work => work.work_category === selectedCategory);
            setFilteredWorks(filtered);
        }
    }, [worksData, selectedCategory]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    if (loading) {
        return (
            <div className="loading-error-message loading">
                <p>Loading our works...</p>
            </div>
        );
    }

    return (
        <section className={styles.worksDisplayContainer}>


            <section className={styles.worksDisplayBanner}>
                {workPage && (
                    <div className={styles.workPageSection} style={{ backgroundImage: `url(${workPage.work_page_img})` }}>
                        <h1>{workPage.work_page_title}</h1>
                        <h2>{workPage.work_page_subtitle}</h2>
                    </div>
                )}
            </section>

            <section className={styles.worksDisplayMain}>
            <div className={styles.categoryFilter}>
                <button
                    className={`${styles.categoryButton} ${selectedCategory === "All" ? styles.active : ""}`}
                    onClick={() => handleCategoryClick("All")}
                >
                    All
                </button>
                {VALID_WORK_CATEGORIES.map(category => (
                    <button
                        key={category}
                        className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ""}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className={styles.worksGrid}>
                {filteredWorks.map(work => (
                    <div key={work.id} className={styles.workItem}>
                        <a href={`/works/${work.work_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                            <div className={styles.workItemImageContainer}>
                                {work.work_main_img && (
                                    <img src={work.work_main_img} alt={work.work_title} className={styles.workImage} />
                                )}
                                <div className={styles.workInfo}>
                                    {work.work_logo_img && (
                                        <img src={work.work_logo_img} alt="Work Logo" className={styles.workLogo} />
                                    )}
                                    <p>{work.work_subtitle}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
            </section>

        </section>
    );
};

export default WorksDisplay;