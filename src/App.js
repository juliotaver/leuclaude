// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import NewClientPage from './pages/NewClientPage';
import PassQRPage from './pages/PassQRPage';
import ClientListPage from './pages/ClientListPage';
import ScannerPage from './pages/ScannerPage'; // Nueva importación

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new-client" element={<NewClientPage />} />
            <Route path="/pass/:id" element={<PassQRPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/scanner" element={<ScannerPage />} /> {/* Nueva ruta */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;