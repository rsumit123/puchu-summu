import React from 'react';
import PhotoUpload from './PhotoUpload';

const TripsTab = ({ moments, onChange, token, onAuthError }) => {
  const set = (i, patch) => onChange(moments.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const remove = (i) => onChange(moments.filter((_, j) => j !== i));
  const move = (i, by) => {
    const j = i + by;
    if (j < 0 || j >= moments.length) return;
    const next = [...moments];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...moments, { id: `m${Date.now().toString(36)}`, title: '', description: '', image: '' }]);

  return (
    <section>
      <p className="hint">Cards in "Our Fun Moments". Every trip needs a title and a photo.</p>
      {moments.map((m, i) => (
        <div className="card trip" key={m.id}>
          {m.image ? <img src={m.image} alt="" /> : <div className="no-photo">No photo yet</div>}
          <div className="trip-fields">
            <input placeholder="Title" maxLength={80} value={m.title} onChange={(e) => set(i, { title: e.target.value })} />
            <textarea placeholder="Description" rows={3} maxLength={400} value={m.description} onChange={(e) => set(i, { description: e.target.value })} />
            <div className="actions">
              <PhotoUpload token={token} label={m.image ? 'Change photo' : 'Add photo'} onAuthError={onAuthError} onUploaded={(url) => set(i, { image: url })} />
              <button type="button" className="btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="btn" aria-label="Move down" disabled={i === moments.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="btn danger" onClick={() => remove(i)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={add}>+ Add trip</button>
    </section>
  );
};

export default TripsTab;
