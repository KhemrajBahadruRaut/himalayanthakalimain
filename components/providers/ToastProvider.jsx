"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

const toastToneClassMap = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-slate-200 bg-white text-slate-800",
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const confirmResolverRef = useRef(null);
  const toastRef = useRef(null);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const clearToastTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resolveConfirm = useCallback((confirmed) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(confirmed);
      confirmResolverRef.current = null;
    }
  }, []);

  const closeToast = useCallback(
    (confirmed = false) => {
      clearToastTimer();
      if (toastRef.current?.kind === "confirm") {
        resolveConfirm(confirmed);
      }
      setToast(null);
    },
    [clearToastTimer, resolveConfirm]
  );

  const showToast = useCallback(
    (message, type = "info", options = {}) => {
      if (!message) return;
      const duration = options.duration ?? 3500;

      clearToastTimer();
      resolveConfirm(false);
      setToast({ kind: "message", message, type });

      if (duration > 0) {
        timerRef.current = window.setTimeout(() => {
          setToast(null);
          timerRef.current = null;
        }, duration);
      }
    },
    [clearToastTimer, resolveConfirm]
  );

  const showConfirm = useCallback(
    (message, options = {}) => {
      if (!message) return Promise.resolve(false);

      const {
        type = "warning",
        confirmLabel = "Confirm",
        cancelLabel = "Cancel",
      } = options;

      clearToastTimer();
      resolveConfirm(false);

      return new Promise((resolve) => {
        confirmResolverRef.current = resolve;
        setToast({
          kind: "confirm",
          message,
          type,
          confirmLabel,
          cancelLabel,
        });
      });
    },
    [clearToastTimer, resolveConfirm]
  );

  useEffect(
    () => () => {
      clearToastTimer();
      resolveConfirm(false);
    },
    [clearToastTimer, resolveConfirm]
  );

  const value = useMemo(
    () => ({
      showToast,
      showConfirm,
      closeToast,
    }),
    [showToast, showConfirm, closeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role={toast.kind === "confirm" ? "alertdialog" : "status"}
          aria-live="polite"
          className="fixed right-4 top-4 z-1000 w-[calc(100%-2rem)] max-w-sm"
        >
          <div
            className={`rounded-xl border px-4 py-3 shadow-xl ${toastToneClassMap[toast.type] || toastToneClassMap.info}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="leading-relaxed">{toast.message}</p>
              {toast.kind !== "confirm" ? (
                <button
                  type="button"
                  onClick={() => closeToast(false)}
                  className="rounded-md px-1.5 text-base leading-none text-current opacity-70 transition hover:bg-black/5 hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  x
                </button>
              ) : null}
            </div>

            {toast.kind === "confirm" ? (
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => closeToast(false)}
                  className="rounded-md border border-current/20 px-3 py-1.5 text-xs font-semibold text-current opacity-90 transition hover:bg-black/5 hover:opacity-100"
                >
                  {toast.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => closeToast(true)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white transition ${
                    toast.type === "error"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {toast.confirmLabel}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
