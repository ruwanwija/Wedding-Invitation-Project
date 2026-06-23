'use client';

import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
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
    let petals: Petal[] = [];
    const maxPetals = 40;

    // Soft shades of rose gold, pink, and cream for petals
    const petalColors = [
      'rgba(244, 232, 232, 0.75)', // Rose Gold light
      'rgba(234, 208, 211, 0.7)',  // Soft Rose Gold
      'rgba(220, 177, 183, 0.65)', // Deeper Rose
      'rgba(243, 236, 216, 0.7)',  // Pale Gold Cream
      'rgba(255, 255, 255, 0.8)',  // White
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createPetal = (isInitial = false): Petal => {
      const size = Math.random() * 8 + 6;
      return {
        x: Math.random() * canvas.width,
        y: isInitial ? Math.random() * canvas.height : -20,
        size,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: Math.random() * 1.5 - 0.75,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() * 2 - 1) * 0.5,
        opacity: Math.random() * 0.6 + 0.3,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
      };
    };

    // Initialize petals
    for (let i = 0; i < maxPetals; i++) {
      petals.push(createPetal(true));
    }

    const drawPetal = (ctx: CanvasRenderingContext2D, petal: Petal) => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate((petal.rotation * Math.PI) / 180);
      ctx.globalAlpha = petal.opacity;
      
      // Draw organic curved petal shape (cherry blossom style)
      ctx.fillStyle = petal.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-petal.size / 2, -petal.size / 2, -petal.size / 4, -petal.size);
      ctx.quadraticCurveTo(0, -petal.size * 1.2, petal.size / 4, -petal.size);
      ctx.quadraticCurveTo(petal.size / 2, -petal.size / 2, 0, 0);
      ctx.fill();

      // Add a subtle middle crease line to the petal
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -petal.size * 0.9);
      ctx.stroke();

      ctx.restore();
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < petals.length; i++) {
        const petal = petals[i];
        
        // Move petal
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.y / 30) * 0.4; // sway back and forth
        petal.rotation += petal.rotationSpeed;

        // Reset if offscreen
        if (petal.y > canvas.height + 20 || petal.x < -20 || petal.x > canvas.width + 20) {
          petals[i] = createPetal(false);
        }

        drawPetal(ctx, petal);
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
