import React from 'react';
import { useContent } from '../content/useContent';
import './FunMoments.css';

const FunMoments = () => {
  const { moments } = useContent();
  return (
    <div className="fun-moments">
      <h2>Our Fun Moments</h2>
      <div className="moments-grid">
        {moments.map((moment) => (
          <div key={moment.id} className="moment-card">
            <img src={moment.image} alt={moment.title} />
            <h3>{moment.title}</h3>
            <p>{moment.description}</p>
          </div>
        ))}
        <div className="moment-card busy-card">
          <h3>Busy in making more moments...</h3>
        </div>
      </div>
    </div>
  );
};

export default FunMoments;
