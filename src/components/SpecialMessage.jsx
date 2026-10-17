import React from 'react';
import { useContent } from '../content/useContent';
import './SpecialMessage.css';

const SpecialMessage = () => {
  const { message } = useContent();
  return (
    <div className="special-message">
      <h2>A Message from My Heart</h2>
      <p>{message}</p>
    </div>
  );
};

export default SpecialMessage;
