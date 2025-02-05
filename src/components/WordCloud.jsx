import React from 'react';
import words from '../data/wordcloud.json';
import './WordCloud.css';

const WordCloud = () => {
  // Determine the min and max count values from the data
  const counts = words.map(word => word.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  // Function to calculate font size based on count (frequency)
  const getFontSize = (count) => {
    const minSize = 16; // minimum font size in pixels
    const maxSize = 40; // maximum font size in pixels

    // If all counts are equal, just return the midpoint
    if (minCount === maxCount) {
      return (minSize + maxSize) / 2;
    }

    // Linear interpolation: Map count value to the range minSize..maxSize
    return ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize) + minSize;
  };

  return (
    <div className="word-cloud">
      <h2>Our Chat Word Cloud</h2>
      <div className="word-cloud-container">
        {words.map((word, index) => (
          <span
            key={index}
            style={{
              fontSize: `${getFontSize(word.count)}px`,
              margin: '0 5px',
              display: 'inline-block'
            }}
          >
            {word.value}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordCloud;
