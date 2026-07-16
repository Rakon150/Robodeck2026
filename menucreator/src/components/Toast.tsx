import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={containerStyle}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ ...toastStyle, ...getToastStyle(toast.type) }}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

function getToastStyle(type: ToastType): React.CSSProperties {
  switch (type) {
    case "success": return { background: "#a6e3a1", color: "#1e1e2e" };
    case "error": return { background: "#f38ba8", color: "#1e1e2e" };
    case "warning": return { background: "#f9e2af", color: "#1e1e2e" };
    case "info": return { background: "#89b4fa", color: "#1e1e2e" };
  }
}

const containerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  zIndex: 10000,
  pointerEvents: "none",
};

const toastStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  animation: "toast-in 0.3s ease",
  pointerEvents: "auto",
};
