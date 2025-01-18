import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const JobForm = ({ personId, onJobAdded }) => {
    const [form, setForm] = useState({ companyName: '', jobName: '', startDate: '', endDate: '' })
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null)

        apiClient.post(`/persons/${personId}/jobs`, form)
            .then(() => {
                alert('Job added successfully')
                setForm({ companyName: '', jobName: '', startDate: '', endDate: '' })
                if (onJobAdded) onJobAdded()
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.error) {
                    setError(error.response.data.error);
                } else {
                    setError('An unexpected error occurred');
                }
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
                placeholder="Start Date"
                value={form.startDate}
                onChange={handleChange}
                required
            />
            <input
                type="date"
                name="endDate"
                placeholder="End Date"
                value={form.endDate}
                onChange={handleChange}
            />
            <button type="submit">Add Job</button>
        </form>
    );
};

export default JobForm;