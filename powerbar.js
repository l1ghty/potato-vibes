// Power bar UI component
class PowerBar {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.power = 0;
        this.increasing = true;
        this.active = false;
        this.locked = false;
        this.speed = 150; // Power units per second
    }

    start() {
        this.active = true;
        this.locked = false;
        this.power = 0;
        this.increasing = true;
    }

    lock() {
        this.locked = true;
        this.active = false;
        return this.power;
    }

    update(deltaTime) {
        if (!this.active || this.locked) return;

        if (this.increasing) {
            this.power += this.speed * deltaTime;
            if (this.power >= 100) {
                this.power = 100;
                this.increasing = false;
            }
        } else {
            this.power -= this.speed * deltaTime;
            if (this.power <= 0) {
                this.power = 0;
                this.increasing = true;
            }
        }
    }

    render() {
        if (!this.active && !this.locked) return;

        const ctx = this.ctx;
        let x, y;
        const width = 300;
        const height = 40;

        // Move power bar to bottom after shoot
        if (this.locked) {
            x = 30; // left side
            y = this.canvas.height - 60; // Near bottom
        } else {
            x = this.canvas.width / 2 - 150;
            y = this.canvas.height - 150;
        }

        if (!this.locked) {
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - 10, y - 10, width + 20, height + 20);

            // Border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(x - 10, y - 10, width + 20, height + 20);

            // Bar background
            ctx.fillStyle = '#333333';
            ctx.fillRect(x, y, width, height);

            // Power fill
            const fillWidth = (this.power / 100) * width;
            const gradient = ctx.createLinearGradient(x, y, x + width, y);

            if (this.power < 30) {
                gradient.addColorStop(0, '#FF4444');
                gradient.addColorStop(1, '#FF6666');
            } else if (this.power < 70) {
                gradient.addColorStop(0, '#FFAA00');
                gradient.addColorStop(1, '#FFCC00');
            } else {
                gradient.addColorStop(0, '#00FF00');
                gradient.addColorStop(1, '#00DD00');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, fillWidth, height);
        }

        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('POWER: ' + Math.round(this.power) + "%", x + width / 2, y - 20);

        // Instruction
        if (!this.locked) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            const tx = 'Click to lock power!', ty = 'Hold mouse/touch during flight to glide!';
            ctx.strokeText(tx, x + width / 2, y + height + 30);
            ctx.fillText(tx, x + width / 2, y + height + 30);
            ctx.strokeText(ty, x + width / 2, y + height + 60);
            ctx.fillText(ty, x + width / 2, y + height + 60);
        }
    }

    getPower() {
        return this.power;
    }

    isLocked() {
        return this.locked;
    }
}
