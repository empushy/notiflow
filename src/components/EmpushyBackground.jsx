import { useEffect, useRef } from "react";

function EmpushyBackground({ muted = false }) {
  const backdropRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const backdrop = backdropRef.current;
    const emojis = ["🔔", "📣", "💬", "✉️", "📬", "✅", "⚡", "😀", "😎", "😊"];
    const particles = [];
    let animationId = null;
    let width = 0;
    let height = 0;
    let prevWidth = 0;
    let prevHeight = 0;
    let dpr = window.devicePixelRatio || 1;
    let lastFrameTime = 0;
    let targetFrameMs = 1000 / 55;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = rect.width;
      const nextHeight = rect.height;
      dpr = window.devicePixelRatio || 1;
      targetFrameMs = nextWidth < 640 ? 1000 / 40 : 1000 / 55;
      canvas.width = Math.max(1, Math.floor(nextWidth * dpr));
      canvas.height = Math.max(1, Math.floor(nextHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length && prevWidth > 0 && prevHeight > 0) {
        const scaleX = nextWidth / prevWidth;
        const scaleY = nextHeight / prevHeight;
        for (let i = 0; i < particles.length; i += 1) {
          particles[i].x *= scaleX;
          particles[i].y *= scaleY;
        }
      }
      width = nextWidth;
      height = nextHeight;
      prevWidth = nextWidth;
      prevHeight = nextHeight;
    };

    const initParticles = () => {
      particles.length = 0;
      const isSmallScreen = width < 640;
      const density = isSmallScreen ? 24000 : 20000;
      const count = Math.round((width * height) / density);
      const clusterCount = Math.max(8, Math.round(count / 6));
      const clusters = Array.from({ length: clusterCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 120 + Math.random() * 220,
      }));
      const baseSpeed = isSmallScreen ? 18 : 24;

      for (let i = 0; i < count; i += 1) {
        const cluster = clusters[i % clusterCount];
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * cluster.radius;
        const scatter = Math.random() < 0.3;
        const heading = Math.random() * Math.PI * 2;
        const speed = baseSpeed * (0.85 + Math.random() * 0.3);
        const emojiSize = 11 + Math.random() * 5;
        particles.push({
          x: scatter ? Math.random() * width : Math.min(width, Math.max(0, cluster.x + Math.cos(angle) * radius)),
          y: scatter ? Math.random() * height : Math.min(height, Math.max(0, cluster.y + Math.sin(angle) * radius)),
          vx: Math.cos(heading) * speed,
          vy: Math.sin(heading) * speed,
          emoji: emojis[i % emojis.length],
          emojiSize,
          radius: emojiSize * 0.55,
        });
      }
    };

    const step = (now) => {
      if (now - lastFrameTime < targetFrameMs) {
        animationId = requestAnimationFrame(step);
        return;
      }
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      ctx.clearRect(0, 0, width, height);
      const alphaScale = muted ? 0.22 : 1;
      ctx.strokeStyle = `rgba(248, 142, 183, ${0.3 * alphaScale})`;
      ctx.lineWidth = 1.2;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < p.radius) {
          p.x = p.radius;
          p.vx *= -1;
        } else if (p.x > width - p.radius) {
          p.x = width - p.radius;
          p.vx *= -1;
        }
        if (p.y < p.radius) {
          p.y = p.radius;
          p.vy *= -1;
        } else if (p.y > height - p.radius) {
          p.y = height - p.radius;
          p.vy *= -1;
        }
      }

      const linkStep = particles.length > 140 ? 2 : 1;
      for (let i = 0; i < particles.length; i += linkStep) {
        const a = particles[i];
        let links = 0;
        for (let j = i + 1; j < particles.length; j += linkStep) {
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200) {
            const alpha = Math.max(0, 0.8 - dist / 220) * alphaScale;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            links += 1;
            if (links >= 4) break;
          }
        }
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.radius + b.radius;
          if (dist > 0 && dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.5;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const impact = dvx * nx + dvy * ny;
            if (impact < 0) {
              a.vx -= impact * nx;
              a.vy -= impact * ny;
              b.vx += impact * nx;
              b.vy += impact * ny;
            }
          }
        }
      }

      ctx.shadowColor = `rgba(248, 142, 183, ${0.2 * alphaScale})`;
      ctx.shadowBlur = muted ? 2 : 4;
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.04 * alphaScale})`;
        ctx.strokeStyle = `rgba(248, 142, 183, ${0.14 * alphaScale})`;
        ctx.lineWidth = 1;
        ctx.arc(p.x, p.y, p.radius + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = `${p.emojiSize + 1}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"`;
        ctx.fillStyle = `rgba(15, 23, 42, ${0.45 * alphaScale})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, p.x, p.y + 1);
      }
      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(step);
    };

    resize();
    initParticles();

    let resizeTimeout = null;
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (particles.length === 0) {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => initParticles(), 120);
      }
    });

    if (backdrop) resizeObserver.observe(backdrop);
    window.addEventListener("resize", resize);
    lastFrameTime = performance.now();
    animationId = requestAnimationFrame(step);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="empushy-canvas-wrap" ref={backdropRef} aria-hidden="true">
      <canvas className="empushy-canvas-bg" ref={canvasRef} />
    </div>
  );
}

export default EmpushyBackground;
