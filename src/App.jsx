import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import Checkout from './pages/Checkout'; // Import Checkout
import TalentSearch from './pages/TalentSearch';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ForgotPassword from './pages/ForgotPassword';
import InternshipPortal from './pages/InternshipPortal';
import EmployerReviews from './pages/EmployerReviews';
import './App.css';

function App() {
  const [showChat, setShowChat] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState('');

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const encodedMsg = encodeURIComponent(chatMessage);
    window.open(`https://wa.me/9609387414?text=${encodedMsg}`, '_blank');
    setChatMessage('');
    setShowChat(false);
  };
  return (
    <ThemeProvider>
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
              <Route path="/checkout/:planId" element={<Checkout />} />
              <Route path="/talent-search" element={<TalentSearch />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/internships" element={<InternshipPortal />} />
              <Route path="/reviews" element={<EmployerReviews />} />
            </Routes>
            <footer className="footer container">
              <div className="footer-content glass">
                <div className="footer-logo">
                  <h2>Jobszzy<span className="logo-dot">.</span></h2>
                  <p>Your dream job is just a click away.</p>
                  <div className="social-links">
                    <a href="https://www.facebook.com/jobszzy.global" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow us on Facebook">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                  </div>
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

            {/* WhatsApp Support Chatable Widget */}
            <div className={`whatsapp-wrapper ${showChat ? 'active' : ''}`}>
              {showChat && (
                <div className="whatsapp-chat-window glass animate-fade-in">
                  <div className="chat-header">
                    <div className="chat-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 10.033-9.886 10.033m8.397-18.428C18.242 1.258 15.65.25 12.857.25 7.158.25 2.522 4.885 2.519 10.584c0 1.822.484 3.601 1.401 5.186L1.137 23l7.351-1.928a9.815 9.815 0 004.363 1.033h.005c5.698 0 10.518-4.634 10.521-10.334 0-2.76-1.074-5.353-3.033-7.311z"></path></svg>
                    </div>
                    <div className="chat-info">
                      <h4>Jobszzy Support</h4>
                      <p>Usually replies in minutes</p>
                    </div>
                    <button className="chat-close" onClick={() => setShowChat(false)}>&times;</button>
                  </div>
                  <div className="chat-body">
                    <div className="chat-msg received">
                      Hi! How can we help you today?
                    </div>
                  </div>
                  <form className="chat-input-area" onSubmit={handleSendWhatsApp}>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="chat-send">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                  </form>
                </div>
              )}
              <button className={`whatsapp-float ${showChat ? 'hidden' : ''}`} onClick={() => setShowChat(true)}>
                <div className="whatsapp-content">
                  <svg className="whatsapp-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 10.033-9.886 10.033m8.397-18.428C18.242 1.258 15.65.25 12.857.25 7.158.25 2.522 4.885 2.519 10.584c0 1.822.484 3.601 1.401 5.186L1.137 23l7.351-1.928a9.815 9.815 0 004.363 1.033h.005c5.698 0 10.518-4.634 10.521-10.334 0-2.76-1.074-5.353-3.033-7.311z"></path></svg>
                  <span>Jobszzy Support</span>
                </div>
              </button>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
