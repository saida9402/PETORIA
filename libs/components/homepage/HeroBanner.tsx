'use client';
import { useRef } from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const muteRef  = useRef<HTMLButtonElement>(null);
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    if (muteRef.current) muteRef.current.textContent = videoRef.current.muted ? '🔇' : '🔊';
  };
  return (
    <section className="hero">
      <div className="hero__bg-shapes" />
      <div className="wrap">
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__eyebrow">🌱 Korea's #1 Pet Shop</div>
            <h1 className="hero__title">Natural care for<br/><span>your best friend</span> 🌿</h1>
            <p className="hero__sub">Premium pet products — sustainably sourced, delivered fresh to your door. Trusted by 12,000+ pet owners across Korea.</p>
            <div className="hero__ctas">
              <Link href="/shop" className="btn btn--primary btn--lg">Shop now →</Link>
              <Link href="/map"  className="btn btn--white btn--lg">📍 Find stores</Link>
            </div>
            <div className="hero__trust">
              {[['12K+','Happy pets'],['8,400','Products'],['98%','Satisfaction'],['24/7','Vet support']].map(([n,l],i,arr) => (
                <>
                  <div key={l} className="hero__trust-item">
                    <span className="hero__trust-item-num">{n}</span>
                    <span className="hero__trust-item-label">{l}</span>
                  </div>
                  {i<arr.length-1 && <div className="hero__trust-div" />}
                </>
              ))}
            </div>
          </div>
          <div className="hero__video-wrap">
            <video ref={videoRef} autoPlay muted loop playsInline
              poster="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&q=80">
              <source src="/videos/petoria-eco.mp4" type="video/mp4" />
            </video>
            <button ref={muteRef} className="hero__mute" onClick={toggleMute}>🔇</button>
          </div>
        </div>
      </div>
      <div className="hero__leaf">🌿</div>
    </section>
  );
}
