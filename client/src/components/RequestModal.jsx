import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Send, MapPin, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const RequestModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Food', lat: 0, lng: 0 });
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Acquiring location...');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          setLocationStatus('Location acquired');
        },
        (err) => {
          setLocationStatus('Location unavailable');
          console.error(err);
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/requests', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: { lat: formData.lat, lng: formData.lng }
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="clean-panel w-full max-w-lg rounded-2xl p-8 relative z-50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-muted hover:text-white transition">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand-danger rounded-full text-white">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Request Emergency Aid</h2>
            <p className="text-brand-muted text-sm">Submit details for rapid response</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white text-xs font-bold uppercase tracking-wider mb-1.5">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="clean-input w-full p-3 rounded-lg"
              placeholder="e.g. Trapped under debris"
              required
            />
          </div>

          <div>
            <label className="block text-white text-xs font-bold uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="clean-input w-full p-3 rounded-lg h-32 resize-none"
              placeholder="Describe the situation in detail..."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-xs font-bold uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="clean-input w-full p-3 rounded-lg"
              >
                <option>Food</option>
                <option>Medical</option>
                <option>Shelter</option>
                <option>Rescue</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-xs font-bold uppercase tracking-wider mb-1.5">Location</label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-card border border-brand-border text-sm">
                <MapPin size={16} className={formData.lat !== 0 ? 'text-brand-success' : 'text-brand-muted'} />
                <span className={formData.lat !== 0 ? 'text-brand-success' : 'text-brand-muted'}>{locationStatus}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-danger hover:bg-red-700 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
          >
            {loading ? 'Submitting...' : (
              <>
                Send SOS Signal <Send size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RequestModal;
