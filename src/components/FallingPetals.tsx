'use client';

import React, { useEffect, useRef } from 'react';

interface GoldParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

export default function FallingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: GoldParticle[] = [];
    const maxParticles = 60; // Slightly more for high density cinematic look

    // Luxury gold palette
    const colors = [
      'rgba(212, 175, 55, 0.8)',   // Luxury Gold
      'rgba(246, 236, 223, 0.75)',  // Soft Cream Gold
      'rgba(222, 181, 134, 0.7)',   // Warm Bronze Gold
      'rgba(255, 255, 255, 0.85)',  // Sparkling Diamond White
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticle = (isInitial = false): GoldParticle => {
      const size = Math.random() * 3.5 + 1.2; // smaller, elegant dust specks
      return {
        x: Math.random() * canvas.width,
        y: isInitial ? Math.random() * canvas.height : canvas.height + 20, // drift upwards
        size,
        speedY: -(Math.random() * 0.8 + 0.3), // slow upward drift
        speedX: Math.random() * 0.6 - 0.3,   // slight drift side to side
        opacity: Math.random() * 0.5 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const drawParticle = (ctx: CanvasRenderingContext2D, p: GoldParticle) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      
      // Create radial glow for each gold speck
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.3, p.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Core sparkle
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = p.opacity * 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move particle upward
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y / 40) * 0.15; // smooth sway

        // Reset if offscreen (at the top)
        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          particles[i] = createParticle(false);
        }

        drawParticle(ctx, p);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}
