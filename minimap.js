// Minimap rendering system
class MinimapRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 300;
        this.height = 60;
        this.margin = 16;
    }

    render(ctx, cameraX, potatoX, jumpPadManager) {
        const mapX = this.margin;
        const mapY = this.canvas.height - this.height - this.margin;

        // Minimap world range: from cameraX to cameraX + 2*canvas.width
        const worldStart = cameraX;
        const worldEnd = cameraX + 2 * this.canvas.width;
        const worldRange = worldEnd - worldStart;

        // Draw minimap background (blue sky)
        this.drawBackground(ctx, mapX, mapY);

        // Draw ground
        this.drawGround(ctx, mapX, mapY);

        // Draw jump-pads
        const padVisualY = jumpPadManager.renderInMinimap(
            ctx, mapX, mapY, this.width, this.height,
            this.canvas.height - 120, // groundY
            worldStart, worldEnd, worldRange
        );

        // Draw potato
        this.drawPotato(ctx, mapX, potatoX, worldStart, worldRange, padVisualY);

        // Draw camera view rectangle
        this.drawCameraView(ctx, mapX, mapY, cameraX, worldStart, worldRange);
    }

    drawBackground(ctx, mapX, mapY) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        const skyGrad = ctx.createLinearGradient(0, mapY, 0, mapY + this.height);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(mapX, mapY, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX, mapY, this.width, this.height);
        ctx.restore();
    }

    drawGround(ctx, mapX, mapY) {
        const groundHeight = 16;
        const groundY = mapY + this.height - groundHeight;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, groundY + groundHeight);
        groundGrad.addColorStop(0, '#90EE90');
        groundGrad.addColorStop(1, '#228B22');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(mapX, groundY, this.width, groundHeight);
    }

    drawPotato(ctx, mapX, potatoX, worldStart, worldRange, padVisualY) {
        const potatoRelX = (potatoX - worldStart) / worldRange;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(
            Math.max(mapX, Math.min(mapX + this.width, mapX + potatoRelX * this.width)),
            padVisualY - 8,
            6, 0, Math.PI * 2
        );
        ctx.fill();
    }

    drawCameraView(ctx, mapX, mapY, cameraX, worldStart, worldRange) {
        const viewStart = cameraX;
        const viewEnd = cameraX + this.canvas.width;
        const viewRelStart = (viewStart - worldStart) / worldRange;
        const viewRelEnd = (viewEnd - worldStart) / worldRange;

        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            mapX + Math.max(0, viewRelStart * this.width),
            mapY + 4,
            Math.max(8, Math.min(this.width, (viewRelEnd - viewRelStart) * this.width)),
            this.height - 8
        );
    }
}
