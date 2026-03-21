/**
 * @file LoadingSpinner.jsx
 * @description Full screen loading state while Phaser assets preload.
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
            <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
                💣
            </motion.div>
            <p className="text-orange-400 text-lg font-bold tracking-widest">{message}</p>
            <div className="mt-4 flex gap-1">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-orange-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </div>
        </div>
    );
}
