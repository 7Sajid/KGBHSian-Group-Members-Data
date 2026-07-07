import React, { useEffect, useState, useCallback } from 'react';
import RegisterForm from './components/RegisterForm.jsx';
import Directory from './components/Directory.jsx';
import { API_BASE } from './config.js';

export default function App() {
  const [tab, setTab] = useState('register');
  const [count, setCount] = useState(null);

  const loadCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/members/count`);
      const data = await res.json();
      setCount(data.count);
    } catch {
      setCount(null);
    }
  }, []);

  useEffect(() => { loadCount(); }, [loadCount]);

  return (
    <div className="wrap">
      <div className="header">
        <div className="seal"><img src="/crest.png" alt="KGBHSian crest" /></div>
        <div className="eyebrow">Alumni Registry</div>
        <h1>KGBHSian Group Members Data</h1>
        <p className="sub">
          Register once to be counted in the group directory — your SSC batch, current work,
          and contact details, kept together in one record.
        </p>
        <div className="counter">
          <span className="dot" /> <b>{count ?? '—'}</b> members registered so far
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
          Register
        </button>
        <button className={`tab-btn ${tab === 'directory' ? 'active' : ''}`} onClick={() => setTab('directory')}>
          Member Directory
        </button>
      </div>

      {tab === 'register' ? (
        <RegisterForm onRegistered={loadCount} />
      ) : (
        <Directory />
      )}

      <footer>KGBHSian Group Members Data · registration record</footer>
    </div>
  );
}
