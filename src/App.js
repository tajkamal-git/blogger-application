import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext';
import { ToastProvider } from './components/Toast';
import Home from './views/Home';
import Login from './views/Login';
import SignUp from './views/SignUp';
import Write from './views/Write';
import ForgetPassword from './views/ForgetPassword';
import EmailVerify from './views/EmailVerify';
import OtpVerify from './views/OtpVerify';
import BlogDetail from './views/BlogDetail';
import Profile from './views/Profile';
import NotFound from './views/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <UserProvider>
        <ToastProvider>
          <Routes>
            <Route path="/"            element={<Login />} />
            <Route path="/home"        element={<Home />} />
            <Route path="/signup"      element={<SignUp />} />
            <Route path="/write"       element={<Write />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/forget"      element={<EmailVerify />} />
            <Route path="/otpverify"   element={<OtpVerify />} />
            <Route path="/blog/:blogId" element={<BlogDetail />} />
            <Route path="/profile"     element={<Profile />} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
