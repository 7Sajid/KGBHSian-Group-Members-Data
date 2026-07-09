import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../config.js';

export default function Directory() {
  const [members, setMembers] = useState(null); // null = loading
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);

  async function load() {
    try {
      const res = await fetch(`${API_BASE}/api/members`);
      if (!res.ok) throw new Error('Failed to load directory.');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.batch, m.employment, m.blood, m.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [members, query]);

  if (error) {
    return <div className="empty-state">Couldn't load the directory: {error}</div>;
  }

  if (members === null) {
    return <div className="loading-state">Loading member directory…</div>;
  }

  return (
    <div>
      <div className="directory-toolbar">
        <input
          className="search-input"
          placeholder="Search by name, batch, designation, blood group..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="tab-btn" onClick={load}>Refresh</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {members.length === 0 ? 'No members registered yet — be the first!' : 'No matches found.'}
        </div>
      ) : (
        <div className="directory-grid">
          {filtered.map((m) => (
            <div className="member-tile" key={m.id}>
              <div className="m-name">{m.name}</div>
              <div className="m-row"><span className="k">Batch</span><span>{m.batch}</span></div>
              <div className="m-row"><span className="k">Designation</span><span>{m.employment}</span></div>
              <div className="m-row"><span className="k">Blood Group</span><span>{m.blood}</span></div>
              {m.location && <div className="m-row"><span className="k">Location</span><span>{m.location}</span></div>}
              {m.phone && <div className="m-row"><span className="k">Phone</span><span>{m.phone}</span></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
