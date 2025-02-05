import { useEffect } from 'react';

const DisableScroll = () => {
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
    };
  }, []);
  
  return null;
};

export default DisableScroll;
