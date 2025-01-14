// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';



const SQUARE_SIZE = 32;
const SPRITE_SIZE = SQUARE_SIZE / 2;

const App = () => {
    const [position, setPosition] = useState({ top: window.innerHeight / 2 - SQUARE_SIZE / 2, left: window.innerWidth / 2 - SQUARE_SIZE / 2 });
    const [spritePosition, setSpritePosition] = useState({ top: Math.random() * (window.innerHeight - SPRITE_SIZE), left: Math.random() * (window.innerWidth - SPRITE_SIZE) });
    const [score, setScore] = useState(0);

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

    const handleMouseMove = (event) => {
        const newLeft = Math.min(Math.max(event.clientX - SQUARE_SIZE / 2, 0), window.innerWidth - SQUARE_SIZE);
        const newTop = Math.min(Math.max(event.clientY - SQUARE_SIZE / 2, 0), window.innerHeight - SQUARE_SIZE);

        setPosition({
            top: newTop,
            left: newLeft,
        });
    };

    const moveSpriteRandomly = () => {
        setSpritePosition({
            top: Math.random() * (window.innerHeight - SPRITE_SIZE),
            left: Math.random() * (window.innerWidth - SPRITE_SIZE),
        });
    };

    const checkCollision = () => {
        const mainPos = { x: position.left, y: position.top };
        const spritePos = { x: spritePosition.left, y: spritePosition.top };

        const mainBoid = {
            pos: mainPos,
            vel: { x: 0, y: 0 },
            radius: SQUARE_SIZE / 2,
            speed: 0,
            colourHEX: "#000",
            collisionCoolDownSeconds: 0,
        };
        const spriteBoid = {
            pos: spritePos,
            vel: { x: 0, y: 0 },
            radius: SPRITE_SIZE / 2,
            speed: 0,
            colourHEX: "#000",
            collisionCoolDownSeconds: 0,
        };

        let collisionResult = generateCollisionBouncePair(mainBoid, spriteBoid);

        if (collisionResult) {
            console.log('Collision detected!');
            setScore((prevScore) => prevScore + 1);
            const [mainCollisionResult, spriteCollisionResult] = collisionResult;

            setPosition({
                top: mainCollisionResult.newPos.y,
                left: mainCollisionResult.newPos.x,
            });
            setSpritePosition({
                top: spriteCollisionResult.newPos.y,
                left: spriteCollisionResult.newPos.x,
            });
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
        window.addEventListener('mousemove', handleMouseMove); // Add mouse move listener

        const spriteInterval = setInterval(() => {
            moveSpriteRandomly();
            checkCollision(position, spritePosition);
        }, 1000);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove); // Clean up mouse move listener
            clearInterval(spriteInterval);
        };
    }, [position, spritePosition]);

    return (
        <div className="container">
            <div className="score">{`Score: ${score}`}</div>
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
