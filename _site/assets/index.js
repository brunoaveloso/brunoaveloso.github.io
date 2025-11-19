const canvas = document.getElementById('quantumCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = [];
const particleCount = 120;
const connectionDistance = 120;
const mouse = { x: null, y: null, radius: 150 };

class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.baseVx = this.vx;
        this.baseVy = this.vy;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = Math.random() * 0.5 + 0.3;
        this.radius = Math.random() * 2.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.baseVx = this.vx;
        this.baseVy = this.vy;
        
        // Quantum properties
        this.phase = Math.random() * Math.PI * 2;
        this.phaseSpeed = (Math.random() - 0.5) * 0.02;
        this.pulseSpeed = Math.random() * 0.03 + 0.02;
    }

    update() {
        // Mouse interaction
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.vx = this.baseVx - Math.cos(angle) * force * 2;
                this.vy = this.baseVy - Math.sin(angle) * force * 2;
            } else {
                this.vx += (this.baseVx - this.vx) * 0.05;
                this.vy += (this.baseVy - this.vy) * 0.05;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.phase += this.phaseSpeed;

        // Wrap around edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.reset();
    }

    draw() {
        // Pulsing effect
        const pulse = Math.sin(Date.now() * this.pulseSpeed) * 0.3 + 0.7;
        const size = this.radius * pulse;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 3);
        gradient.addColorStop(0, `rgba(43, 58, 122, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(43, 58, 122, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 74, 46, ${this.opacity})`;
        ctx.fill();

        // Inner bright spot
        ctx.beginPath();
        ctx.arc(this.x - size * 0.3, this.y - size * 0.3, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                const opacity = (1 - distance / connectionDistance) * 0.5;
                
                // Gradient line
                const gradient = ctx.createLinearGradient(
                    particles[i].x, particles[i].y,
                    particles[j].x, particles[j].y
                );
                gradient.addColorStop(0, `rgba(24, 32, 74, ${opacity})`);
                gradient.addColorStop(0.5, `rgba(230, 74, 46, ${opacity * 0.6})`);
                gradient.addColorStop(1, `rgba(43, 58, 122, ${opacity})`);

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = (1 - distance / connectionDistance) * 2;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();

                // Energy pulses along connections
                const pulsePos = (Date.now() * 0.001) % 1;
                const pulseX = particles[i].x + (particles[j].x - particles[i].x) * pulsePos;
                const pulseY = particles[i].y + (particles[j].y - particles[i].y) * pulsePos;
                
                if (distance < connectionDistance * 0.6) {
                    ctx.beginPath();
                    ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(230, 74, 46, ${opacity * 2})`;
                    ctx.fill();
                }
            }
        }
    }
}

// Mouse tracking
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    bgGradient.addColorStop(0, 'rgba(43, 58, 122, 0.02)');
    bgGradient.addColorStop(1, 'rgba(24, 32, 74, 0.05)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    connectParticles();

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

animate();
}
const yearEl = document.getElementById("currentYear");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}
// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// Mobile Menu
const menuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.getElementById("mainNav");

if (menuBtn && mainNav) {
    menuBtn.addEventListener("click", () =>
        mainNav.classList.toggle("open")
    );
}