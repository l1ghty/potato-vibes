// Camera management for following the potato
class CameraManager {
    constructor() {
        this.x = 0;
    }

    update(potatoX, followOffset = 400) {
        // Update camera to follow potato with offset
        this.x = Math.max(0, potatoX - followOffset);
    }

    reset() {
        this.x = 0;
    }

    getX() {
        return this.x;
    }
}
