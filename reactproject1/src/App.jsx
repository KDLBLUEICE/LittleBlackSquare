import { useState, useEffect, useRef } from 'react';
import './App.css';

const SQUARE_SIZE = 32;
const SPRITE_SIZE = 16;
const MOVE_DISTANCE = 100;
const SPEED = 10; // Speed in pixels per second
const randomInterval = () => Math.random() * (2000 - 200) + 200;

const App = () => {
    const [playerPos, setPlayerPos] = useState({ x: 100, y: 100 });
    const [spritePos, setSpritePos] = useState({
        top: Math.random() * (window.innerHeight - SPRITE_SIZE),
        left: Math.random() * (window.innerWidth - SPRITE_SIZE)
    });
    const [score, setScore] = useState(0);
    const playerRef = useRef(null);
    const spriteMoveTimeout = useRef(null);
    const [targetPosition, setTargetPosition] = useState(spritePos);
    const [lastMoveTime, setLastMoveTime] = useState(Date.now());

    const handleMouseMove = (e) => {
        const rect = playerRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left - 16;
        let y = e.clientY - rect.top - 16;

        // Ensure the player stays within bounds
        x = Math.max(0, Math.min(x, window.innerWidth - 32));
        y = Math.max(0, Math.min(y, window.innerHeight - 32));

        setPlayerPos({ x, y });
    };

    const handleTouchMove = (e) => {
        const rect = playerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        let x = touch.clientX - rect.left - 16;
        let y = touch.clientY - rect.top - 16;

        // Ensure the player stays within bounds
        x = Math.max(0, Math.min(x, window.innerWidth - 32));
        y = Math.max(0, Math.min(y, window.innerHeight - 32));

        setPlayerPos({ x, y });
    };

    const checkCollision = () => {
        const stationarySprite = { x: spritePos.left, y: spritePos.top, size: SPRITE_SIZE };
        const player = { x: playerPos.x, y: playerPos.y, size: SQUARE_SIZE };

        if (
            player.x < stationarySprite.x + stationarySprite.size &&
            player.x + player.size > stationarySprite.x &&
            player.y < stationarySprite.y + stationarySprite.size &&
            player.y + player.size > stationarySprite.y
        ) {
            setScore(score + 1);
        }
    };

    const moveSpriteRandomly = () => {
        const possibleMoves = [
            { top: spritePos.top - MOVE_DISTANCE, left: spritePos.left },
            { top: spritePos.top + MOVE_DISTANCE, left: spritePos.left },
            { top: spritePos.top, left: spritePos.left - MOVE_DISTANCE },
            { top: spritePos.top, left: spritePos.left + MOVE_DISTANCE }
        ];

        const validMoves = possibleMoves.filter(({ top, left }) =>
            top >= 0 && top <= Math.max(0, window.innerHeight - SPRITE_SIZE) &&
            left >= 0 && left <= Math.max(0, window.innerWidth - SPRITE_SIZE)
        );

        if (validMoves.length === 0) {
            return;
        }

        const newPosition = validMoves[Math.floor(Math.random() * validMoves.length)];
        setTargetPosition(newPosition);
        setLastMoveTime(Date.now());
        startSpriteMoveTimer();
    };

    const startSpriteMoveTimer = () => {
        clearTimeout(spriteMoveTimeout.current);
        const interval = randomInterval();
        const elapsedTime = Date.now() - lastMoveTime;
        const adjustedInterval = Math.max(interval - elapsedTime, 0);

        spriteMoveTimeout.current = setTimeout(() => {
            moveSpriteRandomly();
        }, adjustedInterval);
    };

    useEffect(() => {
        checkCollision();
    }, [playerPos, spritePos]);

    useEffect(() => {
        const handleResize = () => {
            setPlayerPos((prevPos) => ({
                x: Math.min(prevPos.x, window.innerWidth - 32),
                y: Math.min(prevPos.y, window.innerHeight - 32)
            }));
            setSpritePos((prevPos) => ({
                top: Math.min(prevPos.top, window.innerHeight - SPRITE_SIZE),
                left: Math.min(prevPos.left, window.innerWidth - SPRITE_SIZE)
            }));
        };

        window.addEventListener('resize', handleResize);

        const animationLoop = () => {
            const distanceX = targetPosition.left - spritePos.left;
            const distanceY = targetPosition.top - spritePos.top;
            const distance = Math.hypot(distanceX, distanceY);

            if (distance > 1) {
                const directionX = distanceX / distance;
                const directionY = distanceY / distance;
                const moveDistance = SPEED * (Date.now() - lastMoveTime) / 1000;

                setSpritePos((prevPos) => {
                    const newLeft = Math.min(Math.max(prevPos.left + directionX * moveDistance, 0), window.innerWidth - SPRITE_SIZE);
                    const newTop = Math.min(Math.max(prevPos.top + directionY * moveDistance, 0), window.innerHeight - SPRITE_SIZE);

                    return { left: newLeft, top: newTop };
                });

                setLastMoveTime(Date.now());
            }

            requestAnimationFrame(animationLoop);
        };

        startSpriteMoveTimer();
        requestAnimationFrame(animationLoop);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(spriteMoveTimeout.current);
        };
    }, [targetPosition, spritePos]);

    return (
        <div
            className="container"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            ref={playerRef}
        >
            <div className="sprite" style={{ left: spritePos.left, top: spritePos.top }} />
            <div className="player" style={{ left: playerPos.x, top: playerPos.y }} />
            <div className="score">Score: {score}</div>
        </div>
    );
};

export default App;