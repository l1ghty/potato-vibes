// Jump pad management and collision detection
class JumpPadManager {
    constructor(potatoStartX, groundY) {
        this.jumpPadIntervalPx = 100 * 20; // 100m * 20 pixels/m = 2000px
        this.jumpPads = [];

        // Place jump-pads for the course
        const powerBarWidth = 300;
        const powerBarHeight = 40;
        for (let i = 1; i <= 100; i++) {
            this.jumpPads.push({
                x: potatoStartX + i * this.jumpPadIntervalPx,
                y: groundY - powerBarHeight, // Pad bottom aligns with ground
                width: powerBarWidth,
                height: powerBarHeight
            });
        }
    }

    checkCollision(potato, physics) {
        for (const pad of this.jumpPads) {
            // If pad is far behind player, move it to the front of the line.
            // This infinitely extends the level past 10000 score while keeping relative distances exactly the same.
            while (pad.x < potato.x - 3000) {
                pad.x += this.jumpPads.length * this.jumpPadIntervalPx;
            }

            // Potato bounding box
            const potatoWidth = 40;
            const potatoHeight = 40;
            const potatoLeft = potato.x - potatoWidth / 2;
            const potatoRight = potato.x + potatoWidth / 2;
            const potatoTop = potato.y - potatoHeight;
            const potatoBottom = potato.y;

            // Pad bounding box (appearance and collision are the same)
            const padLeft = pad.x;
            const padRight = pad.x + pad.width;
            const padTop = pad.y;
            const padBottom = pad.y + pad.height;

            // Check overlap (collision matches appearance exactly)
            if (
                potatoRight > padLeft &&
                potatoLeft < padRight &&
                potatoBottom > padTop &&
                potatoTop < padBottom &&
                physics.isPotatoFlying()
            ) {
                // Calculate impact speed for sound pitch
                const speed = Math.sqrt(
                    physics.potatoVelocity.x ** 2 +
                    physics.potatoVelocity.y ** 2
                );

                // Apply upward and rightward force
                physics.potatoVelocity.y = -1200;
                physics.potatoVelocity.x += 800; // Add strong rightward force

                // Return collision info
                return {
                    collided: true,
                    speed: speed
                };
            }
        }

        return { collided: false };
    }

    render(ctx, cameraX) {
        ctx.save();
        ctx.translate(-cameraX, 0);

        for (const pad of this.jumpPads) {
            ctx.fillStyle = 'rgba(0, 200, 255, 0.5)';
            ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(pad.x, pad.y, pad.width, pad.height);
        }

        ctx.restore();
    }

    renderInMinimap(ctx, mapX, mapY, minimapWidth, minimapHeight, groundY, worldStart, worldEnd, worldRange) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(mapX, mapY, minimapWidth, minimapHeight);
        ctx.clip();

        ctx.fillStyle = '#00BFFF';
        const padVisualHeight = 10;
        const groundHeight = 16;
        const padVisualY = mapY + minimapHeight - groundHeight - padVisualHeight + 2;

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

        return padVisualY; // Return for potato positioning
    }
}
