import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import Map from '../components/Map';
import RequestModal from '../components/RequestModal';
import { Plus, Clock, Activity, BarChart3, Map as MapIcon, ShieldAlert, ShieldCheck, TrendingUp, CheckCircle2, AlertCircle, Users, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // New: Status filter
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    fetchRequests();
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('newRequest', (req) => {
      setRequests((prev) => [req, ...prev]);
    });

    newSocket.on('updateRequest', (updatedReq) => {
      setRequests((prev) => prev.map(r => r._id === updatedReq._id ? updatedReq : r));
    });

    return () => newSocket.close();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resolveRequest = async (id) => {
    try {
      if (!confirm("Mark this issue as resolved? This will close the case.")) return;
      await axios.put(`http://localhost:5000/api/requests/${id}`, { status: 'resolved' });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to resolve");
    }
  };

  const acceptTask = async (id) => {
    try {
      if (!confirm("Accept this task? You will be assigned and the victim will be notified.")) return;
      const res = await axios.post(`http://localhost:5000/api/requests/${id}/accept`);

      // Show victim contact information
      const contact = res.data.victimContact;
      alert(
        `✅ Task Accepted!\n\n` +
        `You are now assigned to help:\n` +
        `Name: ${contact.name}\n` +
        `Email: ${contact.email}\n` +
        `Phone: ${contact.phone || 'Not provided'}\n\n` +
        `Please contact them to coordinate assistance.`
      );
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to accept task");
    }
  };

  const filteredRequests = requests.filter(req => {
    const urgencyMatch = filter === 'all' || req.urgency === filter;
    const statusMatch = statusFilter === 'all' || req.status === statusFilter;
    return urgencyMatch && statusMatch;
  });

  // Enhanced Analytics
  const stats = {
    total: requests.length,
    critical: requests.filter(r => r.urgency === 'critical').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    resolutionRate: requests.length > 0 ? ((requests.filter(r => r.status === 'resolved').length / requests.length) * 100).toFixed(1) : 0,
    categories: {
      Food: requests.filter(r => r.category === 'Food').length,
      Medical: requests.filter(r => r.category === 'Medical').length,
      Shelter: requests.filter(r => r.category === 'Shelter').length,
      Rescue: requests.filter(r => r.category === 'Rescue').length,
    },
    // Volunteer-specific stats
    myTasks: user.role === 'volunteer' ? requests.filter(r => r.assignedTo === user._id).length : 0,
    myCompleted: user.role === 'volunteer' ? requests.filter(r => r.assignedTo === user._id && r.status === 'resolved').length : 0,
    myActive: user.role === 'volunteer' ? requests.filter(r => r.assignedTo === user._id && r.status === 'in-progress').length : 0,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-brand-dark relative">
      {/* Top Bar */}
      <div className="clean-panel border-b border-brand-border p-4 z-40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'live' ? 'bg-white text-black' : 'text-white hover:bg-brand-card'}`}
          >
            <MapIcon size={16} className="inline mr-2" />Live Operations
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-white text-black' : 'text-white hover:bg-brand-card'}`}
          >
            <BarChart3 size={16} className="inline mr-2" />Analytics & Reports
          </button>
        </div>

        <div className="flex gap-6 text-xs font-mono uppercase tracking-widest text-brand-muted">
          <div>Total: <span className="text-white font-bold ml-1 text-base">{stats.total}</span></div>
          <div>Critical: <span className="text-brand-danger font-bold ml-1 text-base">{stats.critical}</span></div>
          <div>Resolved: <span className="text-brand-success font-bold ml-1 text-base">{stats.resolved}</span></div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'live' ? (
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row h-full p-6 gap-6"
            >
              {/* Sidebar */}
              <div className="w-full lg:w-[420px] flex flex-col h-full clean-panel rounded-xl overflow-hidden">
                <div className="p-4 border-b border-brand-border">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Activity size={18} />Active Requests
                    </h2>
                    {user.role === 'victim' && (
                      <button onClick={() => setIsModalOpen(true)} className="bg-brand-danger hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                        <Plus size={14} className="inline mr-1" />SOS
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-muted mb-1 block">Urgency</label>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${filter === f ? 'bg-white text-black' : 'bg-brand-card text-brand-muted hover:text-white'
                              }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-muted mb-1 block">Status</label>
                      <div className="flex gap-2">
                        {['all', 'pending', 'in-progress', 'resolved'].map(s => (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${statusFilter === s ? 'bg-white text-black' : 'bg-brand-card text-brand-muted hover:text-white'
                              }`}
                          >
                            {s === 'in-progress' ? 'In Progress' : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-10 text-brand-muted">
                      <Filter size={48} className="mx-auto mb-2 opacity-20" />
                      <p>No requests match filters</p>
                    </div>
                  ) : (
                    filteredRequests.map(req => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={req._id}
                        className={`p-4 rounded-xl border transition-all hover:border-white ${req.urgency === 'critical' ? 'border-brand-danger bg-brand-danger/5' :
                          req.urgency === 'high' ? 'border-brand-warning bg-brand-warning/5' :
                            'border-brand-border bg-brand-card'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white">{req.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${req.urgency === 'critical' ? 'bg-brand-danger text-white' :
                            req.urgency === 'high' ? 'bg-brand-warning text-white' :
                              'bg-brand-border text-white'
                            }`}>
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-brand-muted text-xs mb-3 line-clamp-2">{req.description}</p>

                        <div className="flex justify-between items-center text-[10px] text-brand-muted font-mono mb-2">
                          <span><Clock size={10} className="inline mr-1" />{new Date(req.createdAt).toLocaleTimeString()}</span>
                          <span className="bg-brand-card px-2 py-1 rounded">{req.category}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-2">
                          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${req.status === 'resolved' ? 'bg-brand-success/20 text-brand-success' :
                            req.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {req.status === 'in-progress' ? 'IN PROGRESS' : req.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        {req.status === 'resolved' ? (
                          <div className="mt-3 w-full bg-brand-success/20 border border-brand-success text-brand-success py-2 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2">
                            <CheckCircle2 size={14} />Case Closed
                          </div>
                        ) : (
                          <div className="mt-3 flex flex-col gap-2">
                            {/* Victim's own request - Help Received button */}
                            {user._id === req.userId && (
                              <button
                                onClick={() => resolveRequest(req._id)}
                                className="w-full bg-brand-success/10 text-brand-success border border-brand-success/30 hover:bg-brand-success hover:text-white py-2 rounded-lg transition text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 size={12} />Help Received - Close Case
                              </button>
                            )}

                            {/* Admin/NGO resolve button */}
                            {user._id !== req.userId && (user.role === 'admin' || user.role === 'ngo') && (
                              <button
                                onClick={() => resolveRequest(req._id)}
                                className="w-full bg-brand-success/10 text-brand-success border border-brand-success/30 hover:bg-brand-success hover:text-white py-2 rounded-lg transition text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                              >
                                <ShieldCheck size={12} />Mark Resolved
                              </button>
                            )}

                            {/* Volunteer accept task button */}
                            {user.role === 'volunteer' && req.status === 'pending' && (
                              <button
                                onClick={() => acceptTask(req._id)}
                                className="w-full bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white py-2 rounded-lg transition text-[10px] font-bold uppercase"
                              >
                                Accept Task
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Map */}
              <div className="flex-1 clean-panel rounded-xl overflow-hidden relative">
                <Map requests={requests} />
                <div className="absolute top-4 right-4 bg-black/90 backdrop-blur p-3 rounded-lg border border-brand-border text-xs space-y-2 z-[400]">
                  <div className="text-[10px] uppercase font-bold tracking-widest mb-2 text-brand-muted">Legend</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-danger"></div>Critical</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-warning"></div>High</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Medium</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-success"></div>Low</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto"
            >
              {/* Volunteer-Specific Stats */}
              {user.role === 'volunteer' && (
                <>
                  <div className="clean-panel p-6 rounded-xl border-2 border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted">My Tasks</h3>
                      <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{stats.myTasks}</div>
                    <p className="text-xs text-brand-muted">Total assigned to me</p>
                  </div>

                  <div className="clean-panel p-6 rounded-xl border-2 border-brand-success/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted">My Completed</h3>
                      <CheckCircle2 size={20} className="text-brand-success" />
                    </div>
                    <div className="text-4xl font-bold mb-2 text-brand-success">{stats.myCompleted}</div>
                    <p className="text-xs text-brand-muted">Successfully resolved</p>
                  </div>

                  <div className="clean-panel p-6 rounded-xl border-2 border-blue-400/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted">My Active</h3>
                      <Activity size={20} className="text-blue-400" />
                    </div>
                    <div className="text-4xl font-bold mb-2 text-blue-400">{stats.myActive}</div>
                    <p className="text-xs text-brand-muted">Currently working on</p>
                  </div>
                </>
              )}

              {/* General Stats Cards */}
              <div className="clean-panel p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted">Resolution Rate</h3>
                  <TrendingUp size={20} className="text-brand-success" />
                </div>
                <div className="text-4xl font-bold mb-2">{stats.resolutionRate}%</div>
                <p className="text-xs text-brand-muted">{stats.resolved} of {stats.total} cases resolved</p>
              </div>

              <div className="clean-panel p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted">Pending</h3>
                  <AlertCircle size={20} className="text-yellow-500" />
                </div>
                <div className="text-4xl font-bold mb-2">{stats.pending}</div>
                <p className="text-xs text-brand-muted">Awaiting response</p>
              </div>

              <div className="clean-panel p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted">In Progress</h3>
                  <Users size={20} className="text-blue-400" />
                </div>
                <div className="text-4xl font-bold mb-2">{stats.inProgress}</div>
                <p className="text-xs text-brand-muted">Being handled</p>
              </div>

              {/* Category Breakdown */}
              <div className="clean-panel p-6 rounded-xl col-span-1 md:col-span-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted mb-6">Category Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                      <div className="w-full bg-brand-card rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all"
                          style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolved Cases Timeline */}
              <div className="clean-panel p-6 rounded-xl col-span-1 lg:col-span-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted mb-4">Recently Resolved Cases</h3>
                <div className="space-y-2">
                  {requests.filter(r => r.status === 'resolved').slice(0, 5).map(req => (
                    <div key={req._id} className="flex items-center justify-between p-3 bg-brand-card rounded-lg hover:bg-brand-border transition">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-brand-success" />
                        <div>
                          <div className="font-semibold text-sm">{req.title}</div>
                          <div className="text-xs text-brand-muted">{req.category} • {new Date(req.resolvedAt || req.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${req.urgency === 'critical' ? 'bg-brand-danger/20 text-brand-danger' : 'bg-brand-border text-white'
                        }`}>
                        {req.urgency}
                      </span>
                    </div>
                  ))}
                  {requests.filter(r => r.status === 'resolved').length === 0 && (
                    <div className="text-center py-10 text-brand-muted">No resolved cases yet</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isModalOpen && <RequestModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;
