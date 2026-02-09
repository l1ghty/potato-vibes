// Sprite rendering for Yeti, Penguin, and Golf Club
class Sprites {
    constructor(ctx) {
        this.ctx = ctx;
    }

    drawYeti(x, y, animationFrame) {
        const ctx = this.ctx;

        // Yeti body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(x, y, 40, 50, 0, 0, Math.PI * 2);
        ctx.fill();

        // Yeti head
        ctx.beginPath();
        ctx.arc(x, y - 60, 30, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - 10, y - 65, 3, 0, Math.PI * 2);
        ctx.arc(x + 10, y - 65, 3, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - 55, 8, 0, Math.PI);
        ctx.stroke();

        // Arms
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';

        // Left arm
        ctx.beginPath();
        ctx.moveTo(x - 35, y - 20);
        ctx.lineTo(x - 50, y + 10);
        ctx.stroke();

        // Right arm (holding club) - slight animation
        const armBob = Math.sin(animationFrame * 0.05) * 2;
        ctx.beginPath();
        ctx.moveTo(x + 35, y - 20);
        ctx.lineTo(x + 60, y - 10 + armBob);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 50);
        ctx.lineTo(x - 20, y + 80);
        ctx.moveTo(x + 15, y + 50);
        ctx.lineTo(x + 20, y + 80);
        ctx.stroke();

        // Feet
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(x - 20, y + 85, 12, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 20, y + 85, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // In Sprites.js or similar file
    drawPenguinX(x, y, rotation, gliding) {
this.potato = new Image();
this.potato.src = 'assets/potato.png';
        const img = this.potato; // Load potato.png in your images object
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(img, -60, -60, 60, 80);
        this.ctx.restore();
    }
    drawPenguin(x, y, rotation = 0, gliding = false) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Penguin body (black)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Penguin belly (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 5, 10, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -18, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-4, -20, 4, 0, Math.PI * 2);
        ctx.arc(4, -20, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-4, -20, 2, 0, Math.PI * 2);
        ctx.arc(4, -20, 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-5, -12);
        ctx.lineTo(5, -12);
        ctx.closePath();
        ctx.fill();

        // Wings
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        if (gliding) {
            // Open wings: wide, flat
            ctx.ellipse(-25, 0, 18, 8, -0.2, 0, Math.PI * 2);
            ctx.ellipse(25, 0, 18, 8, 0.2, 0, Math.PI * 2);
        } else {
            // Normal wings
            ctx.ellipse(-12, 0, 5, 12, -0.3, 0, Math.PI * 2);
            ctx.ellipse(12, 0, 5, 12, 0.3, 0, Math.PI * 2);
        }
        ctx.fill();

        // Feet
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(-6, 20, 5, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(6, 20, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawGolfClub(x, y, rotation) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Club shaft
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 80);
        ctx.stroke();

        // Club head
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-8, 80, 16, 12);

        // Club head detail
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.strokeRect(-8, 80, 16, 12);

        ctx.restore();
    }

    drawJumpPad(x, y, radius) {
        const ctx = this.ctx;
        const penguinHeight = 40; // 2 penguins
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, radius, penguinHeight / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#00FF80';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#008040';
        ctx.stroke();
        // Optional: add bounce icon
        ctx.beginPath();
        ctx.moveTo(x - radius / 2, y);
        ctx.quadraticCurveTo(x, y - penguinHeight, x + radius / 2, y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
