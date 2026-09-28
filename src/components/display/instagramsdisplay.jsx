import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect, useRef } from "react";
import styles from "./instagramsdisplay.module.css";

const InstagramsDisplay = () => {
  const [instagrams, setInstagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [instagramUsername, setInstagramUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(true);
  const [usernameError, setUsernameError] = useState(null);

  useEffect(() => {
    const fetchInstagrams = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/instagrams`);
        if (response.ok) {
          const data = await response.json();
          setInstagrams(data); // Remove duplication
        } else {
          throw new Error("Failed to fetch Instagram data.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagrams();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      setUsernameLoading(true);
      try {
        const response = await fetch(`${API_BASE}/dama`);
        if (response.ok) {
          const data = await response.json();
          setInstagramUsername(data[0].dama_instagram);
        } else {
          throw new Error("Failed to fetch Instagram username.");
        }
      } catch (err) {
        setUsernameError(err.message);
      } finally {
        setUsernameLoading(false);
      }
    };

    fetchUsername();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (usernameLoading) return <div className={styles.loading}>Loading username...</div>;
  if (usernameError) return <div className={styles.error}>Error: {usernameError}</div>;

  return (
    <div className={styles.instagramContainer}>
      <div className={styles.instagramColumn}>
        <div className={styles.instagramScroll} ref={scrollContainerRef}>
          {instagrams.map((post) => (
            <a
              key={post.id}
              href={post.instagram_link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramItem}
            >
              <img
                src={post.instagram_img}
                alt={post.instagram_name}
                className={styles.instagramImage}
              />
            </a>
          ))}
        </div>
        <div className={styles.connectUsContainer}>
          Connect with us <a href={`https://www.instagram.com/${instagramUsername}`} target="_blank" rel="noopener noreferrer">@{instagramUsername}</a>
        </div>
      </div>
    </div>
  );
};

export default InstagramsDisplay;