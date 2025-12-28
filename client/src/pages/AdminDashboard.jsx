import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

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

  const handleVerify = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/verify-ngo/${id}`, { status });
      setActionMessage({ type: 'success', text: `NGO ${status === 'approved' ? 'Verified' : 'Rejected'} Successfully!` });

      // Remove from list
      setPendingNGOs(prev => prev.filter(ngo => ngo._id !== id));

      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error("Verification failed:", err);
      setActionMessage({ type: 'error', text: 'Action failed. Please try again.' });
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Manage pending NGO verifications</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Pending Requests:</span>
          <span className="ml-2 text-xl font-bold text-white">{pendingNGOs.length}</span>
        </div>
      </div>

      {actionMessage && (
        <div className={`mb-6 p-4 rounded-lg border ${actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
            : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
          {actionMessage.text}
        </div>
      )}

      {isLoadingData ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="mt-2 text-slate-500">Loading pending verifications...</p>
        </div>
      ) : pendingNGOs.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
          <p className="text-slate-400">There are no pending NGO verifications at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingNGOs.map(ngo => (
            <div key={ngo._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 transition-all hover:border-slate-600 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{ngo.organizationName || ngo.name}</h3>
                    <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded-full border border-yellow-500/50 uppercase tracking-wider">
                      Pending
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Representative Name</p>
                      <p className="font-medium text-slate-200">{ngo.name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Official Email</p>
                      <p className="font-medium text-slate-200 break-all">{ngo.organizationEmail || ngo.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Contact Email</p>
                      <p className="font-medium text-slate-200 break-all">{ngo.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Date Applied</p>
                      <p className="font-medium text-slate-200">
                        {new Date(ngo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => handleVerify(ngo._id, 'approved')}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerify(ngo._id, 'rejected')}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
