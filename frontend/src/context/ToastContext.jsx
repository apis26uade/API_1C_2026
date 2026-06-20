import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CheckCircleIcon, XIcon } from '../components/Icons.jsx'

const ToastContext = createContext(null)
const TOAST_DURATION_MS = 4200

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.variant}`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
        >
          <span className="toast-icon" aria-hidden="true">
            {toast.variant === 'success' ? <CheckCircleIcon size={20} /> : <XIcon size={18} />}
          </span>
          <p>{toast.message}</p>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificacion"
          >
            <XIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

function ConfirmDialog({ dialog, onCancel, onConfirm }) {
  if (!dialog) return null

  return (
    <div className="confirm-overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{dialog.title}</h2>
        <p id="confirm-message">{dialog.message}</p>
        <div className="confirm-actions">
          <button className="button secondary" type="button" onClick={onCancel}>
            {dialog.cancelLabel}
          </button>
          <button
            className={dialog.destructive ? 'button danger' : 'button primary'}
            type="button"
            onClick={onConfirm}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirm, setConfirm] = useState(null)
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, variant = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [...current, { id, message, variant }])
      const timer = setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
      timersRef.current.set(id, timer)
    },
    [dismissToast],
  )

  const confirmAction = useCallback(
    ({
      title = 'Confirmar accion',
      message,
      confirmLabel = 'Confirmar',
      cancelLabel = 'Cancelar',
      destructive = false,
    }) =>
      new Promise((resolve) => {
        setConfirm({
          title,
          message,
          confirmLabel,
          cancelLabel,
          destructive,
          resolve,
        })
      }),
    [],
  )

  const handleConfirm = useCallback(() => {
    confirm?.resolve(true)
    setConfirm(null)
  }, [confirm])

  const handleCancel = useCallback(() => {
    confirm?.resolve(false)
    setConfirm(null)
  }, [confirm])

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    },
    [],
  )

  const value = useMemo(
    () => ({
      showToast,
      toastSuccess: (message) => showToast(message, 'success'),
      toastError: (message) => showToast(message, 'error'),
      confirmAction,
    }),
    [confirmAction, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog dialog={confirm} onConfirm={handleConfirm} onCancel={handleCancel} />
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}
