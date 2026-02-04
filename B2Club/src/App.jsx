import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/Login';
import LeadsInbox from './pages/LeadsInbox';
import Profile from './pages/Profile';
import SavedLeads from './pages/SavedLeads';
import ContactedLeads from './pages/ContactedLeads';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads-inbox"
          element={
            <ProtectedRoute>
              <LeadsInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacted"
          element={
            <ProtectedRoute>
              <ContactedLeads />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
