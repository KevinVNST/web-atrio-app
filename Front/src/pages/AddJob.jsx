import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const AddJob = () => {
    const { id } = useParams(); // Récupérer l'ID de la personne depuis l'URL
    const navigate = useNavigate();
    const [form, setForm] = useState({ companyName: '', jobName: '', startDate: '', endDate: '' });
    const [person, setPerson] = useState(null);
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        apiClient.post(`/persons/${id}/jobs`, form)
            .then(() => {
                alert('Job added successfully');
                navigate(`/person/${id}`);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to add job');
            });
    };

    if (!person) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <button onClick={() => navigate(`/person/${person.id}`)}>Back</button>
            <h2>Add Job for {person.firstName} {person.lastName}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="jobName"
                    placeholder="Job Name"
                    value={form.jobName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                />
                <button type="submit">Add Job</button>
            </form>
        </div>
    );
};

export default AddJob;
