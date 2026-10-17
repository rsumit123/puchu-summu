import React from 'react';
import { useContent } from '../content/useContent';
import './Calendar.css';

// Map each event to a custom icon.
const getIcon = (event) => {
  switch (event) {
    case 'First Date':
      return '❤️';
    case 'Anniversary':
      return '🎉';
    case 'First Kiss':
      return '😘';
    case 'First Outing':
      return '🚗';
    case 'First Makeout':
      return '💋';
    default:
      return '⭐';
  }
};

const Calendar = () => {
  const { dates } = useContent();
  return (
    <div className="calendar-container">
      <h2>Our Special Dates</h2>
      <div className="timeline">
        {dates.map((item, index) => (
          <div
            key={index}
            className="timeline-item"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="timeline-icon">{item.emoji || getIcon(item.event)}</div>
            <div className="timeline-content">
              <h3>
                {new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <p>{item.event}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
