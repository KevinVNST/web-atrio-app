import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PersonList from '../components/PersonList';
import PersonForm from '../components/PersonForm';

const Home = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePersonAdded = () => {
        setRefreshKey((prevKey) => prevKey + 1); // Incrémente la clé pour déclencher un rafraîchissement
    };

    return (
        <div>
            <h1>Person Management</h1>
            <PersonForm onPersonAdded={handlePersonAdded} />
            <PersonList refreshKey={refreshKey} />
            <Link to="/companies">Search Persons by Company</Link>
        </div>
    );
};

export default Home;