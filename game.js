// Main game class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = 1200;
        this.canvas.height = 600;

        // Game state
        this.state = 'READY'; // READY, POWER_SELECT, ANGLE_SELECT, SWINGING, FLYING, LANDED

        // Initialize systems
        this.parallax = new ParallaxBackground(this.canvas);
        this.sprites = new Sprites(this.ctx);
        this.powerBar = new PowerBar(this.canvas);
        this.angleIndicator = new AngleIndicator(this.canvas);
        this.physics = new Physics();
        this.scoring = new Scoring();
        this.ui = new UI();
        this.input = new InputHandler(this.canvas, this);

        // Game objects
        this.yeti = {
            x: 200,
            y: this.canvas.height - 185, // Ground level - yeti height
            animationFrame: 0
        };

        this.penguin = {
            x: 280,  // Closer to yeti (was 350)
            y: this.canvas.height - 120, // Ground level - penguin height
            startX: 280,
            gliding: false
        };

        this.club = {
            x: this.yeti.x + 60,
            y: this.yeti.y - 10,
            rotation: 0
        };

        this.groundY = this.canvas.height - 120;

        // Timing
        this.lastTime = performance.now();

        // Camera
        this.cameraX = 0;

        this.jumpPadIntervalPx = 100 * 20; // 100m * 20 pixels/m = 2000px
        this.jumpPads = [];
        // Place jump-pads for the course
        const powerBarWidth = 300;
        const powerBarHeight = 40;
        for (let i = 1; i <= 100; i++) {
            this.jumpPads.push({
                x: this.penguin.startX + i * this.jumpPadIntervalPx,
                y: this.groundY - powerBarHeight, // Pad bottom aligns with ground
                width: powerBarWidth,
                height: powerBarHeight
            });
        }

        // Mouse event listeners for gliding
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.physics.isPenguinFlying()) {
                this.penguin.gliding = true;
                this.physics.penguinRotation = 0; // Face forward
                this.physics.penguinRotationVelocity = 0;
            }
        });
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.physics.isPenguinFlying()) {
                this.penguin.gliding = false;
                // Optionally restore rotation velocity, or let physics handle
            }
        });

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
    }

    handleMessageClick() {
        if (this.state === 'READY' || this.state === 'LANDED') {
            this.reset();
            this.startPowerSelect();
        }
    }

    handleSpacebar() {
        if (this.physics.isPenguinFlying()) {
            this.penguin.gliding = !this.penguin.gliding;
        }
    }

    startPowerSelect() {
        this.state = 'POWER_SELECT';
        this.powerBar.start();
        this.ui.hideMessage();
    }

    lockPower() {
        const power = this.powerBar.lock();
        this.state = 'ANGLE_SELECT';
        this.angleIndicator.start();
    }

    lockAngle() {
        const angle = this.angleIndicator.lock();
        const power = this.powerBar.getPower();

        this.state = 'SWINGING';
        this.physics.startSwing(power, angle);
    }

    reset() {
        this.state = 'READY';
        this.penguin.x = this.penguin.startX;
        this.penguin.y = this.groundY;
        this.physics.reset();
        this.scoring.reset();
        this.cameraX = 0;
        this.ui.hideMessage();
        this.ui.updateDistance(0);
    }

    update(deltaTime) {
        // Update animation frame
        this.yeti.animationFrame++;

        // Update parallax
        this.parallax.update(deltaTime, this.penguin.x);

        // Update based on state
        if (this.state === 'POWER_SELECT') {
            this.powerBar.update(deltaTime);
        } else if (this.state === 'ANGLE_SELECT') {
            this.angleIndicator.update(deltaTime);
        } else if (this.state === 'SWINGING' || this.state === 'FLYING') {
            // Update club
            const clubPos = this.physics.updateClub(
                deltaTime,
                this.yeti.x,
                this.yeti.y
            );
            this.club.x = clubPos.x;
            this.club.y = clubPos.y;
            this.club.rotation = clubPos.rotation || 0;

            // Check collision
            const clubTip = this.physics.getClubTip(this.club);
            if (this.physics.checkCollision(
                clubTip.x,
                clubTip.y,
                this.penguin.x,
                this.penguin.y
            )) {
                this.state = 'FLYING';
            }

            // Update penguin if flying
            if (this.physics.isPenguinFlying()) {
                this.state = 'FLYING';
                const newPos = this.physics.updatePenguin(
                    deltaTime,
                    { x: this.penguin.x, y: this.penguin.y },
                    this.groundY
                );
                this.penguin.x = newPos.x;
                this.penguin.y = newPos.y;

                // Update camera to follow penguin
                this.cameraX = Math.max(0, this.penguin.x - 400);

                // Update distance
                this.scoring.updateDistance(this.penguin.x, this.penguin.startX);
                this.ui.updateDistance(this.scoring.getCurrentDistance());
                this.ui.updateHighscore(this.scoring.getHighscore());

                // Check if landed
                if (!this.physics.isPenguinFlying() && this.state === 'FLYING') {
                    this.state = 'LANDED';
                    this.showResults();
                }
            }

            // If swing finished and penguin not hit, always launch penguin
            if (!this.physics.isSwinging() && !this.physics.isPenguinFlying() && this.state === 'SWINGING') {
                // Force hit
                this.physics.hitPenguin();
                this.state = 'FLYING';
            }
        }

        // Gliding physics
        if (this.penguin.gliding && this.physics.isPenguinFlying()) {
            this.physics.gravity = 350; // Increase gravity for less powerful glide
            this.physics.airResistance = 0.997; // More air resistance for less powerful glide
            this.physics.penguinRotation = -0.6; // Angle to the right while gliding
            this.physics.penguinRotationVelocity = 0;
        } else {
            this.physics.gravity = 600; // Normal gravity
            this.physics.airResistance = 0.995; // Normal air resistance
        }

        // Jump-pad collision and boost
        for (const pad of this.jumpPads) {
            // Penguin bounding box
            const penguinWidth = 40;
            const penguinHeight = 40;
            const penguinLeft = this.penguin.x - penguinWidth / 2;
            const penguinRight = this.penguin.x + penguinWidth / 2;
            const penguinTop = this.penguin.y - penguinHeight;
            const penguinBottom = this.penguin.y;
            // Pad bounding box (appearance and collision are the same)
            const padLeft = pad.x;
            const padRight = pad.x + pad.width;
            const padTop = pad.y;
            const padBottom = pad.y + pad.height;
            // Check overlap (collision matches appearance exactly)
            if (
                penguinRight > padLeft &&
                penguinLeft < padRight &&
                penguinBottom > padTop &&
                penguinTop < padBottom &&
                this.physics.isPenguinFlying()
            ) {
                // Apply upward and rightward force
                this.physics.penguinVelocity.y = -1200;
                this.physics.penguinVelocity.x += 800; // Add strong rightward force
                // Stop gliding and trigger rotation
                this.penguin.gliding = false;
                this.physics.penguinRotationVelocity = 2; // Resume rotation
            }
        }

        // Bounce: stop gliding and trigger rotation
        if (
            this.penguin.y >= this.groundY &&
            this.physics.isPenguinFlying() &&
            Math.abs(this.physics.penguinVelocity.y) > 50 &&
            this.penguin.gliding
        ) {
            this.penguin.gliding = false;
            this.physics.penguinRotationVelocity = 2; // Resume rotation (example value)
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
        this.ctx.translate(-this.cameraX, 0);

        // Render parallax background (ground now scrolls with camera)
        this.ctx.restore();
        this.parallax.render(this.cameraX);
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        // Render penguin
        let penguinRotation = this.penguin.gliding ? 1.2 : this.physics.getPenguinRotation();
        this.sprites.drawPenguin(
            this.penguin.x,
            this.penguin.y,
            penguinRotation,
            this.penguin.gliding
        );

        // Render yeti
        this.sprites.drawYeti(
            this.yeti.x,
            this.yeti.y,
            this.yeti.animationFrame
        );

        // Render club
        if (this.state === 'SWINGING' || this.state === 'FLYING') {
            this.sprites.drawGolfClub(
                this.club.x,
                this.club.y,
                this.club.rotation
            );
        }

        // Render jump-pads (remove extra camera transform)
        for (const pad of this.jumpPads) {
            this.ctx.fillStyle = 'rgba(0, 200, 255, 0.5)';
            this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
            this.ctx.strokeStyle = '#00BFFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pad.x, pad.y, pad.width, pad.height);
        }

        // Restore context
        this.ctx.restore();

        // Render UI elements (no camera offset)
        this.powerBar.render();

        if (this.state === 'ANGLE_SELECT') {
            this.angleIndicator.render(
                this.yeti.x - this.cameraX,
                this.yeti.y
            );
        }

        // Render minimap
        this.renderMinimap();
    }

    renderMinimap() {
        const minimapWidth = 300;
        const minimapHeight = 60;
        const margin = 16;
        const ctx = this.ctx;
        const canvas = this.canvas;
        // Minimap world range: from cameraX to cameraX + 2*canvas.width
        const worldStart = this.cameraX;
        const worldEnd = this.cameraX + 2 * canvas.width;
        const worldRange = worldEnd - worldStart;
        // Minimap position
        const mapX = margin;
        const mapY = canvas.height - minimapHeight - margin;
        // Draw minimap background (blue sky)
        ctx.save();
        ctx.globalAlpha = 0.95;
        const skyGrad = ctx.createLinearGradient(0, mapY, 0, mapY + minimapHeight);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(mapX, mapY, minimapWidth, minimapHeight);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX, mapY, minimapWidth, minimapHeight);
        // Draw ground (green) at the bottom of the minimap
        const groundHeight = 16;
        const groundY = mapY + minimapHeight - groundHeight;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, groundY + groundHeight);
        groundGrad.addColorStop(0, '#90EE90');
        groundGrad.addColorStop(1, '#228B22');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(mapX, groundY, minimapWidth, groundHeight);
        // Draw all jump-pads in minimap range, clipped to minimap
        ctx.save();
        ctx.beginPath();
        ctx.rect(mapX, mapY, minimapWidth, minimapHeight);
        ctx.clip();
        ctx.fillStyle = '#00BFFF';
        const padVisualHeight = 10;
        const padVisualY = groundY - padVisualHeight + 2;
        for (const pad of this.jumpPads) {
            if (pad.x + pad.width < worldStart || pad.x > worldEnd) continue;
            let relX = (pad.x - worldStart) / worldRange;
            let padW = pad.width / worldRange * minimapWidth;
            // Clamp pad position and width to minimap bounds
            let drawX = mapX + relX * minimapWidth;
            let drawW = padW;
            if (drawX < mapX) {
                drawW -= (mapX - drawX);
                drawX = mapX;
            }
            if (drawX + drawW > mapX + minimapWidth) {
                drawW = mapX + minimapWidth - drawX;
            }
            if (drawW > 0) {
                ctx.fillRect(drawX, padVisualY, drawW, padVisualHeight);
            }
        }
        ctx.restore();
        // Draw penguin (as a dot above the pads)
        const penguinRelX = (this.penguin.x - worldStart) / worldRange;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(
            Math.max(mapX, Math.min(mapX + minimapWidth, mapX + penguinRelX * minimapWidth)),
            padVisualY - 8,
            6, 0, Math.PI * 2
        );
        ctx.fill();
        // Draw camera view rectangle
        const viewStart = this.cameraX;
        const viewEnd = this.cameraX + canvas.width;
        const viewRelStart = (viewStart - worldStart) / worldRange;
        const viewRelEnd = (viewEnd - worldStart) / worldRange;
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            mapX + Math.max(0, viewRelStart * minimapWidth),
            mapY + 4,
            Math.max(8, Math.min(minimapWidth, (viewRelEnd - viewRelStart) * minimapWidth)),
            minimapHeight - 8
        );
        ctx.restore();
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
