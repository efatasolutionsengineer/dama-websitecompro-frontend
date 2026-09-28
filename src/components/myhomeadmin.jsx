import React, { useState } from 'react';
import TaglinesAdmin from '../components/taglinesadmin.jsx';
import ToservicesAdmin from '../components/toservicesadmin.jsx';
import OurclientsAdmin from '../components/ourclientsadmin.jsx';
import ToworksAdmin from '../components/toworksadmin.jsx';
import TestimonialsAdmin from '../components/testimonialsadmin.jsx';
import ConnectAdmin from '../components/connectadmin.jsx';
import InstagramsAdmin from '../components/instagramsadmin.jsx';
import AccountAdmin from './AccountAdmin.jsx';
import styles from './myhomeadmin.module.css';

const MyHomeAdmin = () => {
    const [showTaglines, setShowTaglines] = useState(false);
    const [showToservices, setShowToservices] = useState(false);
    const [showOurclients, setShowOurclients] = useState(false);
    const [showToworks, setShowToworks] = useState(false);
    const [showTestimonials, setShowTestimonials] = useState(false);
    const [showConnect, setShowConnect] = useState(false);
    const [showInstagrams, setShowInstagrams] = useState(false);
    const [showWorkPage, setShowWorkPage] = useState(false);

    const navigateTo = (path) => {
        window.location.href = path;
    };

    return (
        <div className={styles.adminContainer}>
            <h2>Home Admin Panel</h2>
            <AccountAdmin />
            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: Uploads are limited to 5GB due to database constraints.
</div>

            {/* Container untuk tombol "Go to" */}
            <div className={styles.goToContainer}>
                <button onClick={() => navigateTo('/adminonlydama/servicesdama')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Services Page</button>
                <button onClick={() => navigateTo('/adminonlydama/worksdama')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Works Page</button>
                <button onClick={() => navigateTo('/adminonlydama/footerdama')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Footer Page</button>
                <button onClick={() => navigateTo('/adminonlydama/aboutdama')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to About Page</button>
                <button onClick={() => navigateTo('/adminonlydama/blogsdama')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Blogs Page</button>
            </div>

            {/* Container untuk tombol "Show" */}
            <div className={styles.showContainer}>
                <button onClick={() => setShowTaglines(!showTaglines)} className={`${styles.adminButton} ${showTaglines ? styles.active : ''}`}>{showTaglines ? 'Hide Home Taglines' : 'Show Home Taglines'}</button>
                <button onClick={() => setShowToservices(!showToservices)} className={`${styles.adminButton} ${showToservices ? styles.active : ''}`}>{showToservices ? 'Hide Home To-Services' : 'Show Home To-Services'}</button>
                <button onClick={() => setShowOurclients(!showOurclients)} className={`${styles.adminButton} ${showOurclients ? styles.active : ''}`}>{showOurclients ? 'Hide Home Clients' : 'Show Home Clients'}</button>
                <button onClick={() => setShowToworks(!showToworks)} className={`${styles.adminButton} ${showToworks ? styles.active : ''}`}>{showToworks ? 'Hide Home To-Works' : 'Show Home To-Works'}</button>
                <button onClick={() => setShowTestimonials(!showTestimonials)} className={`${styles.adminButton} ${showTestimonials ? styles.active : ''}`}>{showTestimonials ? 'Hide Home Testimonials' : 'Show Home Testimonials'}</button>
                <button onClick={() => setShowConnect(!showConnect)} className={`${styles.adminButton} ${showConnect ? styles.active : ''}`}>{showConnect ? 'Hide Home Connect' : 'Show Home Connect'}</button>
                <button onClick={() => setShowInstagrams(!showInstagrams)} className={`${styles.adminButton} ${showInstagrams ? styles.active : ''}`}>{showInstagrams ? 'Hide Home Instagrams' : 'Show Home Instagrams'}</button>
            </div>

            {showTaglines && <TaglinesAdmin />}
            {showToservices && <ToservicesAdmin />}
            {showOurclients && <OurclientsAdmin />}
            {showToworks && <ToworksAdmin />}
            {showTestimonials && <TestimonialsAdmin />}
            {showConnect && <ConnectAdmin />}
            {showInstagrams && <InstagramsAdmin />}
        </div>
    );
};

export default MyHomeAdmin;