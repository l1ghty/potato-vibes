// Audio management for game sounds and music
class AudioManager {
    constructor() {
        // Background music
        this.bgMusic = new Audio('assets/Syn Cole - Feel Good.mp3');
        this.bgMusic.volume = 0.1;
        this.musicStarted = false;

        // Sound effects
        this.beepSound = new Audio('assets/beep.wav');
        this.beepSound.volume = 0.1;

        this.rechargeSound = new Audio('assets/recharge.wav');
        this.rechargeSound.volume = 0.1;
        this.rechargeSound.preservesPitch = false;

        this.tapSound = new Audio('assets/ball-tap.wav');
        this.tapSound.volume = 0.1;

        this.tapOn = false;
    }

    startMusic() {
        if (!this.musicStarted) {
            this.bgMusic.play().catch(e => console.log("Audio play failed:", e));
            this.bgMusic.loop = false;
            this.bgMusic.onended = () => {
                this.bgMusic.currentTime = 0;
                this.musicStarted = false;
            };
            this.musicStarted = true;
        }
    }

    beep() {
        this.beepSound.play().catch(e => console.log("Audio play failed:", e));
        this.beepSound.onended = () => {
            this.beepSound.currentTime = 0;
        };
    }

    recharge(speed = 1000) {
        // Map speed to pitch (0.5 to 2.0 range)
        // Base speed around 1000 gives normal pitch ~1.0
        let pitch = 0.5 + (speed / 1500);
        pitch = Math.max(0.5, Math.min(2.0, pitch)); // Clamp between 0.5 and 2.0

        this.rechargeSound.playbackRate = pitch;
        this.rechargeSound.currentTime = 0; // Reset time to ensure it plays from start
        this.rechargeSound.play().catch(e => console.log("Audio play failed:", e));
    }

    tap() {
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
