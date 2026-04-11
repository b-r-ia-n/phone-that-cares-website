import { useState, useEffect, useCallback } from 'react';

export default function Carousel({ slides }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (delta) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const current = slides[index];
  const isVideo = current.type === 'video';

  return (
    <div className="carousel">
      <div className="carousel__frame">
        {isVideo ? (
          <video
            key={current.src}
            src={current.src}
            poster={current.poster}
            controls
            preload="metadata"
            playsInline
            className="carousel__video"
          />
        ) : (
          <img
            key={current.src}
            src={current.src}
            alt={current.caption}
            className="carousel__img"
            loading="lazy"
          />
        )}

        <button
          type="button"
          className="carousel__arrow carousel__arrow--prev"
          onClick={() => go(-1)}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          className="carousel__arrow carousel__arrow--next"
          onClick={() => go(1)}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      <div className="carousel__caption">
        <span className="carousel__count">
          {index + 1} / {count}
        </span>
        <span className="carousel__caption-text">{current.caption}</span>
      </div>

      <div className="carousel__dots" role="tablist">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`carousel__dot ${i === index ? 'carousel__dot--active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === index}
            role="tab"
          />
        ))}
      </div>

      <style>{`
        .carousel {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin: 0;
        }

        .carousel__frame {
          position: relative;
          background: rgba(43, 43, 34, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel__img,
        .carousel__video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          animation: carousel-fade 220ms ease;
        }

        .carousel__video {
          background: #000;
        }

        @keyframes carousel-fade {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }

        .carousel__arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
          background: var(--nav-bg);
          color: var(--text-primary);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0 3px 0;
          transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;
        }

        .carousel__arrow:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .carousel__arrow--prev { left: 12px; }
        .carousel__arrow--next { right: 12px; }

        .carousel__caption {
          display: flex;
          align-items: baseline;
          gap: 12px;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .carousel__count {
          font-feature-settings: 'tnum';
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          opacity: 0.7;
          flex-shrink: 0;
        }

        .carousel__caption-text {
          color: var(--text-primary);
        }

        .carousel__dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          padding-top: 4px;
        }

        .carousel__dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          border: none;
          background: var(--border-subtle);
          padding: 0;
          cursor: pointer;
          transition: background 150ms ease, transform 150ms ease;
        }

        .carousel__dot:hover {
          background: var(--accent-muted);
        }

        .carousel__dot--active {
          background: var(--accent);
          transform: scale(1.25);
        }

        @media (max-width: 640px) {
          .carousel__arrow {
            width: 32px;
            height: 32px;
            font-size: 18px;
          }
          .carousel__arrow--prev { left: 8px; }
          .carousel__arrow--next { right: 8px; }
        }
      `}</style>
    </div>
  );
}
