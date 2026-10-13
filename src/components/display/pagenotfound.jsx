import { useEffect } from 'react';
import styles from './pagenotfound.module.css';

export default function PageNotFound({ backHref = '/blogs', backLabel = 'Back to Blog' }) {
    useEffect(() => {
        document.title = 'Page not found';
    }, []);

    return (
        <section className={styles.page}>
            <p className={styles.code}>404</p>
            <h1>Page not found</h1>
            <p>This page does not exist or is no longer available.</p>
            <a href={backHref}>{backLabel}</a>
        </section>
    );
}
