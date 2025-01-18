import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const CompanyPersons = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [persons, setPersons] = useState([]);
    const [error, setError] = useState(null);

    // Récupérer les entreprises au chargement du composant
    useEffect(() => {
        apiClient.get('/companies')
            .then(response => setCompanies(response.data))
            .catch(err => {
                console.error(err);
                setError('Failed to fetch companies');
            });
    }, []);

    // Récupérer les personnes pour une entreprise sélectionnée
    const fetchPersonsByCompany = (companyName) => {
        setError(null);
        setSelectedCompany(companyName); // Mettre à jour l'entreprise sélectionnée
        apiClient.get(`/companies/${companyName}/persons`)
            .then(response => setPersons(response.data))
            .catch(err => {
                console.error(err);
                setError('Failed to fetch persons for the selected company');
            });
    };

    return (
        <div>
            <h2>Select a Company</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                {companies.map((company, index) => (
                    <button
                        key={index}
                        onClick={() => fetchPersonsByCompany(company)}
                        style={{ margin: '5px' }}
                    >
                        {company}
                    </button>
                ))}
            </div>
            {selectedCompany && (
                <>
                    <h3>Persons who worked at {selectedCompany}</h3>
                    <ul>
                        {persons.map(person => (
                            <li key={person.id}>
                                {person.firstName} {person.lastName} - Age: {person.age}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default CompanyPersons;
