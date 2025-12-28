import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut, Clock } from 'lucide-react';

const PendingVerification = () => {
  const { logout } = useAuth(); // Assuming you have a logout function

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-yellow-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Verification Pending</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Account created successfully! Your organization is currently under review by our Admin team.
          <br /><br />
          You will receive a notification and gain full access once your credentials have been verified.
        </p>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-8 text-left border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">What happens next?</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Admin reviews your organization details
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              You get approved instantly
            </li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={logout}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Sign Out
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
          >
            Check Status
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingVerification;
