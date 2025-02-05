import React from 'react';
import './ScrollArrow.css';

const ScrollArrow = ({ targetId }) => {
  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="scroll-arrow" onClick={handleClick}>
      <span className="arrow">&#x2193;</span>
    </div>
  );
};

export default ScrollArrow;
