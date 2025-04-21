/**
 * Perlin Noise implementation for Pixel Empires
 * Based on the improved noise algorithm by Ken Perlin
 */
class PerlinNoise {
    /**
     * Initialize the Perlin noise generator
     * @param {number} seed - Random seed for the noise
     */
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.permutation = this.generatePermutation();
    }
    
    /**
     * Generate a permutation table based on the seed
     * @returns {Array} - Permutation table
     */
    generatePermutation() {
        // Create an array of 0-255
        const p = Array.from({ length: 256 }, (_, i) => i);
        
        // Shuffle the array using the seed
        const random = this.createRandomGenerator(this.seed);
        for (let i = p.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // Extend the permutation to avoid overflow
        return [...p, ...p];
    }
    
    /**
     * Create a random number generator with a seed
     * @param {number} seed - The seed value
     * @returns {Function} - A function that returns a random number between 0 and 1
     */
    createRandomGenerator(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    
    /**
     * Fade function for smoother interpolation
     * @param {number} t - Input value
     * @returns {number} - Faded value
     */
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    /**
     * Linear interpolation
     * @param {number} a - First value
     * @param {number} b - Second value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} - Interpolated value
     */
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    
    /**
     * Gradient function
     * @param {number} hash - Hash value
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @returns {number} - Dot product of gradient vector and distance vector
     */
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    /**
     * Get noise value at a specific point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate (optional)
     * @returns {number} - Noise value (-1 to 1)
     */
    noise(x, y, z = 0) {
        // Find unit cube that contains the point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        // Find relative x, y, z of point in cube
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        // Compute fade curves for each of x, y, z
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        
        // Hash coordinates of the 8 cube corners
        const A = this.permutation[X] + Y;
        const AA = this.permutation[A] + Z;
        const AB = this.permutation[A + 1] + Z;
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B] + Z;
        const BB = this.permutation[B + 1] + Z;
        
        // Add blended results from 8 corners of cube
        return this.lerp(
            this.lerp(
                this.lerp(
                    this.grad(this.permutation[AA], x, y, z),
                    this.grad(this.permutation[BA], x - 1, y, z),
                    u
                ),
                this.lerp(
                    this.grad(this.permutation[AB], x, y - 1, z),
                    this.grad(this.permutation[BB], x - 1, y - 1, z),
                    u
                ),
                v
            ),
            this.lerp(
                this.lerp(
                    this.grad(this.permutation[AA + 1], x, y, z - 1),
                    this.grad(this.permutation[BA + 1], x - 1, y, z - 1),
                    u
                ),
                this.lerp(
                    this.grad(this.permutation[AB + 1], x, y - 1, z - 1),
                    this.grad(this.permutation[BB + 1], x - 1, y - 1, z - 1),
                    u
                ),
                v
            ),
            w
        );
    }
    
    /**
     * Get fractal Brownian motion (fBm) noise
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} octaves - Number of octaves
     * @param {number} persistence - Persistence value
     * @param {number} lacunarity - Lacunarity value
     * @returns {number} - fBm noise value (0 to 1)
     */
    fbm(x, y, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        // Normalize to 0-1
        return (total / maxValue + 1) / 2;
    }
}

// Export the PerlinNoise class
if (typeof module !== 'undefined') {
    module.exports = { PerlinNoise };
}
