import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./visionmissiondisplay.module.css";

const VisionMissionDisplay = () => {
    const [visionMissionData, setVisionMissionData] = useState([]);
    const [visionData, setVisionData] = useState([]);
    const [missionData, setMissionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVisionMissionData = async () => {
            setLoading(true);
            try {
                const visionMissionResponse = await fetch(`${API_BASE}/visionmission`);
                const visionResponse = await fetch(`${API_BASE}/visions`);
                const missionResponse = await fetch(`${API_BASE}/missions`);

                if (!visionMissionResponse.ok || !visionResponse.ok || !missionResponse.ok) {
                    throw new Error("Failed to fetch vision, mission, or vision/mission image data.");
                }

                const visionMission = await visionMissionResponse.json();
                const vision = await visionResponse.json();
                const mission = await missionResponse.json();

                setVisionMissionData(visionMission);
                setVisionData(vision);
                setMissionData(mission);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVisionMissionData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    // Ambil URL gambar dari data visionMission
    const backgroundImage = visionMissionData.length > 0 && visionMissionData[0].visionmission_img
        ? `url(${visionMissionData[0].visionmission_img})`
        : "";

    const hasBackgroundImageClass = backgroundImage ? styles.hasBackgroundImage : "";

    return (
        <section
            className={`${styles.visionMissionContainer} ${hasBackgroundImageClass}`}
            style={backgroundImage ? {
                backgroundImage: backgroundImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            } : {}}
        >
            {visionData.length > 0 && (
                <div className={styles.visionSection}>
                    <h2>Vision</h2>
                    {visionData.map((vision) => (
                        <p key={vision.id}>{vision.vision_content}</p>
                    ))}
                </div>
            )}
            {missionData.length > 0 && (
                <div className={styles.missionSection}>
                    <h2>Mission</h2>
                    {missionData.map((mission) => (
                        <p key={mission.id}>{mission.mission_content}</p>
                    ))}
                </div>
            )}
        </section>
    );
};

export default VisionMissionDisplay;