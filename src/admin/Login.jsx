import React, { useState } from 'react';
import { login, setToken } from './api';

const Login = ({ onLoggedIn }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const token = await login(password);
      setToken(token);
      onLoggedIn(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login card" onSubmit={submit}>
      <h1>Admin</h1>
      <input
        type="password"
        placeholder="Password"
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn primary" disabled={busy || !password}>
        {busy ? 'Checking…' : 'Sign in'}
      </button>
      {error && <p className="field-error">{error}</p>}
    </form>
  );
};

export default Login;
