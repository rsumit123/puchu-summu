import React, { useState, useEffect } from 'react';
import './PhotoGallery.css';

const PhotoGallery = () => {
  const pool = [
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo1.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo2.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo3.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo4.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo5.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo6.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo7.jpg',
    'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/photo8.jpg'
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

  useEffect(() => {
    const interval = setInterval(() => {
      const newPhoto = getRandomPhoto(photo);
      setPhoto(newPhoto);
      setPhotoKey(Date.now()); // forces a re-mount -> dropIn animation
    }, 5000);

    return () => clearInterval(interval);
  }, [photo]);

  return (
    <header className="header">
      <div id="heart">
        {/*
          This SVG uses a path defined in 0..1 coordinates (objectBoundingBox).
          • The path is used to fill the heart background in red.
          • The same path is used as a clipPath so the photo is clipped identically.
        */}
        <svg className="heart-svg" viewBox="0 0 1 1" preserveAspectRatio="none">
          <defs>
            <clipPath id="heartClip" clipPathUnits="objectBoundingBox">
              <path d="
                M 0.5,0.15
                C 0.0,-0.10,   0.0,0.50,   0.5,1.0
                C 1.0,0.50,    1.0,-0.10,  0.5,0.15
                Z
              " />
            </clipPath>
          </defs>
          <path
            d="
              M 0.5,0.15
              C 0.0,-0.10,   0.0,0.50,   0.5,1.0
              C 1.0,0.50,    1.0,-0.10,  0.5,0.15
              Z
            "
            fill="red"
          />
        </svg>

        {/*
          The photo container uses the same clipPath so the image always fits
          perfectly inside the red heart shape.
        */}
        <div className="photo-container">
          <div key={photoKey} className="photo-item">
            <img src={photo} alt="Gallery" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PhotoGallery;
