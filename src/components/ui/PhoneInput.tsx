'use client'

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
  id?: string
  name?: string
}

/**
 * Ukrainian phone field with a fixed, non-editable "+380" prefix — the user only
 * types the 9 subscriber digits. `value`/`onChange` work with the FULL number
 * ("+380XXXXXXXXX", or "" when empty), so callers don't change their state shape.
 */
export default function PhoneInput({ value, onChange, required, className = '', id, name }: PhoneInputProps) {
  // Strip an existing +380 / 380 prefix and keep up to 9 subscriber digits.
  const subscriber = (value || '').replace(/^\+?380/, '').replace(/\D/g, '').slice(0, 9)

  return (
    <div
      className={`flex items-stretch w-full h-[50px] border border-[#BBBBBB] rounded-lg overflow-hidden focus-within:border-[#6046A3] transition-colors ${className}`}
    >
      <span className="flex items-center px-3 bg-[#F8F7FB] text-[#666] text-[16px] font-gilroy border-r border-[#BBBBBB] select-none">
        +380
      </span>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        value={subscriber}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
          onChange(digits ? `+380${digits}` : '')
        }}
        placeholder="XX XXX XX XX"
        className="flex-1 min-w-0 px-4 font-gilroy text-[16px] outline-none bg-transparent"
      />
    </div>
  )
}
