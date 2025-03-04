import { useState, useEffect } from 'react';

const useDrag = (initialPosition = { x: 0, y: 0 }) => {
    const [position, setPosition] = useState(initialPosition);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const buttonSize = 50; // Adjust this to match the button size
    const padding = 5;
    const Rightpadding = 90; // Margin from edges

    // ✅ Detect screen size for responsiveness
    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 1024);

            // 🛠 Ensure button stays inside the viewport after resize
            setPosition((prev) => {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                let newX = prev.x;
                let newY = prev.y;

                // 🚫 Prevent button from going off the right edge
                if (newX + buttonSize > viewportWidth - Rightpadding) {
                    newX = viewportWidth - buttonSize - Rightpadding;
                }

                // 🚫 Prevent button from going off the bottom edge
                if (newY + buttonSize > viewportHeight - padding) {
                    newY = viewportHeight - buttonSize - padding;
                }

                return { x: newX, y: newY };
            });
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // ✅ Drag functionality with constraints
    const handleDrag = (e) => {
        if (e.cancelable) {
            e.preventDefault();
        }

        const startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        const initialX = position.x;
        const initialY = position.y;

        const handleMove = (e) => {
            const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

            let newX = initialX + (currentX - startX);
            let newY = initialY + (currentY - startY);

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // 🚫 Prevent going off-screen (Left, Right, Top, Bottom)
            if (newX < padding) newX = padding; // Prevent left overflow
            if (newX + buttonSize > viewportWidth - Rightpadding) newX = viewportWidth - buttonSize - Rightpadding; // Prevent right overflow
            if (newY < padding) newY = padding; // Prevent top overflow
            if (newY + buttonSize > viewportHeight - padding) newY = viewportHeight - buttonSize - padding; // Prevent bottom overflow

            setPosition({ x: newX, y: newY });
        };

        const handleEnd = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('touchmove', handleMove, { passive: false });
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchend', handleEnd);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);
    };

    // ✅ Button Style for dragging
    const buttonStyle = {
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: 'fixed',
        zIndex: 1000,
        cursor: 'grab',
        padding: '16px',
        willChange: 'transform',
        transition: 'none',
    };

    return {
        buttonStyle,
        onMouseDown: handleDrag,
        onTouchStart: handleDrag,
        isSmallScreen,
    };
};

export default useDrag;
