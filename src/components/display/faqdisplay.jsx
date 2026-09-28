import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./faqdisplay.module.css";

const FaqDisplay = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await fetch(`${API_BASE}/faq`);
        if (response.ok) {
          const data = await response.json();
          setFaqData(data);
          setLoading(false);
        } else {
          console.error("Failed to fetch FAQ data.");
          setError("Failed to load FAQ data.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching FAQ data:", error);
        setError("Failed to load FAQ data.");
        setLoading(false);
      }
    };

    fetchFaqData();
  }, []);

  if (loading) {
    return (
      <div className="loading-error-message loading">
        <p>Loading FAQ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-error-message error">
        <p>Error loading FAQ data: {error}</p>
      </div>
    );
  }

  const filteredFaqData = faqData.filter(faq =>
    faq.faq_question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className={styles.faqContainer}>
      <input
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchBar}
      />
      {filteredFaqData.map((faq, index) => (
        <div key={faq.id} className={styles.faqItem}>
          {index % 2 === 0 ? ( // Genap (angka di kiri)
            <>
              <div className={styles.faqIndex}>
                <div className={styles.indexNumber}>{String(index + 1).padStart(2, '0')}</div>
              </div>
              <div className={styles.faqContent}>
                <div className={styles.faqQuestion} style={{ textAlign: "left" }}>
                  <strong>{faq.faq_question}</strong>
                </div>
                <div className={styles.faqAnswer} style={{ textAlign: "left" }}>
                  <p dangerouslySetInnerHTML={{ __html: faq.faq_answer }} />
                </div>
              </div>
            </>
          ) : ( // Ganjil (angka di kanan)
            <>
              <div className={styles.faqContent}>
                <div className={styles.faqQuestion} style={{ textAlign: "right" }}>
                  <strong>{faq.faq_question}</strong>
                </div>
                <div className={styles.faqAnswer} style={{ textAlign: "right" }}>
                  <p dangerouslySetInnerHTML={{ __html: faq.faq_answer }} />
                </div>
              </div>
              <div className={styles.faqIndex}>
                <div className={styles.indexNumber}>{String(index + 1).padStart(2, '0')}</div>
              </div>
            </>
          )}
        </div>
      ))}
      {filteredFaqData.length === 0 && searchTerm && <p>Pertanyaan tidak ditemukan.</p>}
    </section>
  );
};

export default FaqDisplay;