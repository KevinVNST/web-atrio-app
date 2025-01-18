import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const PersonForm = ({ onPersonAdded }) => {
    const [form, setForm] = useState({ firstname: '', lastname: '', dateOfBirth: '' })
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null)
        apiClient.post('/persons', form)
            .then(() => {
                alert('Person added successfully');
                setForm({ firstName: '', lastName: '', dateOfBirth: '' })
                if (onPersonAdded) {
                    onPersonAdded(); // Déclenche le rafraîchissement
                }

            })
            .catch(error => {
                console.error(error)
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
            <input type="text" name="firstname" placeholder="First Name" onChange={handleChange} />
            <input type="text" name="lastname" placeholder="Last Name" onChange={handleChange} />
            <input type="date" name="dateOfBirth" onChange={handleChange} />
            <button type="submit">Add Person</button>
        </form>
    );
};

export default PersonForm;