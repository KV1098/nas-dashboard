'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Ping states
  const [nasOnline, setNasOnline] = useState<boolean | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [pinging, setPinging] = useState<boolean>(false);

  const checkPing = async () => {
    setPinging(true);
    try {
      const response = await fetch('/api/ping');
      const data = await response.json();
      
      if (response.ok && data.status === 'online') {
        setNasOnline(true);
        setPingMs(data.ping_ms);
      } else {
        setNasOnline(false);
        setPingMs(null);
      }
    } catch (error) {
      setNasOnline(false);
      setPingMs(null);
    } finally {
      setPinging(false);
    }
  };

  // Check ping on load
  useEffect(() => {
    checkPing();
  }, []);

  const handleAction = async (action: 'wake' | 'shutdown') => {
    setLoading(true);
    setStatus(`Sending ${action} command...`);
    
    try {
      const response = await fetch(`/api/${action}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus(`Success: ${data.message}`);
        // Check ping a few seconds after action
        setTimeout(checkPing, 5000);
      } else {
        setStatus(`Error: ${data.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setStatus(`Network error. Ensure the backend is reachable.`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>NAS Control</h1>
        <p>Remote Power Management</p>
      </div>
      
      {/* Ping Status Indicator */}
      <div 
        style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px',
          padding: '10px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div style={{
          width: '12px', height: '12px', borderRadius: '50%',
          backgroundColor: nasOnline === true ? '#10b981' : (nasOnline === false ? '#ef4444' : '#a0aab2'),
          boxShadow: nasOnline === true ? '0 0 10px #10b981' : (nasOnline === false ? '0 0 10px #ef4444' : 'none'),
          transition: 'all 0.3s ease'
        }} />
        <span style={{ fontWeight: 600, color: nasOnline === true ? '#10b981' : (nasOnline === false ? '#ef4444' : '#a0aab2') }}>
          {pinging ? 'Checking...' : (nasOnline === true ? 'NAS ONLINE' : (nasOnline === false ? 'NAS OFFLINE' : 'UNKNOWN STATUS'))}
        </span>
        {nasOnline && pingMs !== null && (
          <span style={{ fontSize: '0.8rem', color: '#a0aab2', marginLeft: '5px' }}>
            ({pingMs}ms)
          </span>
        )}
        <button 
          onClick={checkPing} 
          disabled={pinging}
          style={{
            marginLeft: 'auto',
            background: 'none', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', borderRadius: '6px', padding: '4px 8px',
            cursor: 'pointer', fontSize: '0.8rem'
          }}
        >
          Refresh
        </button>
      </div>
      
      <div className="action-buttons">
        <button 
          className="btn btn-wake"
          onClick={() => handleAction('wake')}
          disabled={loading || pinging}
        >
          {loading ? 'Processing...' : 'Wake Up (WOL)'}
        </button>
        
        <button 
          className="btn btn-shutdown"
          onClick={() => {
            if (window.confirm('Are you sure you want to shut down the NAS?')) {
              handleAction('shutdown');
            }
          }}
          disabled={loading || pinging}
        >
          {loading ? 'Processing...' : 'Shutdown NAS'}
        </button>
      </div>

      <div className="status-message">
        {status}
      </div>
    </div>
  );
}
