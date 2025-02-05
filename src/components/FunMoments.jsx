import React from 'react';
import './FunMoments.css';

const moments = [
  {
    id: 1,
    title: 'Puducherry Trip',
    description: 'Our first college Trip together....!!',
    image: 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/pudu_2.jpg'
  },
  {
    id: 2,
    title: 'Himachal Trip',
    description: 'Our first trip to the snowy lands.. Although didi was there we still had great fun!!',
    image: 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/himachal_trip.jpg'
  },
  {
    id: 3,
    title: 'Puri Trip',
    description: 'Our trip to puri together where we visited the temple and also the beach.',
    image: 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/puri_trip_2.jpg'
  },
  {
    id: 4,
    title: 'Andaman Trip',
    description: 'Our first trip via Flight, we flew like love birds to an island.',
    image: 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/andaman_trip.jpg'
  },
  {
    id: 5,
    title: 'Thailand Trip',
    description: 'We went to a place where everyone wishes to go.. like always .. together!!',
    image: 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/thailand_trip.jpg'
  },
  {
    id: 6,
    title: 'Weekend Getaway',
    description: 'Our weekend trip to the mall is always fun and so filling for me.',
    image: 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos/trip_mall.jpg'
  }
];

const FunMoments = () => {
  return (
    <div className="fun-moments">
      <h2>Our Fun Moments</h2>
      <div className="moments-grid">
        {moments.map((moment, index) => (
          <div key={index} className="moment-card">
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
