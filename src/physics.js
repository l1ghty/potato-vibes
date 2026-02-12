// Physics engine for golf club and potato
class Physics {
    constructor() {
        // Golf club physics
        this.clubRotation = 0;
        this.clubAngularVelocity = 0; // radians per second
        this.clubRadius = 100; // Increased for better reach
        this.clubSwinging = false;

        // Potato physics
        this.potatoVelocity = { x: 0, y: 0 };
        this.potatoRotation = 0;
        this.potatoRotationVelocity = 0;
        this.potatoFlying = false;

        // Physics constants
        this.gravity = 600; // pixels per second squared
        this.airResistance = 0.995; // per frame
        this.wind = 0; // pixels per second squared (can be randomized)

        // Collision
        this.hasHit = false;
    }

    startSwing(power, angle) {
        // Convert power (0-100) to angular velocity
        this.clubAngularVelocity = -((power / 100) * 15 + 5) * 2; // 2x power
        this.clubRotation = -Math.PI / 2; // Start from top (90 degrees up)
        this.clubSwinging = true;
        this.hasHit = false;

        // Store angle for when we hit the potato
        this.launchAngle = (angle * Math.PI) / 180;
        this.launchPower = power;
    }

    updateClub(deltaTime, shoulderX, shoulderY) {
        // The hand (handle) position is at the end of the elbro's right arm
        // Arm vector: from shoulder to hand (matches elbro sprite: +60, -10)
        const handOffsetX = 60;
        const handOffsetY = -10;
        const handX = shoulderX + handOffsetX;
        const handY = shoulderY + handOffsetY;
        const clubLength = 80; // matches sprites.js

        if (!this.clubSwinging) {
            return { x: handX, y: handY, rotation: -Math.PI / 2 };
        }

        // Update rotation
        this.clubRotation += this.clubAngularVelocity * deltaTime;

        // Stop swinging after full rotation (from -90° to -270°)
        if (this.clubRotation < -Math.PI * 1.5) {
            this.clubSwinging = false;
            this.clubRotation = 0;
        }

        return { x: handX, y: handY, rotation: this.clubRotation - Math.PI / 2 };
    }

    // Helper to get the club tip position for collision
    getClubTip(club) {
        const clubLength = 80; // matches sprites.js
        return {
            x: club.x + Math.cos(club.rotation) * clubLength,
            y: club.y + Math.sin(club.rotation) * clubLength
        };
    }

    checkCollision(clubX, clubY, potatoX, potatoY) {
        if (this.hasHit || !this.clubSwinging) return false;

        // Simple circle collision
        const dx = clubX - potatoX;
        const dy = clubY - potatoY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Club head radius + potato radius (increased for easier hitting)
        if (distance < 40) {
            this.hasHit = true;
            this.hitPotato();
            return true;
        }

        return false;
    }

    hitPotato() {
        // Calculate initial velocity based on power and angle
        const speed = ((this.launchPower / 100) * 800 + 200) * 2; // 2x power

        this.potatoVelocity.x = Math.cos(this.launchAngle) * speed;
        this.potatoVelocity.y = -Math.sin(this.launchAngle) * speed;

        // Add rotation (reverse direction)
        this.potatoRotationVelocity = -(this.clubAngularVelocity * 2); // radians per second

        this.potatoFlying = true;
    }

    updatePotato(deltaTime, potatoPos, groundY) {
        if (!this.potatoFlying) return potatoPos;

        // Apply gravity
        this.potatoVelocity.y += this.gravity * deltaTime;

        // Apply air resistance
        // Make it time-independent: (0.995 per frame @ 60fps)
        // Formula: factor = pow(base_factor, deltaTime * targetFPS)
        const airResistanceFactor = Math.pow(this.airResistance, deltaTime * 60);
        this.potatoVelocity.x *= airResistanceFactor;
        this.potatoVelocity.y *= airResistanceFactor;

        // Apply wind (optional)
        this.potatoVelocity.x += this.wind * deltaTime;

        // Update position
        potatoPos.x += this.potatoVelocity.x * deltaTime;
        potatoPos.y += this.potatoVelocity.y * deltaTime;

        // Update rotation
        this.potatoRotation += this.potatoRotationVelocity * deltaTime;

        // Bounce constants
        const BOUNCE_FACTOR = 0.8; // Energy loss on bounce (was 0.6, now less loss)
        const BOUNCE_STOP_THRESHOLD = 50; // Minimum velocity to stop bouncing

        // Check ground collision and bounce
        if (potatoPos.y >= groundY) {
            potatoPos.y = groundY;
            if (Math.abs(this.potatoVelocity.y) > BOUNCE_STOP_THRESHOLD) {
                this.potatoVelocity.y = -this.potatoVelocity.y * BOUNCE_FACTOR;
                // Reduce rotation velocity as well
                this.potatoRotationVelocity *= BOUNCE_FACTOR;
            } else {
                this.potatoFlying = false;
                this.potatoVelocity = { x: 0, y: 0 };
                this.potatoRotationVelocity = 0;
            }
        }

        return potatoPos;
    }

    isPotatoFlying() {
        return this.potatoFlying;
    }

    isSwinging() {
        return this.clubSwinging;
    }

    getPotatoRotation() {
        return this.potatoRotation;
    }

    reset() {
        this.clubRotation = 0;
        this.clubAngularVelocity = 0;
        this.clubSwinging = false;
        this.potatoVelocity = { x: 0, y: 0 };
        this.potatoRotation = 0;
        this.potatoRotationVelocity = 0;
        this.potatoFlying = false;
        this.hasHit = false;
    }
}
