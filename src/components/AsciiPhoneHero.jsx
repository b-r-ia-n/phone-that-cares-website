// Placeholder for the ASCII phone animation.
// The real Three.js / ASCII render will go here later.
export default function AsciiPhoneHero() {
  return (
    <div className="ascii-phone-placeholder">
      ASCII phone animation goes here
      <style>{`
        .ascii-phone-placeholder {
          height: 200px;
          border: 1px dashed var(--border-subtle);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.95rem;
          margin-bottom: 2.5rem;
        }
      `}</style>
    </div>
  );
}
