import { Link } from "react-router-dom";

export function CrystalMark({ size = 28 }) {
  return (
    <svg
      className="mark"
      width={size}
      height={size}
      viewBox="0 0 52 52"
      aria-hidden="true"
    >
      <polygon
        points="26,4 40,12 44,26 40,40 26,48 12,40 8,26 12,12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.9"
      />
      <polygon
        points="26,10 36,16 39,26 36,36 26,42 16,36 13,26 16,16"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
      />
      <circle cx="26" cy="26" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function AuthChrome({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-shell-top">
        <CrystalMark size={22} />
        <span className="word">SOLSTEIN</span>
      </div>

      <main className="auth-shell-body">{children}</main>

      <footer className="auth-shell-foot">
        <span>© 2026 Solstein</span>
        <div className="links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <a href="https://status.solstein.app" target="_blank" rel="noopener noreferrer">
            Status
          </a>
        </div>
      </footer>
    </div>
  );
}
