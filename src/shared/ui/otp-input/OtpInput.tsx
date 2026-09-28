import {
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'

type OtpInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  /** Called once every box is filled, with the full code. */
  onComplete?: (value: string) => void
  length?: number
  error?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function OtpInput({
  label,
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  disabled = false,
  autoFocus = false,
}: OtpInputProps) {
  const errorId = useId()
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  // Return focus after a failed attempt (boxes are usually disabled while checking).
  // A new error is the trigger; the first empty box is where focus goes.
  const firstEmpty = Math.min(value.length, length - 1)
  useEffect(() => {
    if (error && !disabled) inputs.current[firstEmpty]?.focus()
  }, [error, disabled, firstEmpty])

  // Set while we move focus ourselves, so the focus guard below doesn't fight it
  // with a `value` that hasn't re-rendered yet
  const steering = useRef(false)

  const focusBox = (index: number) => {
    const box = inputs.current[Math.max(0, Math.min(index, length - 1))]
    steering.current = true
    box?.focus()
    box?.select()
    steering.current = false
  }

  // Digits are kept contiguous: writing at `index` replaces from there on
  const insert = (index: number, raw: string) => {
    const incoming = raw.replace(/\D/g, '')
    if (!incoming) return
    const next = (value.slice(0, index) + incoming + value.slice(index + incoming.length)).slice(0, length)
    onChange(next)
    focusBox(index + incoming.length)
    if (next.length === length) onComplete?.(next)
  }

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    insert(index, event.target.value)
  }

  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    insert(index, event.clipboardData.getData('text'))
  }

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const target = digits[index] ? index : index - 1
      if (target < 0) return
      onChange(value.slice(0, target) + value.slice(target + 1))
      focusBox(target)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(Math.min(index + 1, value.length))
    }
  }

  // Never let focus land past the first empty box, so there are no gaps
  const handleFocus = (index: number) => () => {
    if (steering.current) return
    if (index > value.length) focusBox(value.length)
    else inputs.current[index]?.select()
  }

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-medium text-gray-900">{label}</legend>
      <div className="mt-1.5 flex gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            autoFocus={autoFocus && index === 0}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            value={digit}
            onChange={handleChange(index)}
            onPaste={handlePaste(index)}
            onKeyDown={handleKeyDown(index)}
            onFocus={handleFocus(index)}
            className={`size-12 min-w-0 rounded-md border text-center text-xl font-semibold text-gray-900 tabular-nums focus:outline-2 focus:outline-offset-0 disabled:bg-gray-50 disabled:text-gray-500 ${
              error
                ? 'border-red-600 focus:outline-red-600'
                : 'border-gray-300 focus:border-indigo-600 focus:outline-indigo-600'
            }`}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </fieldset>
  )
}
