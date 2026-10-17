import React, { useRef, useState } from 'react';
import { uploadPhoto, AuthError } from './api';

// A button that picks a photo, uploads it, and reports the public URL.
// Several files at once are uploaded one after another.
const PhotoUpload = ({ token, label = 'Upload photo', multiple = false, onUploaded, onAuthError }) => {
  const input = useRef(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    try {
      for (let i = 0; i < files.length; i++) {
        setBusy(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : 'Uploading…');
        onUploaded(await uploadPhoto(token, files[i]));
      }
    } catch (err) {
      if (err instanceof AuthError) onAuthError?.();
      else setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <span className="upload">
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={pick} />
      <button type="button" className="btn" disabled={!!busy} onClick={() => input.current.click()}>
        {busy || label}
      </button>
      {error && <span className="field-error">{error}</span>}
    </span>
  );
};

export default PhotoUpload;
