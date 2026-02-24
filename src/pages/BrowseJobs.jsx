import React from 'react';
import JobListings from '../components/JobListings';

const BrowseJobs = () => {
    return (
        <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
            <JobListings />
        </div>
    );
};

export default BrowseJobs;
