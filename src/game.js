// Main game class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        // Set canvas size (internal resolution)
        this.canvas.width = 1200;
        this.canvas.height = 600;

        // Handle window resizing
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Game state
        this.state = 'READY'; // READY, POWER_SELECT, ANGLE_SELECT, SWINGING, FLYING, LANDED
        this.paused = false;

        // Initialize systems
        this.parallax = new ParallaxBackground(this.canvas);
        this.sprites = new Sprites(this.ctx);
        this.powerBar = new PowerBar(this.canvas);
        this.angleIndicator = new AngleIndicator(this.canvas);
        this.physics = new Physics();
        this.scoring = new Scoring();
        this.audio = new AudioManager();
        this.ui = new UI(this.audio);
        this.ui.setRestartHandler(() => this.restartGame());
        this.ui.setPauseHandler(() => this.togglePause());
        this.input = new InputHandler(this.canvas, this);
        this.camera = new CameraManager();
        this.minimap = new MinimapRenderer(this.canvas);

        // Game objects
        this.elbro = {
            x: 200,
            y: this.canvas.height - 185, // Ground level - elbro height
            animationFrame: 0
        };

        this.potato = {
            x: 280,  // Closer to elbro (was 350)
            y: this.canvas.height - 120, // Ground level - potato height
            startX: 280,
            gliding: false
        };

        this.club = {
            x: this.elbro.x + 60,
            y: this.elbro.y - 10,
            rotation: 0
        };

        this.groundY = this.canvas.height - 120;

        // Timing
        this.lastTime = performance.now();

        // Fullscreen tracking
        this.fullscreenRequested = false;

        // Initialize jump pads
        this.jumpPadManager = new JumpPadManager(this.potato.startX, this.groundY);

        // Mouse event listeners for gliding
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.physics.isPotatoFlying()) {
                this.potato.gliding = true;
                this.physics.potatoRotation = 0; // Face forward
                this.physics.potatoRotationVelocity = 0;
            }
        });
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.physics.isPotatoFlying()) {
                this.potato.gliding = false;
                this.audio.stopTap();
            }
        });

        // Touch event listeners for gliding
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            if (this.physics.isPotatoFlying()) {
                this.potato.gliding = true;
                this.physics.potatoRotation = 0;
                this.physics.potatoRotationVelocity = 0;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            // e.preventDefault(); // usually not needed on touchend but safer
            if (this.physics.isPotatoFlying()) {
                this.potato.gliding = false;
                this.audio.stopTap();
            }
        }, { passive: false });

        // Start game loop
        this.ui.showMessage('Click to Start!', true);
        this.gameLoop();
    }

    handleClick() {
        if (this.state === 'READY') {
            this.startPowerSelect();
        } else if (this.state === 'POWER_SELECT') {
            this.lockPower();
        } else if (this.state === 'ANGLE_SELECT') {
            this.lockAngle();
        }

        // Only beep if we are in an interactive state for clicking
        if (['READY', 'POWER_SELECT', 'ANGLE_SELECT'].includes(this.state)) {
            this.audio.playSound('beepSound');
        }
        if (this.state === 'SWINGING') {
            this.audio.playSound('startSound');
        }
    }

    handleMessageClick() {
        if (this.state === 'READY' || this.state === 'LANDED') {
            this.reset();
            this.handleFullscreenPrompt().then(() => {
                this.startPowerSelect();
            });
        }
    }

    async handleFullscreenPrompt() {
        if (!this.fullscreenRequested) {
            const wantsFullscreen = await this.ui.showConfirm('Enable fullscreen?');
            if (wantsFullscreen) {
                this.ui.requestFullscreen();
            }
            this.fullscreenRequested = true;
        }
    }

    restartGame() {
        this.potato.gliding = false;
        this.audio.stopTap();
        this.reset();
        this.startPowerSelect();
    }

    togglePause() {
        this.paused = !this.paused;
        this.ui.updatePauseButton(this.paused);
        
        if (this.paused) {
            this.audio.setMuted(true);
        } else {
            this.audio.setMuted(false);
        }
    }

    startPowerSelect() {
        this.audio.startMusic();

        this.state = 'POWER_SELECT';
        this.powerBar.start();
        this.ui.hideMessage();
        this.gliding = false;
    }

    lockPower() {
        const power = this.powerBar.lock();
        this.state = 'ANGLE_SELECT';
        this.angleIndicator.start();
    }

    lockAngle() {
        const angle = this.angleIndicator.lock();
        const power = this.powerBar.getPower();
        this.powerBar.angle = angle;

        this.state = 'SWINGING';
        this.physics.startSwing(power, angle);
    }

    reset() {
        this.state = 'READY';
        this.potato.x = this.potato.startX;
        this.potato.y = this.groundY;
        this.physics.reset();
        this.scoring.reset();
        this.camera.reset();
        this.ui.hideMessage();
        this.ui.updateDistance(0);
    }

    update(deltaTime) {
        // Pause game if in portrait mode
        if (window.innerHeight > window.innerWidth) {
            //leave fullscreen
            document.exitFullscreen();
            return;
        }

        // Skip updates if paused
        if (this.paused) {
            return;
        }

        // Update animation frame
        this.elbro.animationFrame++;

        // Update parallax (only if not paused)
        this.parallax.update(deltaTime, this.potato.x);

        // Update based on state
        if (this.state === 'POWER_SELECT') {
            this.powerBar.update(deltaTime);
        } else if (this.state === 'ANGLE_SELECT') {
            this.angleIndicator.update(deltaTime);
        } else if (this.state === 'SWINGING' || this.state === 'FLYING') {
            // Update club
            const clubPos = this.physics.updateClub(
                deltaTime,
                this.elbro.x,
                this.elbro.y
            );
            this.club.x = clubPos.x;
            this.club.y = clubPos.y;
            this.club.rotation = clubPos.rotation || 0;

            // Check collision
            const clubTip = this.physics.getClubTip(this.club);
            if (this.physics.checkCollision(
                clubTip.x,
                clubTip.y,
                this.potato.x,
                this.potato.y
            )) {
                this.state = 'FLYING';
            }

            // Update potato if flying
            if (this.physics.isPotatoFlying()) {
                this.state = 'FLYING';
                const newPos = this.physics.updatePotato(
                    deltaTime,
                    { x: this.potato.x, y: this.potato.y },
                    this.groundY
                );
                this.potato.x = newPos.x;
                this.potato.y = newPos.y;

                // Update camera to follow potato
                this.camera.update(this.potato.x);

                // Update distance
                this.scoring.updateDistance(this.potato.x, this.potato.startX);
                this.ui.updateDistance(this.scoring.getCurrentDistance());
                this.ui.updateHighscore(this.scoring.getHighscore());

                // Check if landed
                if (!this.physics.isPotatoFlying() && this.state === 'FLYING') {
                    this.state = 'LANDED';
                    this.showResults();
                }
            }
        }

        // Gliding physics
        if (this.potato.gliding && this.physics.isPotatoFlying()) {
            this.physics.gravity = 120; // Increase gravity for less powerful glide
            this.physics.airResistance = 0.997; // More air resistance for less powerful glide
            this.physics.potatoRotation = -0.6; // Angle to the right while gliding
            this.physics.potatoRotationVelocity = 0;
            this.audio.tap();
        } else {
            this.physics.gravity = 600; // Normal gravity
            this.physics.airResistance = 0.995; // Normal air resistance
        }

        // Jump-pad collision and boost
        const collision = this.jumpPadManager.checkCollision(this.potato, this.physics);
        if (collision.collided) {
            // Play sound with speed-based pitch
            this.audio.recharge(collision.speed);

            // Stop gliding and trigger rotation
            this.potato.gliding = false;
            this.physics.potatoRotationVelocity = 2; // Resume rotation
        }

        // Bounce: stop gliding and trigger rotation
        if (
            this.potato.y >= this.groundY &&
            this.physics.isPotatoFlying() &&
            Math.abs(this.physics.potatoVelocity.y) > 50 &&
            this.potato.gliding
        ) {
            this.potato.gliding = false;
            this.physics.potatoRotationVelocity = 2; // Resume rotation (example value)
        }

        if (this.potato.y >= this.groundY && this.state === 'FLYING') {
            this.audio.playSound('bounceSound');
        }

        this.powerBar.update(deltaTime); // Always update powerBar for fade
    }

    showResults() {
        const distance = this.scoring.getCurrentDistance();
        const highscore = this.scoring.getHighscore();

        let message = `Distance: ${distance}m\n`;

        if (distance === highscore && distance > 0) {
            message += '🏆 NEW HIGHSCORE! 🏆\n';
        }

        message += 'Click to play again!';

        this.ui.showMessage(message, true);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context and apply camera
        this.ctx.save();
        this.ctx.translate(-this.camera.getX(), 0);

        // Render parallax background (ground now scrolls with camera)
        this.ctx.restore();
        this.parallax.render(this.camera.getX());
        this.ctx.save();
        this.ctx.translate(-this.camera.getX(), 0);

        // Render potato
        let potatoRotation = this.potato.gliding ? 1.2 : this.physics.getPotatoRotation();
        this.sprites.drawPotato(
            this.potato.x,
            this.potato.y,
            potatoRotation,
            this.potato.gliding
        );

        // Check if we should show the swing pose
        const useSwingPose = this.state === 'SWINGING' || this.state === 'FLYING' || this.state === 'LANDED';

        // Render elbro (pass useSwingPose)
        this.sprites.drawElbro(
            this.elbro.x,
            this.elbro.y,
            this.elbro.animationFrame,
            useSwingPose
        );

        // Render vector club only if we are animating it AND the swing image is NOT fulfilling that role
        // (i.e. if we are using the swing image, don't draw the separate club)
        // We can check if the sprite class has the image loaded
        const swingImageLoaded = this.sprites.elbroSwingImage && this.sprites.elbroSwingImage.complete && this.sprites.elbroSwingImage.naturalWidth > 0;

        if ((this.state === 'SWINGING' || this.state === 'FLYING') && !swingImageLoaded) {
            this.sprites.drawGolfClub(
                this.club.x,
                this.club.y,
                this.club.rotation
            );
        }

        // Restore context
        this.ctx.restore();

        // Render jump-pads
        this.jumpPadManager.render(this.ctx, this.camera.getX());

        // Save context again for UI elements
        this.ctx.save();

        // Restore context
        this.ctx.restore();

        // Render UI elements (no camera offset)
        this.powerBar.render();

        if (this.state === 'ANGLE_SELECT') {
            this.angleIndicator.render(
                this.elbro.x - this.camera.getX(),
                this.elbro.y
            );
        }

        // Render minimap
        this.minimap.render(this.ctx, this.camera.getX(), this.potato.x, this.jumpPadManager);

        // Render paused overlay
        if (this.paused) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Click ▶ to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.restore();
        }
    }

    resizeCanvas() {
        const aspectRatio = 1200 / 600;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const windowRatio = width / height;

        let finalWidth, finalHeight;

        if (windowRatio > aspectRatio) {
            // Window is wider than game, constrain by height
            finalHeight = height;
            finalWidth = height * aspectRatio;
        } else {
            // Window is narrower than game, constrain by width
            finalWidth = width;
            finalHeight = width / aspectRatio;
        }

        this.canvas.style.width = `${finalWidth}px`;
        this.canvas.style.height = `${finalHeight}px`;
    }

    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new Game();
});
