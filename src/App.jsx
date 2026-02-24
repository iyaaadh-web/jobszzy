import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetails from './pages/JobDetails';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Companies from './pages/Companies';
import JobSeekers from './pages/JobSeekers';
import BrowseJobs from './pages/BrowseJobs';
import SeekerDashboard from './pages/SeekerDashboard';
import PostJobInfo from './pages/PostJobInfo';
import Pricing from './pages/Pricing';
import TalentSearch from './pages/TalentSearch';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/job-seekers" element={<JobSeekers />} />
            <Route path="/browse-jobs" element={<BrowseJobs />} />
            <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
            <Route path="/post-job-info" element={<PostJobInfo />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/talent-search" element={<TalentSearch />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
          <footer className="footer container">
            <div className="footer-content glass">
              <div className="footer-logo">
                <h2>Jobszzy<span className="logo-dot">.</span></h2>
                <p>Your dream job is just a click away.</p>
              </div>
              <div className="footer-links">
                <div className="link-group">
                  <h3>For Candidates</h3>
                  <Link to="/browse-jobs">Browse Jobs</Link>
                  <Link to="/companies">Companies</Link>
                </div>
                <div className="link-group">
                  <h3>For Employers</h3>
                  <Link to="/post-job-info">Post a Job</Link>
                  <Link to="/pricing">Pricing</Link>
                  <Link to="/talent-search">Talent Search</Link>
                </div>
                <div className="link-group">
                  <h3>Company</h3>
                  <Link to="/about">About Us</Link>
                  <Link to="/contact">Contact</Link>
                  <Link to="/privacy">Privacy Policy</Link>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Jobszzy. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
