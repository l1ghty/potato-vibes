// Angle indicator UI component
class AngleIndicator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.angle = 45; // degrees
        this.increasing = true;
        this.active = false;
        this.locked = false;
        this.speed = 60; // degrees per second
        this.minAngle = 10;
        this.maxAngle = 80;
    }

    start() {
        this.active = true;
        this.locked = false;
        this.angle = 45;
        this.increasing = true;
    }

    lock() {
        this.locked = true;
        this.active = false;
        return this.angle;
    }

    update(deltaTime) {
        if (!this.active || this.locked) return;

        if (this.increasing) {
            this.angle += this.speed * deltaTime;
            if (this.angle >= this.maxAngle) {
                this.angle = this.maxAngle;
                this.increasing = false;
            }
        } else {
            this.angle -= this.speed * deltaTime;
            if (this.angle <= this.minAngle) {
                this.angle = this.minAngle;
                this.increasing = true;
            }
        }
    }

    render(elbroX, elbroY) {
        if (!this.active && !this.locked) return;

        const ctx = this.ctx;
        const startX = elbroX + 60;
        const startY = elbroY - 10;
        const length = 100;

        // Convert angle to radians
        const angleRad = (this.angle * Math.PI) / 180;
        const endX = startX + Math.cos(angleRad) * length;
        const endY = startY - Math.sin(angleRad) * length;

        // Draw arc
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(startX, startY, length, -this.maxAngle * Math.PI / 180, -this.minAngle * Math.PI / 180, false);
        ctx.stroke();

        // Draw angle line
        ctx.strokeStyle = this.locked ? '#00FF00' : '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrow at end
        ctx.fillStyle = this.locked ? '#00FF00' : '#FFD700';
        ctx.beginPath();
        ctx.arc(endX, endY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw angle text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(Math.round(this.angle) + '°', startX + 50, startY - 80);
        ctx.fillText(Math.round(this.angle) + '°', startX + 50, startY - 80);

        // Instruction
        if (!this.locked) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText('Click to lock angle!', startX, startY - 110);
            ctx.fillText('Click to lock angle!', startX, startY - 110);
        }
    }

    getAngle() {
        return this.angle;
    }

    isLocked() {
        return this.locked;
    }
}
