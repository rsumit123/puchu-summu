// What the site shows before (or without) the admin-managed content.json.
// It is also the seed that was uploaded to the bucket on first setup.

import dates from './dates.json';
import words from './wordcloud.json';

const PHOTOS = 'https://sumits-private-storage.s3.us-east-1.amazonaws.com/puchu-photos';

const defaultContent = {
  version: 1,
  dates,
  moments: [
    { id: 'm1', title: 'Puducherry Trip', description: 'Our first college Trip together....!!', image: `${PHOTOS}/pudu_2.jpg` },
    { id: 'm2', title: 'Himachal Trip', description: 'Our first trip to the snowy lands.. Although didi was there we still had great fun!!', image: `${PHOTOS}/himachal_trip.jpg` },
    { id: 'm3', title: 'Puri Trip', description: 'Our trip to puri together where we visited the temple and also the beach.', image: `${PHOTOS}/puri_trip_2.jpg` },
    { id: 'm4', title: 'Andaman Trip', description: 'Our first trip via Flight, we flew like love birds to an island.', image: `${PHOTOS}/andaman_trip.jpg` },
    { id: 'm5', title: 'Thailand Trip', description: 'We went to a place where everyone wishes to go.. like always .. together!!', image: `${PHOTOS}/thailand_trip.jpg` },
    { id: 'm6', title: 'Weekend Getaway', description: 'Our weekend trip to the mall is always fun and so filling for me.', image: `${PHOTOS}/trip_mall.jpg` },
  ],
  gallery: ['/images/puju_test_1.jpg', '/images/puju10.jpg', '/images/puju8.jpg', '/images/photo7.jpg'],
  message:
    "Puchu Baby.. I love you too much babes. You have sorted my life in a way that i cant express. You have taught me responsibilty, seriousness and how to deal with life's problems and more importantly you have taught me how to love. I will always love you forever!! No matter how you feel, i will always be there for you. I want to be that constant in your life that never changes, no matter what happens.",
  words,
};

export default defaultContent;
