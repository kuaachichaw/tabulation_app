import React, { useEffect } from 'react';

const FullscreenImageModal = ({ imageUrl, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 opacity-100"
            onClick={onClose}
        >
            <div
                className="relative"
                onClick={(e) => e.stopPropagation()} 
            >
                <img
                    src={imageUrl}
                    alt="Fullscreen"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
                <button
                    className="absolute top-4 right-4 text-white text-2xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    X
                </button>
            </div>
        </div>
    );
};

export default FullscreenImageModal;
