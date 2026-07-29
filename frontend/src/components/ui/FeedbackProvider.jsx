import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { FeedbackContext } from './feedbackContext'

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmation, setConfirmation] = useState(null)
  const sequence = useRef(0)
  const activeMessages = useRef(new Set())

  const dismissToast = useCallback((id) => {
    setToasts((current) => {
      const dismissed = current.find((toast) => toast.id === id)
      if (dismissed) activeMessages.current.delete(`${dismissed.type}:${dismissed.message}`)
      return current.filter((toast) => toast.id !== id)
    })
  }, [])

  const toast = useCallback((message, type = 'info') => {
    const normalizedMessage = String(message)
    const messageKey = `${type}:${normalizedMessage}`
    const isPasswordResetWarning = /change your temporary password/i.test(normalizedMessage)
    if (activeMessages.current.has(messageKey)) return null
    if (isPasswordResetWarning && sessionStorage.getItem('zonal:temporary-password-warning-shown') === 'true') return null
    activeMessages.current.add(messageKey)
    if (isPasswordResetWarning) sessionStorage.setItem('zonal:temporary-password-warning-shown', 'true')
    const id = ++sequence.current
    setToasts((current) => [...current.slice(-3), { id, message: normalizedMessage, type }])
    window.setTimeout(() => dismissToast(id), 4500)
    return id
  }, [dismissToast])

  const confirm = useCallback((options) => new Promise((resolve) => {
    setConfirmation({
      title: 'Please confirm',
      message: '',
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      tone: 'danger',
      ...(typeof options === 'string' ? { message: options } : options),
      resolve,
    })
  }), [])

  const closeConfirmation = useCallback((result) => {
    setConfirmation((current) => {
      current?.resolve(result)
      return null
    })
  }, [])

  useEffect(() => {
    const originalAlert = window.alert
    window.alert = (message) => {
      const text = String(message || '')
      const isError = /error|unable|failed|invalid|required|please|cannot|must|temporary password|larger|smaller/i.test(text)
      toast(text, isError ? 'error' : 'success')
    }
    return () => { window.alert = originalAlert }
  }, [toast])

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite">
        {toasts.map((item) => <Toast key={item.id} toast={item} onClose={() => dismissToast(item.id)} />)}
      </div>
      {confirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => closeConfirmation(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${confirmation.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <h2 id="confirmation-title" className="text-xl font-black text-slate-900">{confirmation.title}</h2>
            <p className="mt-2 leading-6 text-slate-600">{confirmation.message}</p>
            <div className="mt-7 flex justify-end gap-3">
              <button onClick={() => closeConfirmation(false)} className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">{confirmation.cancelLabel}</button>
              <button autoFocus onClick={() => closeConfirmation(true)} className={`rounded-xl px-5 py-3 font-bold text-white ${confirmation.tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{confirmation.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}

function Toast({ toast, onClose }) {
  const styles = {
    success: ['border-emerald-200', 'text-emerald-600', CheckCircle2],
    error: ['border-red-200', 'text-red-600', XCircle],
    warning: ['border-amber-200', 'text-amber-600', AlertTriangle],
    info: ['border-blue-200', 'text-blue-600', Info],
  }
  const [border, color, Icon] = styles[toast.type] || styles.info
  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${border} bg-white p-4 shadow-xl`}>
      <Icon className={`mt-0.5 shrink-0 ${color}`} size={20} />
      <p className="flex-1 text-sm font-semibold leading-5 text-slate-700">{toast.message}</p>
      <button onClick={onClose} aria-label="Dismiss notification" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={16} /></button>
    </div>
  )
}
