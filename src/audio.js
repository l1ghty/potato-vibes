// Audio management for game sounds and music
class AudioManager {
    constructor() {
        this.musicVolume = 0.05;
        this.sfxVolume = 1;

        // Background music
        this.bgMusic = new Audio('assets/Syn Cole - Feel Good.mp3');
        this.bgMusicBaseVolume = 1;
        this.musicStarted = false;

        // Sound effects
        this.startSound = new Audio('assets/shoot.wav');
        this.startSoundBaseVolume = 0.5;

        this.beepSound = new Audio('assets/beep.wav');
        this.beepSoundBaseVolume = 0.1;

        this.rechargeSound = new Audio('assets/recharge.wav');
        this.rechargeSoundBaseVolume = 0.1;
        this.rechargeSound.preservesPitch = false;

        this.tapSound = new Audio('assets/ball-tap.wav');
        this.tapSoundBaseVolume = 0.1;

        this.bounceSound = new Audio('assets/tac.wav');
        this.bounceSoundBaseVolume = 0.5;

        this.tapOn = false;
        this.muted = false;

        this.applyVolumeSettings();
    }

    clampVolume(volume) {
        return Math.max(0, Math.min(1, Number(volume)));
    }

    applyVolumeSettings() {
        this.bgMusic.volume = this.bgMusicBaseVolume * this.musicVolume;
        this.startSound.volume = this.startSoundBaseVolume * this.sfxVolume;
        this.beepSound.volume = this.beepSoundBaseVolume * this.sfxVolume;
        this.rechargeSound.volume = this.rechargeSoundBaseVolume * this.sfxVolume;
        this.tapSound.volume = this.tapSoundBaseVolume * this.sfxVolume;
        this.bounceSound.volume = this.bounceSoundBaseVolume * this.sfxVolume;
    }

    setMusicVolume(volume) {
        this.musicVolume = this.clampVolume(volume);
        this.applyVolumeSettings();
    }

    setSfxVolume(volume) {
        this.sfxVolume = this.clampVolume(volume);
        this.applyVolumeSettings();
    }

    getMusicVolume() {
        return this.musicVolume;
    }

    getSfxVolume() {
        return this.sfxVolume;
    }

    setMuted(muted) {
        this.muted = muted;
        if (muted) {
            this.bgMusic.pause();
            this.beepSound.pause();
            this.rechargeSound.pause();
            this.tapSound.pause();
        } else if (this.musicStarted && this.musicVolume > 0) {
            this.bgMusic.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    startMusic() {
        if (!this.musicStarted && !this.muted && this.musicVolume > 0) {
            this.bgMusic.play().catch(e => console.log("Audio play failed:", e));
            this.bgMusic.loop = false;
            this.bgMusic.onended = () => {
                this.bgMusic.currentTime = 0;
                this.musicStarted = false;
            };
            this.musicStarted = true;
        }
    }

    start() {
        if (this.muted) return;
        this.startSound.play().catch(e => console.log("Audio play failed:", e));
        this.startSound.onended = () => {
            this.startSound.currentTime = 0;
        };
    }

    beep() {
        if (this.muted) return;
        this.beepSound.play().catch(e => console.log("Audio play failed:", e));
        this.beepSound.onended = () => {
            this.beepSound.currentTime = 0;
        };
    }
    bounce() {
        if (this.muted) return;
        this.bounceSound.play().catch(e => console.log("Audio play failed:", e));
        this.bounceSound.onended = () => {
            this.bounceSound.currentTime = 0;
        };
    }

    recharge(speed = 1000) {
        if (this.muted) return;
        // Map speed to pitch (0.5 to 2.0 range)
        // Base speed around 1000 gives normal pitch ~1.0
        let pitch = 0.5 + (speed / 1500);
        pitch = Math.max(0.5, Math.min(2.0, pitch)); // Clamp between 0.5 and 2.0

        this.rechargeSound.playbackRate = pitch;
        this.rechargeSound.currentTime = 0; // Reset time to ensure it plays from start
        this.rechargeSound.play().catch(e => console.log("Audio play failed:", e));
    }

    tap() {
        if (this.muted) return;
        if (this.tapOn) {
            return;
        }
        this.tapOn = true;
        this.tapSound.play().catch(e => console.log("Audio play failed:", e));
        this.tapSound.loop = false;
        this.tapSound.onended = () => {
            this.tapSound.currentTime = 0;
        };
    }

    stopTap() {
        this.tapOn = false;
    }
}
