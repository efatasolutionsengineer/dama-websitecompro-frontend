import { API_BASE } from '../../lib/apiBase.js';
import { asList } from '../../lib/asList.js';
import React, { useState, useEffect, useRef } from "react";
import styles from "./specialdisplay.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const SpecialDisplay = () => {
    const [servicesSpecialData, setServicesSpecialData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [showIncludes, setShowIncludes] = useState(false);
    const [contactData, setContactData] = useState(null);
    const [contactLoading, setContactLoading] = useState(true);
    const [contactError, setContactError] = useState(null);
    const [imageHeights, setImageHeights] = useState({});
    const [zoomedImages, setZoomedImages] = useState({});
    const containerRefs = useRef({});
    const [containerHeights, setContainerHeights] = useState({});

    useEffect(() => {
        const fetchServicesSpecialData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/services_special`);
                if (response.ok) {
                    const data = await response.json();
                    setServicesSpecialData(data.map((row) => ({
                        ...row,
                        services_special_include: asList(row.services_special_include),
                    })));
                } else {
                    throw new Error("Failed to fetch services data.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchContactData = async () => {
            setContactLoading(true);
            try {
                const response = await fetch(`${API_BASE}/dama`);
                if (response.ok) {
                    const data = await response.json();
                    setContactData(data[0]);
                } else {
                    throw new Error("Failed to fetch contact data.");
                }
            } catch (err) {
                setContactError(err.message);
            } finally {
                setContactLoading(false);
            }
        };

        fetchServicesSpecialData();
        fetchContactData();
    }, []);

    const toggleIncludes = (service) => {
        if (selectedService === service) {
            setShowIncludes(!showIncludes);
            setImageHeights(prev => ({ ...prev, [service.id]: showIncludes ? 'auto' : containerRefs.current[service.id].clientHeight + 'px' }));
            setZoomedImages(prev => ({ ...prev, [service.id]: !showIncludes }));
            setContainerHeights(prev => ({ ...prev, [service.id]: showIncludes ? 'auto' : containerRefs.current[service.id].clientHeight + 'px' }));
        } else {
            setSelectedService(service);
            setShowIncludes(true);
            setImageHeights({ [service.id]: containerRefs.current[service.id].clientHeight + 'px' });
            setZoomedImages({ [service.id]: true });
            setContainerHeights({ [service.id]: containerRefs.current[service.id].clientHeight + 'px' });
        }
    };

    if (loading) {
        return (
            <div className="loading-error-message loading">
                <p>Loading special packages...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="loading-error-message error">
                <p>Error loading special packages: {error}</p>
            </div>
        );
    }

    if (contactLoading) {
        return (
            <div className="loading-error-message loading">
                <p>Loading contact data...</p>
            </div>
        );
    }

    if (contactError) {
        return (
            <div className="loading-error-message error">
                <p>Error loading contact data: {contactError}</p>
            </div>
        );
    }

    return (
        <section className={styles.specialDisplayContainer}>
            <h2 className={styles.sectionTitle}>Special Packages</h2>
            <div className={styles.divider}></div>
            <div className={styles.specialDisplayColumn}>
                {servicesSpecialData.map((service, index) => (
                    <div key={service.id} className={styles.specialDisplayItem} ref={el => containerRefs.current[service.id] = el} style={{ height: containerHeights[service.id] || 'auto' }}>
                        <div className={index % 2 === 0 ? styles.row : styles.rowReverse}>
                            <div className={styles.imageColumn}>
                                {service.services_special_img && (
                                    <img
                                        src={service.services_special_img}
                                        alt={service.services_special_name}
                                        className={`${styles.specialImage} ${zoomedImages[service.id] ? styles.zoomedImage : ''}`}
                                        style={{ height: imageHeights[service.id] || 'auto', transition: 'height 0.3s ease' }}
                                    />
                                )}
                            </div>
                            <div className={styles.textColumn}>
                                <div className={styles.combinedText}>
                                    <h3>{service.services_special_name}</h3>
                                    <h4>{service.services_special_title}</h4>
                                    <p>{service.services_special_desc}</p>
                                </div>
                                <div className={styles.divider}></div>
                                <div className={styles.includesToggle}>
                                    <button onClick={() => toggleIncludes(service)} className={styles.includesButton}>
                                        What's Included?
                                        <FontAwesomeIcon
                                            icon={selectedService === service && showIncludes ? faChevronUp : faChevronDown}
                                            className={styles.toggleIcon}
                                        />
                                    </button>
                                </div>
                                {selectedService === service && showIncludes && (
                                    <ul className={styles.includesList}>
                                        {service.services_special_include.map((include, index) => (
                                            <li key={index}>{include}</li>
                                        ))}
                                    </ul>
                                )}
                                <div className={styles.divider}></div>
                                <div className={styles.contactUsSection}>
                                    {contactData && contactData.dama_whatsapp && (
                                        <a href={`https://wa.me/${contactData.dama_whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
                                            Work with us
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SpecialDisplay;