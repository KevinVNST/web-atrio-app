import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const PersonJobsByDate = () => {
    const [persons, setPersons] = useState([]);
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState(null);

    // Récupérer la liste des personnes au chargement du composant
    useEffect(() => {
        apiClient.get('/persons')
            .then(response => setPersons(response.data))
            .catch(err => {
                console.error(err);
                setError('Failed to fetch persons');
            });
    }, []);

    // Rechercher les emplois (avec ou sans plage de dates)
    const fetchJobs = () => {
        setError(null);

        if (!selectedPersonId) {
            setError('Please select a person');
            return;
        }

        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        apiClient.get(`/persons/${selectedPersonId}/jobs`, { params })
            .then(response => setJobs(response.data))
            .catch(err => {
                console.error(err);
                setError('Failed to fetch jobs');
            });
    };

    return (
        <div>
            <h2>Search Jobs by Date Range</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>Person:</label>
                <select value={selectedPersonId} onChange={(e) => setSelectedPersonId(e.target.value)}>
                    <option value="">Select a person</option>
                    {persons.map(person => (
                        <option key={person.id} value={person.id}>
                            {person.firstName} {person.lastName}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
                <label>End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <button onClick={fetchJobs}>Search</button>
            <h3>Jobs</h3>
            <ul>
                {jobs.map(job => (
                    <li key={job.id}>
                        {job.jobName} at {job.companyName} ({job.startDate} - {job.endDate || 'Present'})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PersonJobsByDate;
