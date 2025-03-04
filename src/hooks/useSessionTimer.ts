// src/hooks/useSessionTimer.ts
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Session timeout in milliseconds (e.g., 30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const useSessionTimer = () => {
  const { logout } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        await logout();
        window.location.href = '/login?expired=true';
      }, SESSION_TIMEOUT);
    };

    // Events that reset the timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    // Set up event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Clean up
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);
};
