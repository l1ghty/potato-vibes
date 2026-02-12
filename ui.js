// UI management
class UI {
    constructor(audioManager) {
        this.STORAGE_KEY = 'potatoVibesAudioSettings';
        this.distanceElement = document.getElementById('distance');
        this.highscoreElement = document.getElementById('highscore');
        this.messageElement = document.getElementById('game-message');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.helpOverlay = document.getElementById('help-overlay');
        this.volumePanel = document.getElementById('volume-panel');
        this.sfxVolumeSlider = document.getElementById('sfx-volume');
        this.musicVolumeSlider = document.getElementById('music-volume');
        this.sfxVolumeValue = document.getElementById('sfx-volume-value');
        this.musicVolumeValue = document.getElementById('music-volume-value');
        this.audioManager = audioManager;
        this.soundMuted = false;

        // Setup buttons
        this.setupFullscreenButton();
        this.setupSoundButton();
        this.setupVolumeControls();
        this.loadSoundSettings();
        this.setupHelpButton();

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('mozfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('MSFullscreenChange', () => this.updateFullscreenButton());
    }

    setupFullscreenButton() {
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    async requestFullscreen() {
        const elem = document.documentElement;
        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
        } catch (err) {
            console.log('Fullscreen request failed:', err);
        }
    }

    exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (err) {
            console.log('Exit fullscreen failed:', err);
        }
    }

    toggleFullscreen() {
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.requestFullscreen();
        }
    }

    isFullscreen() {
        return !!(document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement);
    }

    updateFullscreenButton() {
        if (this.isFullscreen()) {
            this.fullscreenBtn.classList.remove('hidden');
            this.fullscreenBtn.textContent = '⛶'; // Exit fullscreen icon
            this.fullscreenBtn.title = 'Exit Fullscreen';
        } else {
            this.fullscreenBtn.classList.add('hidden');
        }
    }

    setupSoundButton() {
        this.soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSound();
            this.showVolumePanel();
        });

        this.volumePanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
            if (!this.volumePanel.classList.contains('hidden') &&
                e.target !== this.soundBtn &&
                !this.volumePanel.contains(e.target)) {
                this.hideVolumePanel();
            }
        });
    }

    setupVolumeControls() {
        this.sfxVolumeSlider.value = String(this.audioManager.getSfxVolume());
        this.musicVolumeSlider.value = String(this.audioManager.getMusicVolume());

        this.updateVolumeLabel(this.sfxVolumeSlider, this.sfxVolumeValue);
        this.updateVolumeLabel(this.musicVolumeSlider, this.musicVolumeValue);

        this.sfxVolumeSlider.addEventListener('input', () => {
            const volume = Number(this.sfxVolumeSlider.value);
            this.audioManager.setSfxVolume(volume);
            this.updateVolumeLabel(this.sfxVolumeSlider, this.sfxVolumeValue);
            this.unmuteIfVolumeEnabled();
            this.saveSoundSettings();
        });

        this.musicVolumeSlider.addEventListener('input', () => {
            const volume = Number(this.musicVolumeSlider.value);
            this.audioManager.setMusicVolume(volume);
            this.updateVolumeLabel(this.musicVolumeSlider, this.musicVolumeValue);
            this.unmuteIfVolumeEnabled();
            this.saveSoundSettings();
        });
    }

    unmuteIfVolumeEnabled() {
        if (this.soundMuted &&
            (this.audioManager.getSfxVolume() > 0 || this.audioManager.getMusicVolume() > 0)) {
            this.setSoundMuted(false);
        }
    }

    updateVolumeLabel(slider, label) {
        label.textContent = Math.round(Number(slider.value) * 100) + '%';
    }

    setSoundMuted(muted) {
        this.soundMuted = muted;
        this.audioManager.setMuted(this.soundMuted);

        this.updateSoundButtonState();
        this.saveSoundSettings();
    }

    updateSoundButtonState() {
        if (this.soundMuted) {
            this.soundBtn.textContent = '🔇';
            this.soundBtn.classList.add('muted');
            this.soundBtn.title = 'Unmute Sound';
        } else {
            this.soundBtn.textContent = '🔊';
            this.soundBtn.classList.remove('muted');
            this.soundBtn.title = 'Mute Sound';
        }
    }

    toggleSound() {
        this.setSoundMuted(!this.soundMuted);
    }

    showVolumePanel() {
        this.volumePanel.classList.remove('hidden');
    }

    hideVolumePanel() {
        this.volumePanel.classList.add('hidden');
    }

    saveSoundSettings() {
        try {
            const settings = {
                muted: this.soundMuted,
                sfxVolume: Number(this.sfxVolumeSlider.value),
                musicVolume: Number(this.musicVolumeSlider.value)
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
        } catch (err) {
            console.log('Failed to save sound settings:', err);
        }
    }

    loadSoundSettings() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return;

            const settings = JSON.parse(raw);
            const sfxVolume = this.clampVolumeSetting(settings.sfxVolume, this.audioManager.getSfxVolume());
            const musicVolume = this.clampVolumeSetting(settings.musicVolume, this.audioManager.getMusicVolume());

            this.sfxVolumeSlider.value = String(sfxVolume);
            this.musicVolumeSlider.value = String(musicVolume);
            this.audioManager.setSfxVolume(sfxVolume);
            this.audioManager.setMusicVolume(musicVolume);
            this.updateVolumeLabel(this.sfxVolumeSlider, this.sfxVolumeValue);
            this.updateVolumeLabel(this.musicVolumeSlider, this.musicVolumeValue);

            this.setSoundMuted(Boolean(settings.muted));
        } catch (err) {
            console.log('Failed to load sound settings:', err);
        }
    }

    clampVolumeSetting(value, fallback) {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) return fallback;
        return Math.max(0, Math.min(1, parsed));
    }

    setupHelpButton() {
        this.helpBtn.addEventListener('click', () => {
            this.showHelp();
        });

        this.helpOverlay.addEventListener('click', () => {
            this.hideHelp();
        });
    }

    showHelp() {
        this.helpOverlay.classList.remove('hidden');
    }

    hideHelp() {
        this.helpOverlay.classList.add('hidden');
    }

    updateDistance(distance) {
        this.distanceElement.textContent = distance + 'm';
    }

    updateHighscore(highscore) {
        this.highscoreElement.textContent = highscore + 'm';
    }

    showMessage(message, clickable = false) {
        this.messageElement.textContent = message;
        this.messageElement.classList.remove('hidden');
        if (!clickable) {
            this.messageElement.style.cursor = 'default';
        } else {
            this.messageElement.style.cursor = 'pointer';
        }
    }

    hideMessage() {
        this.messageElement.classList.add('hidden');
    }

    getMessageElement() {
        return this.messageElement;
    }
}
