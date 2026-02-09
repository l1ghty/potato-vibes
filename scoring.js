// Scoring system with distance tracking and highscore
class Scoring {
    constructor() {
        this.currentDistance = 0;
        this.highscore = this.loadHighscore();
        this.pixelsPerMeter = 20; // Corrected conversion factor
    }

    loadHighscore() {
        const saved = localStorage.getItem('yetisports_highscore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighscore() {
        localStorage.setItem('yetisports_highscore', this.highscore.toString());
    }

    updateDistance(penguinX, startX) {
        // Calculate distance in meters
        const pixelDistance = Math.max(0, penguinX - startX);
        this.currentDistance = Math.round(pixelDistance / this.pixelsPerMeter);

        // Update highscore
        if (this.currentDistance > this.highscore) {
            this.highscore = this.currentDistance;
            this.saveHighscore();
        }

        return this.currentDistance;
    }

    getCurrentDistance() {
        return this.currentDistance;
    }

    getHighscore() {
        return this.highscore;
    }

    reset() {
        this.currentDistance = 0;
    }
}
