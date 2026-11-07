import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { LOCALES, localeNames, setLocale, useCommonMessages, useLocale, type Locale } from '@/shared/i18n'

// Inline SVG flags: emoji flags don't render on Windows
const flags: Record<Locale, ReactNode> = {
  kk: (
    <svg viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#00AFCA" />
      <circle cx="15" cy="9" r="3.6" fill="#FEC50C" />
      <path d="M10.5 14.5q4.5 2 9 0" stroke="#FEC50C" strokeWidth="1.2" fill="none" />
      <rect x="2" y="2" width="1.6" height="16" fill="#FEC50C" opacity="0.8" />
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#fff" />
      <rect y="6.67" width="30" height="6.67" fill="#0039A6" />
      <rect y="13.33" width="30" height="6.67" fill="#D52B1E" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id="uk-clip">
        <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30m0-30L0 30" clipPath="url(#uk-clip)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  ),
}

function Flag({ locale }: { locale: Locale }) {
  return (
    <span className="inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10 [&>svg]:size-full">
      {flags[locale]}
    </span>
  )
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useCommonMessages()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open) list.current?.focus()
  }, [open])

  const show = () => {
    setActive(LOCALES.indexOf(locale))
    setOpen(true)
  }

  const choose = (next: Locale) => {
    setLocale(next)
    setOpen(false)
    button.current?.focus()
  }

  const onButtonKeyDown = (event: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      show()
    }
  }

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = LOCALES.length - 1
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(i + 1, last)),
      ArrowUp: () => setActive((i) => Math.max(i - 1, 0)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(LOCALES[active]),
      ' ': () => choose(LOCALES[active]),
      Escape: () => {
        setOpen(false)
        button.current?.focus()
      },
      Tab: () => setOpen(false),
    }
    const move = moves[event.key]
    if (!move) return
    if (event.key !== 'Tab') event.preventDefault()
    move()
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${t.language}: ${localeNames[locale]}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onButtonKeyDown}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white py-1 pr-2 pl-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <Flag locale={locale} />
        <span lang={locale}>{localeNames[locale]}</span>
        <span aria-hidden="true" className={`text-xs text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={t.language}
          aria-activedescendant={`${id}-${LOCALES[active]}`}
          onKeyDown={onListKeyDown}
          className="absolute right-0 z-20 mt-1 min-w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg focus:outline-none"
        >
          {LOCALES.map((option, index) => (
            <li
              key={option}
              id={`${id}-${option}`}
              role="option"
              lang={option}
              aria-selected={option === locale}
              onClick={() => choose(option)}
              onPointerMove={() => setActive(index)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm ${
                index === active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Flag locale={option} />
              <span className="flex-1">{localeNames[option]}</span>
              {option === locale && (
                <span aria-hidden="true" className="text-indigo-600">
                  ✓
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
