'use client';
import { useEffect, useState } from 'react';

export default function VerifyPage() {
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setMessage('Missing token');
      return;
    }
    fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ token }) })
      .then((res) => res.json())
      .then((data) => setMessage(data.message || 'Verified'))
      .catch(() => setMessage('Unable to verify account'));
  }, []);

  return (
    <div className="max-w-lg mx-auto glass-card p-8">
      <h1 className="text-2xl font-bold mb-2">Email verification</h1>
      <p>{message}</p>
    </div>
  );
}
