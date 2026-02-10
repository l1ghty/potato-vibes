// Sprite rendering for Elbro, Potato, and Golf Club
class Sprites {
    constructor(ctx) {
        this.ctx = ctx;
        this.potatoImage = new Image();
        this.potatoImage.src = 'assets/potato.png';
        this.glidingPotatoImage = new Image();
        this.glidingPotatoImage.src = 'assets/gliding-potato.png';
        this.elbroImage = new Image();
        this.elbroImage.src = 'assets/elbro.png';
        this.elbroSwingImage = new Image();
        this.elbroSwingImage.src = 'assets/elbro-swing.png';
    }

    drawElbro(x, y, animationFrame, isSwinging = false) {
        const ctx = this.ctx;

        const useElbro = this.elbroImage && this.elbroImage.complete && this.elbroImage.naturalWidth > 0;
        const useSwing = this.elbroSwingImage && this.elbroSwingImage.complete && this.elbroSwingImage.naturalWidth > 0;

        if (isSwinging && useSwing) {
            ctx.save();
            // Draw Swing image
            // Centered and scaled similar to Elbro
            ctx.drawImage(this.elbroSwingImage, x - 60, y - 90, 120, 180);
            ctx.restore();
        } else if (useElbro) {
            ctx.save();
            // Draw Elbro (Idle)
            ctx.drawImage(this.elbroImage, x - 60, y - 90, 120, 180);
            ctx.restore();
        } else {
            // Elbro body vector fallback
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(x, y, 40, 50, 0, 0, Math.PI * 2);
            ctx.fill();

            // Elbro head
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
    }

    drawPotato(x, y, rotation = 0, gliding = false) {
        const ctx = this.ctx;

        const usePotato = this.potatoImage && this.potatoImage.complete && this.potatoImage.naturalWidth > 0;
        const useGlidingPotato = this.glidingPotatoImage && this.glidingPotatoImage.complete && this.glidingPotatoImage.naturalWidth > 0;

        let imgToUse = null;
        if (gliding && useGlidingPotato) {
            imgToUse = this.glidingPotatoImage;
        } else if (usePotato) {
            imgToUse = this.potatoImage;
        }

        if (imgToUse) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            if (imgToUse === this.glidingPotatoImage) {
                // Draw gliding potato
                // Match normal potato size approx 40x50
                ctx.drawImage(imgToUse, -37, -37, 75, 75);
            } else {
                // Draw normal potato
                // Dimensions approx 40x50 to match original potato size roughly
                ctx.drawImage(imgToUse, -20, -25, 40, 50);
            }
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            // Potato body (black)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(0, 0, 15, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Potato belly (white)
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
        const potatoHeight = 40; // 2 potatos
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, radius, potatoHeight / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#00FF80';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#008040';
        ctx.stroke();
        // Optional: add bounce icon
        ctx.beginPath();
        ctx.moveTo(x - radius / 2, y);
        ctx.quadraticCurveTo(x, y - potatoHeight, x + radius / 2, y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
