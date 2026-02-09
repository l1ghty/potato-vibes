// UI management
class UI {
    constructor() {
        this.distanceElement = document.getElementById('distance');
        this.highscoreElement = document.getElementById('highscore');
        this.messageElement = document.getElementById('game-message');
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
