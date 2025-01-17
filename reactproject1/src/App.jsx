import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const SQUARE_SIZE = 32;
const SPRITE_SIZE = 16;
const MOVE_DISTANCE = 10; // Reduce the move distance for smoother movement
const SPEED = 10; // Speed in pixels per second
const ORBIT_SPEED = 2 * Math.PI; // Orbit speed in radians per second (20 RPM)
const randomInterval = () => Math.random() * (2000 - 200) + 200;

const App = () => {
    const [playerPos, setPlayerPos] = useState({ x: 100, y: 100 });
    const [spritePos, setSpritePos] = useState({
        top: Math.random() * (window.innerHeight - SPRITE_SIZE),
        left: Math.random() * (window.innerWidth - SPRITE_SIZE)
    });
    const [score, setScore] = useState(0);
    const [explosions, setExplosions] = useState([]);
    const [showTitleScreen, setShowTitleScreen] = useState(true);
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [angle, setAngle] = useState(0);
    const playerRef = useRef(null);
    const spriteMoveTimeout = useRef(null);
    const [targetPosition, setTargetPosition] = useState(spritePos);
    const [lastMoveTime, setLastMoveTime] = useState(Date.now());

    const handleMouseMove = (e) => {
        if (showTitleScreen) return;
        const rect = playerRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left - 16;
        let y = e.clientY - rect.top - 16;

        // Ensure the player stays within bounds
        x = Math.max(0, Math.min(x, window.innerWidth - 32));
        y = Math.max(0, Math.min(y, window.innerHeight - 32));

        setPlayerPos({ x, y });
    };

    const handleTouchMove = (e) => {
        if (showTitleScreen) return;
        const rect = playerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        let x = touch.clientX - rect.left - 16;
        let y = touch.clientY - rect.top - 16;

        // Ensure the player stays within bounds
        x = Math.max(0, Math.min(x, window.innerWidth - 32));
        y = Math.max(0, Math.min(y, window.innerHeight - 32));

        setPlayerPos({ x, y });
    };

    const checkCollision = useCallback(() => {
        const stationarySprite = { x: spritePos.left, y: spritePos.top, size: SPRITE_SIZE };
        const player = { x: playerPos.x, y: playerPos.y, size: SQUARE_SIZE };

        if (
            player.x < stationarySprite.x + stationarySprite.size &&
            player.x + player.size > stationarySprite.x &&
            player.y < stationarySprite.y + stationarySprite.size &&
            player.y + player.size > stationarySprite.y
        ) {
            setScore(prevScore => {
                const newScore = prevScore + 1;

                // Add explosion animation
                const explosionParticles = [];
                const numParticles = Math.min(16 + newScore, 25);
                for (let i = 0; i < numParticles; i++) {
                    const angle = (i / numParticles) * 2 * Math.PI;
                    explosionParticles.push({ x: playerPos.x, y: playerPos.y, angle, id: Date.now() + i });
                }
                setExplosions(prevExplosions => [...prevExplosions, ...explosionParticles]);

                // Set sprite to orbit at 100 score
                if (newScore >= 100) {
                    setIsOrbiting(true);
                }

                return newScore;
            });

            if (!isOrbiting) {
                // Smoothly move the sprite away from the player
                const deltaX = playerPos.x - spritePos.left;
                const deltaY = playerPos.y - spritePos.top;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const moveX = (deltaX / distance) * MOVE_DISTANCE;
                const moveY = (deltaY / distance) * MOVE_DISTANCE;

                setSpritePos((prevPos) => ({
                    left: Math.max(0, Math.min(prevPos.left - moveX, window.innerWidth - SPRITE_SIZE)),
                    top: Math.max(0, Math.min(prevPos.top - moveY, window.innerHeight - SPRITE_SIZE))
                }));
            }
        }
    }, [playerPos, spritePos, isOrbiting]);

    const moveSpriteRandomly = useCallback(() => {
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

        const newPosition = validMoves[Math.floor(Math.random() * validMoves.length)];
        setTargetPosition(newPosition);
        setLastMoveTime(Date.now());
        startSpriteMoveTimer();
    }, [spritePos]);

    const startSpriteMoveTimer = useCallback(() => {
        clearTimeout(spriteMoveTimeout.current);
        const interval = randomInterval();
        const elapsedTime = Date.now() - lastMoveTime;
        const adjustedInterval = Math.max(interval - elapsedTime, 0);

        spriteMoveTimeout.current = setTimeout(() => {
            moveSpriteRandomly();
        }, adjustedInterval);
    }, [lastMoveTime, moveSpriteRandomly]);

    useEffect(() => {
        checkCollision();
    }, [playerPos, spritePos, checkCollision]);

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
            if (isOrbiting) {
                const radius = 50; // Orbit radius in pixels
                const elapsedTime = (Date.now() - lastMoveTime) / 1000; // Elapsed time in seconds
                const newAngle = angle + ORBIT_SPEED * elapsedTime;

                const newLeft = playerPos.x + radius * Math.cos(newAngle) - SPRITE_SIZE / 2;
                const newTop = playerPos.y + radius * Math.sin(newAngle) - SPRITE_SIZE / 2;

                setSpritePos({ left: newLeft, top: newTop });
                setAngle(newAngle);
                setLastMoveTime(Date.now());
            } else {
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
            }

            requestAnimationFrame(animationLoop);
        };

        startSpriteMoveTimer();
        requestAnimationFrame(animationLoop);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(spriteMoveTimeout.current);
        };
    }, [targetPosition, spritePos, startSpriteMoveTimer, lastMoveTime, playerPos, isOrbiting, angle]);

    // Remove old explosions
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setExplosions(prevExplosions => prevExplosions.filter(explosion => now - explosion.id < 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleStartClick = () => {
        setShowTitleScreen(false);
    };

    return (
        <div
            className="container"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onClick={handleStartClick}
            ref={playerRef}
        >
            <div className={`popup ${showTitleScreen ? 'show' : ''}`}>
                <h1>Little Black Square</h1>
                <p>by KDLBLUEICE</p>
                <p>Click anywhere to start</p>
            </div>
            <div className={`game-content ${showTitleScreen ? 'hidden' : 'show'}`}>
                <div className="sprite" style={{ left: spritePos.left, top: spritePos.top }} />
                <div className="player" style={{ left: playerPos.x, top: playerPos.y }} />
                <div className="score">Score: {score}</div>
                {explosions.map(explosion => (
                    <div
                        key={explosion.id}
                        className="explosion"
                        style={{
                            left: explosion.x,
                            top: explosion.y,
                            animationDelay: `${(explosion.id % 16) * 0.05}s`,
                            transform: `translate(${16 * Math.cos(explosion.angle)}px, ${16 * Math.sin(explosion.angle)}px)`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
export default App;