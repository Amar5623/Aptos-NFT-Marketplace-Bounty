import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    endTime: number;
    onEnd?: () => void;
    type: 'offer' | 'auction'; 
  }
  
  const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onEnd, type }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
  
    useEffect(() => {
      const calculateTimeLeft = () => {
        console.log('Timestamp Debug:', {
            currentTimestamp: Math.floor(Date.now() / 1000),
            providedEndTime: endTime,
            difference: endTime - Math.floor(Date.now() / 1000),
            endTimeReadable: new Date(endTime * 1000).toLocaleString()
          });
          
        const now = Math.floor(Date.now() / 1000);
        const remaining = endTime - now;

        console.log('CountdownTimer calculation:', {
            now,
            endTime,
            remaining,
            readableEndTime: new Date(endTime * 1000).toLocaleString()
          });
  
        if (!endTime || endTime === 0) {
          return 'Invalid Time';
        }
  
        if (remaining <= 0) {
          if (onEnd) onEnd();
          return type === 'offer' ? 'Offer Expired' : 'Auction Ended';
        }
  
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
  
        if (days > 0) {
          return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
          return `${hours}h ${minutes}m ${seconds}s`;
        } else {
          return `${minutes}m ${seconds}s`;
        }
      };
  
      const initialTimeLeft = calculateTimeLeft();
      setTimeLeft(initialTimeLeft);
  
      const timer = setInterval(() => {
        const timeLeft = calculateTimeLeft();
        setTimeLeft(timeLeft);
      }, 1000);

      
  
      return () => clearInterval(timer);
    }, [endTime, onEnd, type]);
  
  
    return (
      <span style={{ 
        color: timeLeft.includes('Expired') || timeLeft.includes('Ended') ? '#ff4d4f' : '#52c41a',
        fontWeight: 'bold'
      }}>
        {timeLeft}
      </span>
    );
  };

  export default CountdownTimer;
  