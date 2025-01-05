import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT = 5 * 1000; // 30 seconds in milliseconds
let timeoutId: ReturnType<typeof setTimeout>;

export default function SessionManager() {
  const navigate = useNavigate();

  const resetTimer = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
  };

  const handleSessionTimeout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('accountData');
    alert('Your session has expired. Please login again.');
    navigate('/login');
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove'];
    
    // Only start timer if user is logged in
    if (localStorage.getItem('userEmail')) {
      resetTimer();
      
      // Add event listeners for user activity
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  return null;
} 