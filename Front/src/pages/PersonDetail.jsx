import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const PersonDetails = () => {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    // Récupérer les détails de la personne
    useEffect(() => {
        apiClient.get(`/persons/${id}`)
            .then(response => setPerson(response.data))
            .catch(err => {
                console.error(err);
                setError('Failed to fetch person details');
            });
    }, [id]);

    // Rechercher les emplois entre deux dates
    const fetchJobs = () => {
        setError(null);

        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        apiClient.get(`/persons/${id}/jobs`, { params })
            .then(response => setJobs(response.data))
            .catch(err => {
                console.error(err);
                setError('Failed to fetch jobs');
            });
    };

    if (!person) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <button onClick={() => navigate(`/`)}>Back</button>
            <h1>{person.firstName} {person.lastName}</h1>
            <p>Age: {new Date().getFullYear() - new Date(person.dateOfBirth).getFullYear()}</p>
            <h2>Jobs</h2>
            <ul>
                {person.jobs.map(job => (
                    <li key={job.id}>
                        {job.jobName} at {job.companyName} ({job.startDate} - {job.endDate || 'Present'})
                    </li>
                ))}
            </ul>

            <h2>Search Jobs by Date Range</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div>
                <label>End Date:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            <button onClick={fetchJobs}>Search</button>

            <h3>Jobs Found</h3>
            <ul>
                {jobs.map(job => (
                    <li key={job.id}>
                        {job.jobName} at {job.companyName} ({job.startDate} - {job.endDate || 'Present'})
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate(`/person/${id}/add-job`)}>Add Job</button>
        </div>
    );
};

export default PersonDetails;
