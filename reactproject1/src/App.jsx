// src/App.jsx
import React, { useState } from 'react';
import './App.css';

// Size of the square
const SQUARE_SIZE = 32;

const App = () => {
    // Initial position of the square
    const [position, setPosition] = useState({ top: 50, left: 50 });

    // Function to handle key press
    const handleKeyDown = (event) => {
        const { key } = event;
        setPosition((prevPosition) => {
            switch (key) {
                case 'ArrowUp':
                    return { ...prevPosition, top: prevPosition.top - 10 };
                case 'ArrowDown':
                    return { ...prevPosition, top: prevPosition.top + 10 };
                case 'ArrowLeft':
                    return { ...prevPosition, left: prevPosition.left - 10 };
                case 'ArrowRight':
                    return { ...prevPosition, left: prevPosition.left + 10 };
                default:
                    return prevPosition;
            }
        });
    };

    // Add event listener for keydown event
    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
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
