import React, { useState, useEffect } from 'react';
import './PhotoGallery.css';

const PhotoGallery = () => {
  const pool = [
    '/images/puju_test_1.jpg',
    '/images/puju10.jpg',
    '/images/puju8.jpg',
    // '/images/puju4.jpg',
    // '/images/puju5.jpg',
    // '/images/puju6.jpg',
    '/images/photo7.jpg',
    // '/images/photo8.jpg'
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

  // Reset imageLoaded state whenever photoKey changes.
  useEffect(() => {
    setImageLoaded(false);
  }, [photoKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPhoto = getRandomPhoto(photo);
      setPhoto(newPhoto);
      setPhotoKey(Date.now()); // triggers dropIn animation and resets loaded state
    }, 5000);
    return () => clearInterval(interval);
  }, [photo]);

  return (
    <header className="header">
      <div id="heart">
        {/*
          This SVG uses a path defined in 0..1 coordinates (objectBoundingBox).
          The updated path produces a thicker heart:
            - The top point has been moved down.
            - The control points have been expanded so that the lobes are wider.
          The same path is used for both the red fill and the clipPath.
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
            fill="red"
          />
        </svg>

        {/*
          The photo container uses the same clipPath so the image always fits
          perfectly inside the red heart shape.
          It also uses the current photo as a background image (with cover)
          so that any extra space (due to using object-fit: contain on the <img>)
          is filled with the photo.
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
