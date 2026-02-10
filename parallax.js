// Parallax background system with base64 placeholder images
class ParallaxBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.offset = 0;

        // Create placeholder images
        this.createPlaceholderImages();
    }

    createPlaceholderImages() {
        // Sky gradient (no image needed, will draw directly)
        this.skyGradient = null;

        // Mountains - simple SVG as base64
        this.mountainsImg = new Image();
        this.mountainsImg.src = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="800" height="300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#4a5568;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2d3748;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <polygon points="0,300 150,100 300,200 450,80 600,180 800,120 800,300" fill="url(#mountainGrad)"/>
                <polygon points="0,300 100,180 250,220 400,140 550,200 700,160 800,200 800,300" fill="#2d3748" opacity="0.7"/>
            </svg>
        `);

        // Clouds - simple SVG as base64
        this.cloudsImg = new Image();
        this.cloudsImg.src = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="1200" height="200" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="80" rx="60" ry="30" fill="white" opacity="0.7"/>
                <ellipse cx="130" cy="90" rx="50" ry="25" fill="white" opacity="0.7"/>
                <ellipse cx="70" cy="90" rx="40" ry="20" fill="white" opacity="0.7"/>
                
                <ellipse cx="400" cy="120" rx="70" ry="35" fill="white" opacity="0.6"/>
                <ellipse cx="440" cy="130" rx="55" ry="28" fill="white" opacity="0.6"/>
                <ellipse cx="360" cy="130" rx="45" ry="22" fill="white" opacity="0.6"/>
                
                <ellipse cx="700" cy="60" rx="65" ry="32" fill="white" opacity="0.8"/>
                <ellipse cx="735" cy="70" rx="52" ry="26" fill="white" opacity="0.8"/>
                <ellipse cx="665" cy="70" rx="42" ry="21" fill="white" opacity="0.8"/>
                
                <ellipse cx="1000" cy="100" rx="60" ry="30" fill="white" opacity="0.65"/>
                <ellipse cx="1030" cy="110" rx="50" ry="25" fill="white" opacity="0.65"/>
            </svg>
        `);

        this.cloudOffset = 0;
    }

    update(deltaTime, potatoX) {
        // Update parallax offset based on potato position
        this.offset = potatoX * 0.3;

        // Slowly move clouds
        this.cloudOffset += deltaTime * 10;
    }

    render(cameraX = 0) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Draw sky gradient
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, width, height);

        // Draw clouds (slowest parallax)
        if (this.cloudsImg.complete) {
            const cloudSpeed = 0.2;
            const cloudX = (-this.offset * cloudSpeed - this.cloudOffset) % this.cloudsImg.width;

            // Draw clouds twice for seamless scrolling
            this.ctx.drawImage(this.cloudsImg, cloudX, 20, this.cloudsImg.width, 150);
            this.ctx.drawImage(this.cloudsImg, cloudX + this.cloudsImg.width, 20, this.cloudsImg.width, 150);
            if (cloudX + this.cloudsImg.width < width) {
                this.ctx.drawImage(this.cloudsImg, cloudX + this.cloudsImg.width * 2, 20, this.cloudsImg.width, 150);
            }
        }

        // Draw mountains (medium parallax)
        if (this.mountainsImg.complete) {
            const mountainSpeed = 0.5;
            const mountainX = -this.offset * mountainSpeed;
            const mountainY = height - 250;

            // Draw mountains multiple times for seamless scrolling
            for (let i = -1; i <= Math.ceil(width / this.mountainsImg.width) + 1; i++) {
                this.ctx.drawImage(
                    this.mountainsImg,
                    mountainX + i * this.mountainsImg.width,
                    mountainY,
                    this.mountainsImg.width,
                    250
                );
            }
        }

        // Draw ground (now scrolls with camera)
        const groundY = height - 100;
        const groundGrad = this.ctx.createLinearGradient(0, groundY, 0, height);
        groundGrad.addColorStop(0, '#90EE90');
        groundGrad.addColorStop(1, '#228B22');
        this.ctx.fillStyle = groundGrad;
        // Offset ground by cameraX
        this.ctx.save();
        this.ctx.translate(-cameraX, 0);
        this.ctx.fillRect(0, groundY, width + cameraX, 100);

        // Draw snow texture on ground (also offset by cameraX)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137 + this.offset - cameraX) % (width + cameraX);
            const y = groundY + (i * 73) % 100;
            this.ctx.fillRect(x, y, 3, 3);
        }
        this.ctx.restore();
    }
}
