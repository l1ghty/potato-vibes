// Audio management for game sounds and music
class AudioManager {
    constructor() {
        this.musicVolume = 0.05;
        this.sfxVolume = 1;
        this.musicStarted = false;
        this.muted = false;
        this.tapOn = false;

        this.sounds = {
            bgMusic: { file: 'assets/Syn Cole - Feel Good.mp3', baseVolume: 0.1, isMusic: true },
            startSound: { file: 'assets/shoot.wav', baseVolume: 0.5 },
            beepSound: { file: 'assets/beep.wav', baseVolume: 0.1 },
            rechargeSound: { file: 'assets/recharge.wav', baseVolume: 0.1, preservesPitch: false },
            tapSound: { file: 'assets/ball-tap.wav', baseVolume: 0.1 },
            bounceSound: { file: 'assets/tac.wav', baseVolume: 0.5 },
        };

        for (const [name, config] of Object.entries(this.sounds)) {
            this[name] = new Audio(config.file);
            if (config.preservesPitch === false) {
                this[name].preservesPitch = false;
            }
            this[`${name}BaseVolume`] = config.baseVolume;
        }

        this.applyVolumeSettings();
    }

    clampVolume(volume) {
        return Math.max(0, Math.min(1, Number(volume)));
    }

    applyVolumeSettings() {
        for (const [name, config] of Object.entries(this.sounds)) {
            const gain = config.isMusic ? this.getMusicGain() : this.sfxVolume;
            this[name].volume = this[`${name}BaseVolume`] * gain;
        }
    }

    getMusicGain() {
        return Math.sqrt(this.musicVolume);
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

    playSound(soundName, { loop = false, onEnded = null } = {}) {
        if (this.muted) return;

        const sound = this[soundName];
        sound.loop = loop;
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed:", e));
        sound.onended = () => {
            sound.currentTime = 0;
            if (onEnded) onEnded();
        };
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
            this.bgMusic.loop = false;
            this.bgMusic.onended = () => {
                this.bgMusic.currentTime = 0;
                this.musicStarted = false;
            };
            this.bgMusic.play().catch(e => console.log("Audio play failed:", e));
            this.musicStarted = true;
        }
    }

    start() {
        this.playSound('startSound');
    }

    beep() {
        this.playSound('beepSound');
    }

    bounce() {
        this.playSound('bounceSound');
    }

    recharge(speed = 1000) {
        if (this.muted) return;

        const pitch = Math.max(0.5, Math.min(2.0, 0.5 + (speed / 1500)));
        this.rechargeSound.playbackRate = pitch;
        this.rechargeSound.currentTime = 0;
        this.rechargeSound.play().catch(e => console.log("Audio play failed:", e));
    }

    tap() {
        if (this.tapOn) return;
        this.tapOn = true;
        this.playSound('tapSound');
    }

    stopTap() {
        this.tapOn = false;
    }
}
