import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CreateEvent from './pages/CreateEvent.jsx';
import EditEvent from './pages/EditEvent.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Events from './pages/Events.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events/new" element={<ProtectedRoute requireAdmin><CreateEvent /></ProtectedRoute>} />
          <Route path="/admin/events/:id/edit" element={<ProtectedRoute requireAdmin><EditEvent /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
