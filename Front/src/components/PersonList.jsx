import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const PersonList = ({ refreshKey }) => {
    const [persons, setPersons] = useState([]);

    const fetchPersons = () => {
        apiClient.get('/persons')
            .then(response => {
                const updatedPersons = response.data.map(person => {
                    const age = new Date().getFullYear() - new Date(person.dateOfBirth).getFullYear();
                    const currentJob = person.jobs.find(job => !job.endDate || new Date(job.endDate) > new Date());
                    return { ...person, age, currentJob };
                });
                setPersons(updatedPersons);
            })
            .catch(error => console.error(error));
    };


    useEffect(() => {
        fetchPersons()
    }, [refreshKey]);

    return (
        <div>
            <h2>List of Persons</h2>
            <ul>
                {persons.map(person => (
                    <li key={person.id}>
                        <Link to={`/person/${person.id}`}>
                            {person.firstname} {person.lastname} </Link> - Age: {person.age} - Current Job:
                        {person.currentJob ? `${person.currentJob.jobName} at ${person.currentJob.companyName}` : ' None'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PersonList;