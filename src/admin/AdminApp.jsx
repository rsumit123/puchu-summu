import React, { useCallback, useEffect, useState } from 'react';
import Login from './Login';
import DatesTab from './DatesTab';
import TripsTab from './TripsTab';
import PhotosTab from './PhotosTab';
import TextTab from './TextTab';
import { AuthError, getToken, setToken, loadDraft, saveContent } from './api';
import './admin.css';

const TABS = [
  ['dates', 'Dates'],
  ['trips', 'Trips'],
  ['photos', 'Photos'],
  ['text', 'Message & words'],
];

const sortDates = (dates) => [...dates].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

const AdminApp = () => {
  const [token, setTokenState] = useState(getToken);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState('');
  const [tab, setTab] = useState('dates');
  const [status, setStatus] = useState(null); // { ok: bool, text }
  const [saving, setSaving] = useState(false);

  const signOut = useCallback((text) => {
    setToken(null);
    setTokenState(null);
    setDraft(null);
    setStatus(text ? { ok: false, text } : null);
  }, []);

  useEffect(() => {
    document.title = 'Admin · Puchu and Summu';
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    let live = true;
    loadDraft().then((c) => {
      if (!live) return;
      setDraft(c);
      setSaved(JSON.stringify(c));
    });
    return () => {
      live = false;
    };
  }, [token]);

  const dirty = !!draft && JSON.stringify(draft) !== saved;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // update('dates')(list) or update('gallery')(current => [...current, url])
  const update = (key) => (value) =>
    setDraft((d) => ({ ...d, [key]: typeof value === 'function' ? value(d[key]) : value }));

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const out = await saveContent(token, { ...draft, dates: sortDates(draft.dates) });
      setDraft(out);
      setSaved(JSON.stringify(out));
      setStatus({ ok: true, text: 'Saved — the site is updated.' });
    } catch (err) {
      if (err instanceof AuthError) signOut('Your session expired — please sign in again.');
      else setStatus({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="admin">
        {status && <p className="banner bad">{status.text}</p>}
        <Login onLoggedIn={(t) => { setStatus(null); setTokenState(t); }} />
      </div>
    );
  }

  if (!draft) return <div className="admin"><p className="hint">Loading…</p></div>;

  const expired = () => signOut('Your session expired — please sign in again.');

  return (
    <div className="admin">
      <header className="bar">
        <h1>Puchu &amp; Summu admin</h1>
        <div className="bar-actions">
          <a className="btn" href="/" target="_blank" rel="noreferrer">View site</a>
          <button type="button" className="btn" onClick={() => signOut()}>Sign out</button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'tab active' : 'tab'} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'dates' && <DatesTab dates={draft.dates} onChange={update('dates')} />}
      {tab === 'trips' && <TripsTab moments={draft.moments} onChange={update('moments')} token={token} onAuthError={expired} />}
      {tab === 'photos' && <PhotosTab gallery={draft.gallery} onChange={update('gallery')} token={token} onAuthError={expired} />}
      {tab === 'text' && (
        <TextTab message={draft.message} words={draft.words} onMessage={update('message')} onWords={update('words')} />
      )}

      <footer className="savebar">
        <span className={status ? (status.ok ? 'banner ok' : 'banner bad') : 'hint'}>
          {status ? status.text : dirty ? 'You have unsaved changes' : 'All changes saved'}
        </span>
        <button type="button" className="btn primary" disabled={!dirty || saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </footer>
    </div>
  );
};

export default AdminApp;
