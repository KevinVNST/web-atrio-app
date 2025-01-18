import React from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import PersonDetails from './pages/PersonDetail'
import CompanyPersons from './components/CompanyPersons'
import AddJob from './pages/AddJob'

const App = () => (
  <Router>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/person/:id' element={<PersonDetails />} />
      <Route path='/person/:id/add-job' element={<AddJob />} />
      <Route path="/companies" element={<CompanyPersons />} />
    </Routes>
  </Router>
)

export default App
