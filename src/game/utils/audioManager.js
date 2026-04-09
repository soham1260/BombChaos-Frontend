
let lobbyAudio = null;
let _wantLobbyMusic = false; 

let _muted = localStorage.getItem('music_muted') === 'true';


function _onFirstInteraction() {
    document.removeEventListener('click', _onFirstInteraction, true);
    document.removeEventListener('keydown', _onFirstInteraction, true);
    if (_wantLobbyMusic && !_muted) {
        audioManager.startLobbyMusic();
    }
}

export const audioManager = {
    startLobbyMusic() {
        _wantLobbyMusic = true;

        if (_muted) return;

        if (lobbyAudio) return; // already playing

        document.addEventListener('click', _onFirstInteraction, true);
        document.addEventListener('keydown', _onFirstInteraction, true);

        try {
            lobbyAudio = new Audio('/assets/sounds/lobby_bg.wav');
            lobbyAudio.loop = true;
            lobbyAudio.volume = 0.3;
            lobbyAudio.play().catch(() => {
                lobbyAudio = null;
            });
        } catch {
            lobbyAudio = null;
        }
    },

    stopLobbyMusic() {
        _wantLobbyMusic = false;
        // Remove the pending retry listener too
        document.removeEventListener('click', _onFirstInteraction, true);
        document.removeEventListener('keydown', _onFirstInteraction, true);

        if (!lobbyAudio) return;
        lobbyAudio.pause();
        lobbyAudio.src = '';
        lobbyAudio = null;
    },

    setMuted(muted) {
        _muted = muted;
        if (muted) {
            // Pause (not destroy) so we can resume seamlessly
            if (lobbyAudio) {
                lobbyAudio.pause();
            }
        } else {
            // Resume existing instance or create a new one
            if (lobbyAudio) {
                lobbyAudio.play().catch(() => { lobbyAudio = null; });
            } else if (_wantLobbyMusic) {
                audioManager.startLobbyMusic();
            }
        }
    },

    isMuted() {
        return _muted;
    },
};
