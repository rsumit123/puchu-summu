import React, { useState, useEffect } from 'react';
import './PhotoGallery.css';

const PhotoGallery = () => {
  const pool = [
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/puju_test_1.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/puju8.jpg',
    // 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/puju9.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/puju10.jpg',
    // 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/puju5.jpg',
    // 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/puju6.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo7.jpg',
    // 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo8.jpg'
  ];

  // Utility to pick a new photo that's not the current one.
  function getRandomPhoto(current) {
    const available = pool.filter(url => url !== current);
    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : current;
  }

  const [photo, setPhoto] = useState(getRandomPhoto(''));
  const [photoKey, setPhotoKey] = useState(Date.now());
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset loading state when the photo key changes.
  useEffect(() => {
    setImageLoaded(false);
  }, [photoKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPhoto = getRandomPhoto(photo);
      setPhoto(newPhoto);
      setPhotoKey(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, [photo]);

  return (
    <header className="header">
      <div id="heart">
        {/*
          The SVG uses a path (in objectBoundingBox coordinates) that produces
          a thicker heart. The same path is used for both the clipPath (which will clip
          the content of .photo-container) and for the SVG background.
          Here we set the fill to "transparent" so that our container’s background takes over.
        */}
        <svg className="heart-svg" viewBox="0 0 1 1" preserveAspectRatio="none">
          <defs>
            <clipPath id="heartClip" clipPathUnits="objectBoundingBox">
              <path d="
                M 0.5,0.35
                C 0.00,0.00,   0.0,0.70,   0.5,0.95
                C 1.0,0.70,    1.0,0.00,   0.5,0.35
                Z
              " />
            </clipPath>
          </defs>
          <path
            d="
              M 0.5,0.35
              C 0.00,0.00,   0.0,0.70,   0.5,0.95
              C 1.0,0.70,    1.0,0.00,   0.5,0.35
              Z
            "
            fill="transparent"
          />
        </svg>

        {/*
          The photo container now uses a background image set to the same photo.
          With background-size: cover, the entire heart is always filled.
          Then we overlay the actual <img> (with object-fit: contain) so that the entire photo is visible.
        */}
        <div
          className="photo-container"
          style={{ backgroundImage: `url(${photo})` }}
        >
          {!imageLoaded && (
            <div className="loading-message">Puchu getting ready...</div>
          )}
          <div key={photoKey} className="photo-item">
            <img
              src={photo}
              alt="Gallery"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PhotoGallery;
