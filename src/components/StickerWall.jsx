import { useState } from 'react';

const EMAIL = 'hello@example.com';

const STICKERS = [
  {
    id: 'read',
    title: 'You should read ___',
    subtext:
      'Book, paper, article, blog post — anything that shaped your thinking on attention or technology.',
    color: '#EFE6D3',
    rotation: -2.5,
  },
  {
    id: 'interesting',
    title: "You'd find ___ interesting",
    subtext:
      'A project, product, person, or community working on related ideas.',
    color: '#D8E2CE',
    rotation: 1.8,
  },
  {
    id: 'talk',
    title: 'You should talk to me — I\u2019m ___',
    subtext:
      'Introduce yourself. Tell me what you work on and where to find you.',
    color: '#D3DDDA',
    rotation: -1.2,
  },
  {
    id: 'missing',
    title: "The thing you're missing is ___",
    subtext: "Constructive criticism welcome. What's the blind spot?",
    color: '#E6D9B8',
    rotation: 2.8,
  },
  {
    id: 'skill',
    title: 'I have a skill that could help: ___',
    subtext:
      'Developer, designer, researcher, writer, filmmaker, organizer — all useful.',
    color: '#E5D0BF',
    rotation: -2.2,
  },
  {
    id: 'use',
    title: "I'd use this if it ___",
    subtext:
      'What would make this real for you? What feature or framing would make you pay attention?',
    color: '#D8DEE0',
    rotation: 1.4,
  },
];

export default function StickerWall() {
  const [openId, setOpenId] = useState(null);
  const [text, setText] = useState('');

  function openSticker(id) {
    setOpenId(id);
    setText('');
  }

  function closeSticker(e) {
    e?.stopPropagation?.();
    setOpenId(null);
    setText('');
  }

  function send(sticker, e) {
    e?.stopPropagation?.();
    const trimmed = text.trim();
    if (!trimmed) return;
    const filledTitle = sticker.title.replace('___', trimmed.slice(0, 80));
    const subject = `[Phone That Cares] ${filledTitle}`;
    const body = `${sticker.title}\n\n${trimmed}\n`;
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <div className="sticker-wall">
      {STICKERS.map((s) => {
        const isOpen = openId === s.id;
        return (
          <div
            key={s.id}
            className={`sticker ${isOpen ? 'sticker--open' : ''}`}
            style={{
              '--sticker-bg': s.color,
              '--sticker-rot': `${s.rotation}deg`,
            }}
            onClick={() => !isOpen && openSticker(s.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
                e.preventDefault();
                openSticker(s.id);
              }
            }}
          >
            <h3 className="sticker__title">{s.title}</h3>
            <p className="sticker__subtext">{s.subtext}</p>

            {isOpen && (
              <div
                className="sticker__form"
                onClick={(e) => e.stopPropagation()}
              >
                <textarea
                  className="sticker__textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Fill in the blank…"
                  rows={3}
                  autoFocus
                />
                <div className="sticker__actions">
                  <button
                    type="button"
                    className="sticker__btn sticker__btn--ghost"
                    onClick={closeSticker}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="sticker__btn sticker__btn--primary"
                    onClick={(e) => send(s, e)}
                    disabled={!text.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .sticker-wall {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px 24px;
          padding: 24px 4px 40px;
        }

        @media (max-width: 820px) {
          .sticker-wall {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 520px) {
          .sticker-wall {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .sticker {
          background-color: var(--sticker-bg);
          transform: rotate(var(--sticker-rot));
          padding: 22px 22px 20px;
          border-radius: 4px;
          box-shadow:
            0 1px 2px rgba(43, 43, 34, 0.08),
            0 8px 20px -10px rgba(43, 43, 34, 0.22);
          cursor: pointer;
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .sticker:hover {
          transform: rotate(0deg) translateY(-2px);
          box-shadow:
            0 2px 4px rgba(43, 43, 34, 0.1),
            0 14px 28px -12px rgba(43, 43, 34, 0.28);
        }

        .sticker--open,
        .sticker--open:hover {
          transform: rotate(0deg);
          cursor: default;
          grid-column: span 2;
          box-shadow:
            0 4px 8px rgba(43, 43, 34, 0.12),
            0 20px 40px -16px rgba(43, 43, 34, 0.3);
        }

        @media (max-width: 820px) {
          .sticker--open,
          .sticker--open:hover {
            grid-column: span 2;
          }
        }

        @media (max-width: 520px) {
          .sticker--open,
          .sticker--open:hover {
            grid-column: span 1;
          }
        }

        .sticker__title {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 600;
          font-size: 1.05rem;
          line-height: 1.3;
          color: #2B2B22;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .sticker__subtext {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.82rem;
          line-height: 1.5;
          color: rgba(43, 43, 34, 0.68);
          margin: 0;
          max-width: none;
        }

        .sticker__form {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sticker__textarea {
          width: 100%;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.92rem;
          line-height: 1.5;
          color: #2B2B22;
          background-color: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(43, 43, 34, 0.18);
          border-radius: 3px;
          padding: 10px 12px;
          resize: vertical;
          outline: none;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .sticker__textarea:focus {
          border-color: rgba(43, 43, 34, 0.45);
          background-color: rgba(255, 255, 255, 0.75);
        }

        .sticker__actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .sticker__btn {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .sticker__btn--ghost {
          background: transparent;
          color: rgba(43, 43, 34, 0.6);
          border-color: rgba(43, 43, 34, 0.18);
        }

        .sticker__btn--ghost:hover {
          color: #2B2B22;
          border-color: rgba(43, 43, 34, 0.4);
        }

        .sticker__btn--primary {
          background: #2B2B22;
          color: var(--sticker-bg);
          border-color: #2B2B22;
        }

        .sticker__btn--primary:hover:not(:disabled) {
          background: #000;
        }

        .sticker__btn--primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
