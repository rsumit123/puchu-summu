import React from 'react';

const today = () => new Date().toISOString().slice(0, 10);

const DatesTab = ({ dates, onChange }) => {
  const set = (i, patch) => onChange(dates.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const remove = (i) => onChange(dates.filter((_, j) => j !== i));
  const add = () => onChange([...dates, { date: today(), event: '', emoji: '' }]);

  return (
    <section>
      <p className="hint">Shown on the timeline, sorted by date when you save. Leave the emoji empty to use the default icon.</p>
      {dates.map((d, i) => (
        <div className="row" key={i}>
          <input type="date" value={d.date} onChange={(e) => set(i, { date: e.target.value })} />
          <input className="grow" placeholder="What happened?" maxLength={80} value={d.event} onChange={(e) => set(i, { event: e.target.value })} />
          <input className="emoji" placeholder="🙂" maxLength={8} value={d.emoji || ''} onChange={(e) => set(i, { emoji: e.target.value })} />
          <button type="button" className="btn danger" aria-label="Delete date" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="btn" onClick={add}>+ Add date</button>
    </section>
  );
};

export default DatesTab;
