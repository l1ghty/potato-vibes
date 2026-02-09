// Input handling system
class InputHandler {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.setupListeners();
    }

    setupListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Also listen to message element for restart
        const messageElement = document.getElementById('game-message');
        messageElement.addEventListener('click', () => this.handleMessageClick());

        // Keyboard listener for spacebar
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.game.handleSpacebar();
            }
        });
    }

    handleClick(e) {
        this.game.handleClick();
    }

    handleMessageClick() {
        this.game.handleMessageClick();
    }
}
