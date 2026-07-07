import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import MemberCard from './MemberCard.jsx';
import { API_BASE } from '../config.js';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't know"];

const EMPTY_FORM = {
  name: '', batch: '', phone: '', email: '',
  employment: '', blood: '', location: '', address: ''
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please enter your full name.";
  if (!/^(19|20)\d{2}$/.test(form.batch.trim())) errors.batch = "Please enter your SSC batch year.";
  if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) errors.phone = "Please enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Please enter a valid email address.";
  if (!form.employment.trim()) errors.employment = "Please enter your current designation.";
  if (!form.blood) errors.blood = "Please select your blood group.";
  if (!form.address.trim()) errors.address = "Please enter your present address.";
  return errors;
}

function triggerDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function RegisterForm({ onRegistered }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok'|'err', message }
  const cardRef = useRef(null);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const foundErrors = validate(form);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      setStatus({ type: 'err', message: 'Please fix the highlighted fields above.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      // 1. Render the ID card to a JPG in the browser
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#14213D', scale: 2 });
      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const base64Only = jpgDataUrl.split(',')[1];

      // 2. Send everything to the backend — it stores the row and archives the card
      const res = await fetch(`${API_BASE}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageBase64: base64Only })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Registration failed.');
      }

      const result = await res.json();

      // 3. Always give the member their JPG immediately
      triggerDownload(jpgDataUrl, `KGBHSian_Card_${form.name.replace(/\s+/g, '_')}.jpg`);

      setStatus({ type: 'ok', message: 'Registered! Your card has downloaded and been saved to the group archive.' });

      setForm(EMPTY_FORM);
      setErrors({});
      onRegistered?.();
    } catch (err) {
      setStatus({ type: 'err', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid">
      <div className="panel">
        <form onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.name ? 'invalid' : ''}`}>
            <label>Full Name<span className="req">*</span></label>
            <input type="text" value={form.name} onChange={update('name')} placeholder="e.g. Md. Rahim Uddin" autoComplete="name" />
            <div className="error-text">{errors.name}</div>
          </div>

          <div className="row2">
            <div className={`field ${errors.batch ? 'invalid' : ''}`}>
              <label>SSC Batch<span className="req">*</span></label>
              <input type="text" value={form.batch} onChange={update('batch')} placeholder="e.g. 2004" inputMode="numeric" />
              <div className="error-text">{errors.batch}</div>
            </div>
            <div className={`field ${errors.phone ? 'invalid' : ''}`}>
              <label>Phone Number<span className="req">*</span></label>
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="e.g. 01XXXXXXXXX" autoComplete="tel" />
              <div className="error-text">{errors.phone}</div>
            </div>
          </div>

          <div className={`field ${errors.employment ? 'invalid' : ''}`}>
            <label>Current Employment / Designation<span className="req">*</span></label>
            <input type="text" value={form.employment} onChange={update('employment')} placeholder="e.g. Assistant Engineer, WASA" />
            <div className="error-text">{errors.employment}</div>
          </div>

          <div className={`field ${errors.email ? 'invalid' : ''}`}>
            <label>Email Address<span className="req">*</span></label>
            <input type="email" value={form.email} onChange={update('email')} placeholder="e.g. rahim@gmail.com" autoComplete="email" />
            <div className="error-text">{errors.email}</div>
          </div>

          <div className="row2">
            <div className={`field ${errors.blood ? 'invalid' : ''}`}>
              <label>Blood Group<span className="req">*</span></label>
              <select value={form.blood} onChange={update('blood')}>
                <option value="">Select...</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              <div className="error-text">{errors.blood}</div>
            </div>
            <div className="field">
              <label>Present Address (short)</label>
              <input type="text" value={form.location} onChange={update('location')} placeholder="City / District (shown on card)" />
            </div>
          </div>

          <div className={`field ${errors.address ? 'invalid' : ''}`} style={{ marginTop: -8 }}>
            <textarea value={form.address} onChange={update('address')} placeholder="Full present address (house, road, area, city, district)" />
            <div className="error-text">{errors.address}</div>
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register Member'}
          </button>

          {status && <div className={`status show ${status.type}`}>{status.message}</div>}
        </form>
      </div>

      <div className="card-col">
        <MemberCard ref={cardRef} data={form} />
        <div className="hint-card">
          Your card fills in live as you type. On submit, it's saved to the group directory,
          downloaded to your device, and archived on the server as a JPG.
        </div>
      </div>
    </div>
  );
}
