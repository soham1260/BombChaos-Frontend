import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore.js';

const PU_INFO = {
    BOMB_UP: { icon: '💣', label: 'Bomb Up', color: '#f97316' },
    FIRE_UP: { icon: '🔥', label: 'Range Up', color: '#ef4444' },
    SPEED_UP: { icon: '⚡', label: 'Speed Up', color: '#38bdf8' },
    REMOTE_BOMB: { icon: '📡', label: 'Remote Bomb', color: '#a855f7' },
    BOMB_KICK: { icon: '🦵', label: 'Bomb Kick', color: '#eab308' },
    PIERCING_FLAME: { icon: '🔱', label: 'Piercing Flame', color: '#f43f5e' },
};

export default function PowerUpNotification() {
    const { powerupNotifications } = useGameStore();

    return (
        <div className="fixed right-4 top-24 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {powerupNotifications.map(({ id, type }) => {
                    const info = PU_INFO[type] || { icon: '✨', label: type, color: '#fff' };
                    return (
                        <motion.div
                            key={id}
                            initial={{ x: 120, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 120, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="glass rounded-xl px-4 py-2 flex items-center gap-3 border"
                            style={{ borderColor: info.color + '60' }}
                        >
                            <span className="text-2xl">{info.icon}</span>
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-widest">Power-Up!</div>
                                <div className="font-bold text-sm" style={{ color: info.color }}>{info.label}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
