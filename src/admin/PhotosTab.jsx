import React from 'react';
import PhotoUpload from './PhotoUpload';

const PhotosTab = ({ gallery, onChange, token, onAuthError }) => {
  const remove = (i) => onChange(gallery.filter((_, j) => j !== i));

  // Several uploads finish one after another, so always append to the latest list.
  const append = (url) => onChange((current) => [...current, url]);

  return (
    <section>
      <p className="hint">These rotate inside the heart at the top. If you remove them all, the built-in photos are shown.</p>
      <div className="grid">
        {gallery.map((url, i) => (
          <div className="thumb" key={`${url}-${i}`}>
            <img src={url} alt="" />
            <button type="button" className="btn danger" aria-label="Remove photo" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <PhotoUpload token={token} multiple label="+ Add photos" onAuthError={onAuthError} onUploaded={append} />
    </section>
  );
};

export default PhotosTab;
