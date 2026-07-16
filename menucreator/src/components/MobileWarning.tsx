import { useEffect, useState } from "react";

const STORAGE_KEY = "mobile-warning-dismissed";

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < 768 ||
    ("ontouchstart" in window && window.innerWidth < 1024)
  );
}

export function MobileWarning() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed && isMobile()) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={overlayStyle} onClick={dismiss}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={iconStyle}>⚠️</div>
        <p style={messageStyle}>
          This site is not optimized for mobile devices. Please use a desktop
          browser for the best experience.
        </p>
        <button style={buttonStyle} onClick={dismiss}>
          Continue Anyway
        </button>
      </div>
    </div>
  );
}

/* ---- Inline styles (theme via CSS vars) ---- */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--overlay)",
  backdropFilter: "blur(4px)",
};

const modalStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--surface-active)",
  borderRadius: "var(--radius-lg)",
  padding: 32,
  maxWidth: 380,
  width: "90vw",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};

const iconStyle: React.CSSProperties = {
  fontSize: 40,
  lineHeight: 1,
};

const messageStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "var(--text)",
  margin: 0,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "8px 24px",
  borderRadius: "var(--radius-md)",
  background: "var(--accent)",
  color: "var(--bg)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  transition: "background var(--transition-fast)",
};
