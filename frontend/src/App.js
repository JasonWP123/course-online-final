import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import SubModuleDetail from './pages/SubModuleDetail';
import ModuleMaterials from './pages/ModuleMaterials';
import DetailMaterial from './pages/DetailMaterial';
import AuthSuccess from './pages/AuthSuccess';
import ProfilePage from './pages/ProfilePage';
import Discussions from './pages/discussions/Discussions';
import DiscussionDetail from './pages/discussions/DiscussionDetail';
import MyCourses from './pages/MyCourses';

function App() {
  return (
    <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/google/success" element={<AuthSuccess />} />
            
            {/* Discussions */}
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/discussions/:id" element={<DiscussionDetail />} />
            
            {/* Protected Routes */}
            <Route path="/my-courses" element={<PrivateRoute><MyCourses /></PrivateRoute>} />
            <Route path="/course/:courseId" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
            <Route path="/course/:courseId/module/:moduleId/materials" element={<PrivateRoute><ModuleMaterials /></PrivateRoute>} />
            <Route path="/module/:moduleId/submodule/:subModuleId" element={<PrivateRoute><SubModuleDetail /></PrivateRoute>} />
            <Route path="/material/:id" element={<PrivateRoute><DetailMaterial /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          </Routes>
          
          {/* 🤖 Global AI Chatbot - Muncul di Semua Halaman */}
        </Router>
    </AuthProvider>
  );
}

export default App;