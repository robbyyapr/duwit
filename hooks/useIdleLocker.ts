import { useEffect, useRef } from 'react';

export const useIdleLocker = (onIdle: () => void, timeout: number) => {
  // Fix: Initialize useRef with null and provide the correct type. useRef<T>() is invalid; it needs an initial value.
  const timeoutId = useRef<number | null>(null);

  const resetTimer = () => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
    timeoutId.current = window.setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer(); // Initial timer start

    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onIdle, timeout]);
};
