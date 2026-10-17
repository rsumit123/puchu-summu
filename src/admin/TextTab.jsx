import React from 'react';

const TextTab = ({ message, words, onMessage, onWords }) => {
  const set = (i, patch) => onWords(words.map((w, j) => (j === i ? { ...w, ...patch } : w)));
  const remove = (i) => onWords(words.filter((_, j) => j !== i));
  const add = () => onWords([...words, { value: '', count: 1 }]);

  return (
    <section>
      <h3>Message</h3>
      <textarea className="message" rows={8} maxLength={4000} value={message} onChange={(e) => onMessage(e.target.value)} />

      <h3>Word cloud</h3>
      <p className="hint">Bigger count = bigger word.</p>
      {words.map((w, i) => (
        <div className="row" key={i}>
          <input className="grow" placeholder="Word" maxLength={40} value={w.value} onChange={(e) => set(i, { value: e.target.value })} />
          <input className="count" type="number" min={1} max={100000} value={w.count} onChange={(e) => set(i, { count: e.target.value === '' ? '' : Number(e.target.value) })} />
          <button type="button" className="btn danger" aria-label="Delete word" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="btn" onClick={add}>+ Add word</button>
    </section>
  );
};

export default TextTab;
