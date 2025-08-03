class WebGLBackground {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to CSS background');
            return;
        }

        this.particles = [];
        this.particleCount = 100;
        this.time = 0;
        
        this.init();
        this.resize();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }

    init() {
        const gl = this.gl;
        
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute float a_size;
            attribute vec3 a_color;
            attribute float a_alpha;
            
            uniform float u_time;
            uniform vec2 u_resolution;
            
            varying vec3 v_color;
            varying float v_alpha;
            
            void main() {
                vec2 position = a_position;
                
                // Add some movement
                position.x += sin(u_time * 0.5 + a_position.y * 0.1) * 0.1;
                position.y += cos(u_time * 0.3 + a_position.x * 0.1) * 0.1;
                
                // Convert to clip space
                vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
                clipSpace.y *= -1.0;
                
                gl_Position = vec4(clipSpace, 0.0, 1.0);
                gl_PointSize = a_size * (1.0 + sin(u_time + a_position.x) * 0.3);
                
                v_color = a_color;
                v_alpha = a_alpha;
            }
        `;

        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec3 v_color;
            varying float v_alpha;
            
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                
                if (dist > 0.5) {
                    discard;
                }
                
                float alpha = (1.0 - dist * 2.0) * v_alpha;
                gl_FragColor = vec4(v_color, alpha);
            }
        `;

        // Create shaders
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Create program
        this.program = this.createProgram(vertexShader, fragmentShader);

        // Get attribute and uniform locations
        this.attributes = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            size: gl.getAttribLocation(this.program, 'a_size'),
            color: gl.getAttribLocation(this.program, 'a_color'),
            alpha: gl.getAttribLocation(this.program, 'a_alpha')
        };

        this.uniforms = {
            time: gl.getUniformLocation(this.program, 'u_time'),
            resolution: gl.getUniformLocation(this.program, 'u_resolution')
        };

        // Generate particles
        this.generateParticles();
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const gl = this.gl;
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    generateParticles() {
        const gl = this.gl;
        
        // Create particle data
        const positions = new Float32Array(this.particleCount * 2);
        const sizes = new Float32Array(this.particleCount);
        const colors = new Float32Array(this.particleCount * 3);
        const alphas = new Float32Array(this.particleCount);

        for (let i = 0; i < this.particleCount; i++) {
            // Position
            positions[i * 2] = Math.random() * this.canvas.width;
            positions[i * 2 + 1] = Math.random() * this.canvas.height;

            // Size
            sizes[i] = Math.random() * 3 + 1;

            // Color (gradient from blue to purple)
            const colorMix = Math.random();
            colors[i * 3] = 0.4 + colorMix * 0.3; // R
            colors[i * 3 + 1] = 0.2 + colorMix * 0.4; // G
            colors[i * 3 + 2] = 0.8 + colorMix * 0.2; // B

            // Alpha
            alphas[i] = Math.random() * 0.5 + 0.3;
        }

        // Create buffers
        this.buffers = {
            position: gl.createBuffer(),
            size: gl.createBuffer(),
            color: gl.createBuffer(),
            alpha: gl.createBuffer()
        };

        // Upload data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
        gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.alpha);
        gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);
    }

    resize() {
        const gl = this.gl;
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
    }

    render() {
        const gl = this.gl;

        // Clear
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Use program
        gl.useProgram(this.program);

        // Set uniforms
        gl.uniform1f(this.uniforms.time, this.time);
        gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);

        // Set attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.enableVertexAttribArray(this.attributes.position);
        gl.vertexAttribPointer(this.attributes.position, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
        gl.enableVertexAttribArray(this.attributes.size);
        gl.vertexAttribPointer(this.attributes.size, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
        gl.enableVertexAttribArray(this.attributes.color);
        gl.vertexAttribPointer(this.attributes.color, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.alpha);
        gl.enableVertexAttribArray(this.attributes.alpha);
        gl.vertexAttribPointer(this.attributes.alpha, 1, gl.FLOAT, false, 0, 0);

        // Draw
        gl.drawArrays(gl.POINTS, 0, this.particleCount);
    }

    animate() {
        this.time += 0.016; // ~60fps
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize WebGL background when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WebGLBackground();
}); 