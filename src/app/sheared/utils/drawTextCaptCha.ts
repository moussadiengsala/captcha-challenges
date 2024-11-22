import { WritableSignal } from "@angular/core";

export function drawTextCaptcha(canvasSignal: WritableSignal<HTMLCanvasElement | null>, captchaCode: string) {
    const canvas = canvasSignal();
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add random noise lines
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.3)`;
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Draw text with randomized styling
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    
    captchaCode.split('').forEach((char, index) => {
      ctx.save();
      ctx.translate(20 + index * 35, 40);
      ctx.rotate(Math.random() * 0.5 - 0.25);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
};