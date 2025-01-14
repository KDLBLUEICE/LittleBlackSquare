// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const SQUARE_SIZE = 32;

const App = () => {
  const [position, setPosition] = useState({ top: 50, left: 50 });

  const handleKeyDown = (event) => {
    const { key } = event;
    setPosition((prevPosition) => {
      let newPos = { ...prevPosition };
      switch (key) {
        case 'ArrowUp':
          newPos.top = Math.max(newPos.top - 10, 0);
          break;
        case 'ArrowDown':
          newPos.top = Math.min(newPos.top + 10, window.innerHeight - SQUARE_SIZE);
          break;
        case 'ArrowLeft':
          newPos.left = Math.max(newPos.left - 10, 0);
          break;
        case 'ArrowRight':
          newPos.left = Math.min(newPos.left + 10, window.innerWidth - SQUARE_SIZE);
          break;
        default:
          return prevPosition;
      }
      return newPos;
    });
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    const newLeft = touch.clientX - SQUARE_SIZE / 2;
    const newTop = touch.clientY - SQUARE_SIZE / 2;

    setPosition({
      top: Math.min(Math.max(newTop, 0), window.innerHeight - SQUARE_SIZE),
      left: Math.min(Math.max(newLeft, 0), window.innerWidth - SQUARE_SIZE),
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="container">
      <div
        className="square"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      ></div>
    </div>
  );
};

export default App;
