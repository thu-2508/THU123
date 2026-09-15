export function triggerConfetti(isGrand: boolean = false) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const count = isGrand ? 120 : 60;
  const colors = ['#38bdf8', '#818cf8', '#a855f7', '#facc15', '#34d399', '#f43f5e', '#fb923c'];

  interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    vRot: number;
    alpha: number;
    shape: 'rect' | 'star';
  }

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * (w * 0.4),
      y: h * 0.4 + (Math.random() - 0.5) * 80,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * (isGrand ? 16 : 10),
      vy: (Math.random() - 1.2) * (isGrand ? 14 : 9),
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      alpha: 1,
      shape: Math.random() > 0.4 ? 'star' : 'rect',
    });
  }

  let animationFrame: number;
  const startTime = Date.now();
  const duration = isGrand ? 3500 : 2200;

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
      return;
    }

    ctx!.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vRot;
      p.alpha = Math.max(0, 1 - elapsed / duration);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = p.alpha;
      ctx!.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        // Draw 5-pointed star
        ctx!.beginPath();
        for (let s = 0; s < 5; s++) {
          ctx!.lineTo(Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size);
          ctx!.lineTo(Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2), -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2));
        }
        ctx!.closePath();
        ctx!.fill();
      }

      ctx!.restore();
    });

    animationFrame = requestAnimationFrame(render);
  }

  animationFrame = requestAnimationFrame(render);
}
