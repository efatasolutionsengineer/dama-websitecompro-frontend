import { API_BASE } from '../../lib/apiBase.js';
import { useEffect, useState } from 'react';
import styles from './damadisplay.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin, faTiktok } from '@fortawesome/free-brands-svg-icons';

const DamaDisplay = () => {
    const [damaData, setDamaData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE}/dama`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDamaData(data[0]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (!damaData) {
        return <p>Loading...</p>;
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLeft}>
                    <a href="/faq">FAQ</a>
                </div>
                <div className={styles.footerCenter}>
                    <img src="/logoa.png" alt="Dama Logo" className={styles.logo} />
                    <div className={styles.cvDama}>CV DAMA ADICIPTA KREASI MODE</div>
                    <div className={styles.socialIcons}>
                        {damaData.dama_linkedin && (
                            <a href={`https://id.linkedin.com/company/${damaData.dama_linkedin}`} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faLinkedin} />
                            </a>
                        )}
                        {damaData.dama_instagram && (
                            <a href={`https://www.instagram.com/${damaData.dama_instagram}`} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                        )}
                        {damaData.dama_tiktok && (
                            <a href={`https://www.tiktok.com/@${damaData.dama_tiktok}`} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faTiktok} />
                            </a>
                        )}
                    </div>
                </div>
                <div className={styles.footerRight}>
                    <a href="/contact">Contact Us</a>
                </div>
            </div>
        </footer>
    );
};

export default DamaDisplay;