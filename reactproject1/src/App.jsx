// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const SQUARE_SIZE = 32;
const SPRITE_SIZE = SQUARE_SIZE / 2;

const App = () => {
    const [position, setPosition] = useState({ top: window.innerHeight / 2 - SQUARE_SIZE / 2, left: window.innerWidth / 2 - SQUARE_SIZE / 2 });
    const [spritePosition, setSpritePosition] = useState({ top: Math.random() * (window.innerHeight - SPRITE_SIZE), left: Math.random() * (window.innerWidth - SPRITE_SIZE) });

    const handleKeyDown = (event) => {
        const { key } = event;
        setPosition((prevPosition) => {
            let newPos = { ...prevPosition };
            switch (key) {
                case 'ArrowUp':
                    newPos.top = Math.max(newPos.top - 20, 0);
                    break;
                case 'ArrowDown':
                    newPos.top = Math.min(newPos.top + 20, window.innerHeight - SQUARE_SIZE);
                    break;
                case 'ArrowLeft':
                    newPos.left = Math.max(newPos.left - 20, 0);
                    break;
                case 'ArrowRight':
                    newPos.left = Math.min(newPos.left + 20, window.innerWidth - SQUARE_SIZE);
                    break;
                default:
                    return prevPosition;
            }
            return newPos;
        });
    };

    const handleTouchMove = (event) => {
        const touch = event.touches[0];
        const newLeft = Math.min(Math.max(touch.clientX - SQUARE_SIZE / 2, 0), window.innerWidth - SQUARE_SIZE);
        const newTop = Math.min(Math.max(touch.clientY - SQUARE_SIZE / 2, 0), window.innerHeight - SQUARE_SIZE);

        setPosition({ top: newTop, left: newLeft });
    };

    const moveSpriteRandomly = () => {
        setSpritePosition({
            top: Math.random() * (window.innerHeight - SPRITE_SIZE),
            left: Math.random() * (window.innerWidth - SPRITE_SIZE),
        });
    };

    const checkCollision = (mainPos, spritePos) => {
        const overlap = !(mainPos.left + SQUARE_SIZE < spritePos.left ||
            spritePos.left + SPRITE_SIZE < mainPos.left ||
            mainPos.top + SQUARE_SIZE < spritePos.top ||
            spritePos.top + SPRITE_SIZE < mainPos.top);

        if (overlap) {
            console.log('Collision detected!');
            // Handle the collision here
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setPosition((prevPos) => ({
                top: Math.min(prevPos.top, window.innerHeight - SQUARE_SIZE),
                left: Math.min(prevPos.left, window.innerWidth - SQUARE_SIZE),
            }));
            setSpritePosition((prevPos) => ({
                top: Math.min(prevPos.top, window.innerHeight - SPRITE_SIZE),
                left: Math.min(prevPos.left, window.innerWidth - SPRITE_SIZE),
            }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('resize', handleResize);

        const spriteInterval = setInterval(() => {
            moveSpriteRandomly();
            checkCollision(position, spritePosition);
        }, 1000);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
            clearInterval(spriteInterval);
        };
    }, [position, spritePosition]);

    return (
        <div className="container">
            <div
                className="square"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            ></div>
            <div
                className="sprite"
                style={{ top: `${spritePosition.top}px`, left: `${spritePosition.left}px` }}
            ></div>
        </div>
    );
};

export default App;
