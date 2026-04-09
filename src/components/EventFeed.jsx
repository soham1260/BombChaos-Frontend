import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore.js';

export default function EventFeed() {
    const { eventFeed } = useGameStore();

    return (
        <div className="absolute left-4 bottom-20 z-40 flex flex-col-reverse gap-1 pointer-events-none w-72">
            <AnimatePresence>
                {eventFeed.map(({ id, text, color }) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="glass rounded-lg px-3 py-1 text-sm font-semibold"
                        style={{ color, borderLeft: `3px solid ${color}` }}
                    >
                        {text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
