// UI management
class UI {
    constructor() {
        this.distanceElement = document.getElementById('distance');
        this.highscoreElement = document.getElementById('highscore');
        this.messageElement = document.getElementById('game-message');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');

        // Setup fullscreen button
        this.setupFullscreenButton();

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
