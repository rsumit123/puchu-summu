import React, { useEffect, useState } from 'react';
import eventsData from './events.json'; // Adjust the path if needed
import './HeartAnimation.css';

const HeartAnimation = () => {
  // Number of total falling items (emojis).
  const FALL_COUNT = 30;

  // A small pool of default hearts to mix in, besides the event’s emoji.
  const DEFAULT_HEARTS = ['❤️','💖','💕','💗','💘','💞'];

  // Utility to pick a random item from an array.
  function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Utility to pick a random float in [min, max).
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // 1) Figure out today's date (month/day). We'll ignore the year in events.
  const now = new Date();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0'); 
  const dayStr   = String(now.getDate()).padStart(2, '0'); 
  // For comparison, we'll do "MM-DD".
  const todayStr = `${monthStr}-${dayStr}`;

  // 2) See if there's a matching event with day/month
  let matchedEvent = null;
  for (const ev of eventsData) {
    const [evYear, evMon, evDay] = ev.date.split('-'); 
    if (evMon === monthStr && evDay === dayStr) {
      matchedEvent = ev;
      break;
    }
  }

  // 3) Build an array of emojis to fall:
  //    - If matchedEvent has an emoji, add it a few times
  //    - Fill up the rest with random hearts
  const emojisForFalling = [];
  if (matchedEvent && matchedEvent.emoji) {
    for (let i = 0; i < 10; i++) {
      emojisForFalling.push(matchedEvent.emoji);
    }
  }
  while (emojisForFalling.length < FALL_COUNT) {
    emojisForFalling.push(randomFromArray(DEFAULT_HEARTS));
  }
  // Shuffle them
  emojisForFalling.sort(() => 0.5 - Math.random());

  // 4) Prepare “falling items” with random positions/sizes/durations
  const [items, setItems] = useState([]);
  useEffect(() => {
    const newItems = emojisForFalling.map((emo, i) => ({
      id: i,
      emoji: emo,
      left: `${randomRange(0, 100)}%`,
      size: `${randomRange(1.4, 3.0)}rem`,
      duration: `${randomRange(4, 8)}s`,
      delay: `${randomRange(0, 2)}s`
    }));
    setItems(newItems);
  }, [matchedEvent]);

  // 5) Possibly show the event text if there's a match
  //    We'll make *that* text also fall, using a similar animation approach
  const showEventText = !!matchedEvent;
  const eventText     = matchedEvent?.event ?? '';

  return (
    <>
      {/* 
        If there's a matched event, display a single "falling-event-text"
        that moves from top to bottom just like the hearts. 
      */}
      { showEventText && (
        <div className="falling-text-banner">
          {eventText}
        </div>
      )}

      {/* The falling emojis */}
      <div className="heart-container">
        {items.map(({ id, emoji, left, size, duration, delay }) => (
          <div
            key={id}
            className="heart"
            style={{
              left,
              fontSize: size,
              animationDuration: duration,
              animationDelay: delay
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </>
  );
};

export default HeartAnimation;
