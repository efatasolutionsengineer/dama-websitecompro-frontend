import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./peopledisplay.module.css";

const PeopleDisplay = () => {
    const [peopleData, setPeopleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPeopleData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/peoples`);
                if (response.ok) {
                    const data = await response.json();
                    setPeopleData(data);
                } else {
                    throw new Error("Failed to fetch people data.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPeopleData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <section className={styles.peopleDisplayContainer}>
            <h2>Meet the DAMA Team</h2>
            <div className={styles.peopleGrid}>
                {peopleData.map((person) => (
                    <div key={person.id} className={styles.personItem}>
                        <img src={person.people_img} alt={person.people_name} className={styles.personImage} />
                        <div className={styles.personInfo}>
                            <h3>{person.people_name}</h3>
                            <p>{person.people_role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PeopleDisplay;