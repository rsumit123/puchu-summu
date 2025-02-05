import React from 'react';
import './ScrollUpArrow.css';

const ScrollUpArrow = ({ targetId }) => {
  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="scroll-up-arrow" onClick={handleClick}>
      <span className="arrow">&#x2191;</span>
    </div>
  );
};

export default ScrollUpArrow;
