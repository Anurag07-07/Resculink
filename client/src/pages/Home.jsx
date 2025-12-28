import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'victim', phone: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error occurred');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden bg-brand-dark">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="clean-panel p-10 rounded-2xl w-full max-w-md z-10 relative"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-full">
            <Globe size={40} className="text-black" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-center tracking-tight">
          {isLogin ? 'Welcome Back' : 'Get Started'}
        </h2>
        <p className="text-center text-brand-muted mb-8 text-sm">
          {isLogin ? 'Sign in to access the disaster response platform' : 'Create your account to join the network'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 overflow-hidden">
              <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="clean-input p-3 rounded-lg" required />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (e.g. +1234567890)"
                onChange={handleChange}
                className="clean-input p-3 rounded-lg"
                required
              />
              <select name="role" onChange={handleChange} className="clean-input p-3 rounded-lg">
                <option value="victim">Victim (Need Help)</option>
                <option value="volunteer">Volunteer (Provide Help)</option>
                <option value="ngo">NGO / Organization</option>
              </select>

              {formData.role === 'ngo' && (
                <div className="space-y-4 pt-2 border-t border-gray-700/30">
                  <input
                    type="text"
                    name="organizationName"
                    placeholder="Organization Name"
                    onChange={handleChange}
                    className="clean-input p-3 rounded-lg w-full"
                    required
                  />
                  <input
                    type="email"
                    name="organizationEmail"
                    placeholder="Official Organization Email"
                    onChange={handleChange}
                    className="clean-input p-3 rounded-lg w-full"
                    required
                  />
                </div>
              )}
            </motion.div>
          )}
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="clean-input p-3 rounded-lg" required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="clean-input p-3 rounded-lg" required />

          <button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg transition active:scale-95 mt-4 flex justify-center items-center gap-2">
            {isLogin ? <><ShieldCheck size={18} />Sign In</> : <><Zap size={18} />Create Account</>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <p className="text-brand-muted text-sm">
            {isLogin ? "New to RescueLink? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-white font-semibold hover:underline transition">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
