'use client'

import { useRef, useState } from 'react'
import type { ReactNode, FormEvent } from 'react'

type ConfirmableFormProps = {
  action: (formData: FormData) => void
  children: ReactNode
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  className?: string
  encType?: string
}

export default function ConfirmableForm({
  action,
  children,
  title,
  description,
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
  className,
  encType,
}: ConfirmableFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const confirmRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (confirmRef.current) {
      confirmRef.current = false
      return
    }
    const form = formRef.current
    if (form && !form.checkValidity()) {
      form.reportValidity()
      return
    }
    event.preventDefault()
    setIsOpen(true)
  }

  const handleConfirm = () => {
    confirmRef.current = true
    setIsOpen(false)
    const form = formRef.current
    if (!form) return
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit()
    } else {
      form.submit()
    }
  }

  return (
    <>
      <form
        ref={formRef}
        action={action}
        onSubmit={handleSubmit}
        className={className}
        encType={encType}
      >
        {children}
      </form>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h3 className="text-2xl font-bebas uppercase text-black">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                {description}
              </p>
            )}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-10 px-4 rounded-lg border border-[#DDDDDD] text-sm uppercase"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-10 px-5 rounded-lg bg-black text-white text-sm uppercase"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
