import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shield, Mail, Phone, Calendar, Search, Bell } from 'lucide-react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [notification, setNotification] = useState(null);

  // Socket connection for real-time updates
  useEffect(() => {
    const newSocket = io(API_URL);
    newSocket.on('newNGORegistration', (data) => {
      setNotification({ type: 'info', text: `New NGO Registration: ${data.name}` });
      setPendingNGOs(prev => [data, ...prev]);
    });
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingNGOs();
    }
  }, [user]);

  const fetchPendingNGOs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/pending-ngos`);
      setPendingNGOs(res.data);
    } catch (err) {
      console.error("Error fetching NGOs:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleVerify = async (id, status, name) => {
    try {
      await axios.put(`${API_URL}/api/admin/verify-ngo/${id}`, { status });
      setNotification({
        type: status === 'approved' ? 'success' : 'error',
        text: `${name} has been ${status === 'approved' ? 'verified' : 'rejected'}.`
      });

      // Remove from list
      setPendingNGOs(prev => prev.filter(ngo => ngo._id !== id));

      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Verification failed:", err);
      setNotification({ type: 'error', text: 'Action failed. Please try again.' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-emerald-500">Loading Admin Suite...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-10 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
            <Shield className="text-emerald-400" size={36} />
            Admin Command Center
          </h1>
          <p className="text-slate-400">Oversee and verify organization access requests.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="text-slate-400 hover:text-white transition cursor-pointer" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-emerald-400">System Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Stats / Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Pending Requests</h3>
            <p className="text-4xl font-bold text-white">{pendingNGOs.length}</p>
          </div>
          {/* Placeholder stats for future implementation */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl opacity-60">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Verified NGOs</h3>
            <p className="text-4xl font-bold text-white">-</p>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl opacity-60">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Active Alerts</h3>
            <p className="text-4xl font-bold text-white">-</p>
          </div>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border z-50 flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' :
                  notification.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' :
                    'bg-blue-500/20 border-blue-500/50 text-blue-200'
                }`}
            >
              <span className="text-sm font-semibold">{notification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List Section */}
        {isLoadingData ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 animate-pulse">Scanning for incoming requests...</p>
          </div>
        ) : pendingNGOs.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✨</div>
            <h2 className="text-2xl font-bold text-white mb-2">All Clear</h2>
            <p className="text-slate-400 max-w-md mx-auto">There are currently no pending NGO verifications. You're all caught up!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {pendingNGOs.map(ngo => (
                <motion.div
                  key={ngo._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {ngo.organizationName || ngo.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                              Review Required
                            </span>
                          </div>
                          <p className="text-slate-400 flex items-center gap-2">
                            <Calendar size={14} /> Applied on {new Date(ngo.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <Shield size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Representative</p>
                            <p className="text-sm font-medium text-slate-200 truncate" title={ngo.name}>{ngo.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <Mail size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Official Email</p>
                            <p className="text-sm font-medium text-slate-200 truncate" title={ngo.organizationEmail}>{ngo.organizationEmail || ngo.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <Phone size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contact</p>
                            <p className="text-sm font-medium text-slate-200 truncate">{ngo.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 min-w-[140px]">
                      <button
                        onClick={() => handleVerify(ngo._id, 'approved', ngo.organizationName)}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(ngo._id, 'rejected', ngo.organizationName)}
                        className="w-full py-3 px-4 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 hover:border-rose-600/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
