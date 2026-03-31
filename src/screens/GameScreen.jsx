/**
 * @file GameScreen.jsx
 * @description Game screen: Phaser canvas + React HUD overlay.
 */
import React, { useState } from 'react';
import PhaserGame from '../game/PhaserGame.jsx';
import HUD from '../components/HUD.jsx';
import EventFeed from '../components/EventFeed.jsx';
import PowerUpNotification from '../components/PowerUpNotification.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function GameScreen() {
    const [phaserLoaded, setPhaserLoaded] = useState(false);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            {/* Phaser canvas fills viewport */}
            <PhaserGame onLoaded={() => setPhaserLoaded(true)} />

            {/* Loading overlay */}
            {!phaserLoaded && <LoadingSpinner message="GENERATING MAP..." />}

            {/* HUD */}
            {phaserLoaded && <HUD />}

            {/* Event feed (bottom left) */}
            {phaserLoaded && <EventFeed />}

            {/* Power-up notifications (right side, slide in) */}
            {phaserLoaded && <PowerUpNotification />}
        </div>
    );
}
