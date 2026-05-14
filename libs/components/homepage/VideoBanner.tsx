'use client';
import { useRef } from 'react';
import Link from 'next/link';

export default function VideoBanner() {
  const muteRef = useRef<HTMLButtonElement>(null);
  const vidRef  = useRef<HTMLVideoElement>(null);
  const toggle = () => {
    if (!vidRef.current) return;
    vidRef.current.muted = !vidRef.current.muted;
    if (muteRef.current) muteRef.current.textContent = vidRef.current.muted ? '🔇' : '🔊';
  };
  return (
    <section style={{ padding:'0 0 72px' }}>
      <div className="wrap">
        <div className="video-banner">
          <video ref={vidRef} autoPlay muted loop playsInline
            poster="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80">
            <source src="/videos/petoria-eco-life.mp4" type="video/mp4" />
          </video>
          <div className="video-banner__overlay">
            <div className="video-banner__content">
              <p className="video-banner__eyebrow">Our mission</p>
              <h2 className="video-banner__title">A Happy Life for<br/>Every Pet 🌍</h2>
              <p className="video-banner__sub">We believe happy pets make happy humans. Our ecosystem connects premium care, natural nutrition and joyful play.</p>
              <div className="video-banner__btns">
                <Link href="/shop"      className="btn btn--primary">Explore products →</Link>
                <Link href="/community" className="btn btn--white">Join community</Link>
              </div>
            </div>
          </div>
          <button ref={muteRef} className="video-banner__mute" onClick={toggle}>🔇</button>
        </div>
      </div>
    </section>
  );
}
