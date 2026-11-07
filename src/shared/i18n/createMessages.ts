import type { ReactNode } from 'react'
import { getLocale, useLocale, type Locale } from './locale'

/** A plain string, or a function for messages with values (and plural forms). */
type Message = string | ((...args: never[]) => ReactNode)

export type MessageShape = Record<string, Message>

/**
 * English is the source: its keys and function signatures are inferred, and every other
 * locale must provide exactly the same, so a missing translation fails the type check.
 */
export type Dictionary<M extends MessageShape> = { en: M } & Record<Exclude<Locale, 'en'>, NoInfer<M>>

/**
 * Creates a hook that returns a slice's messages in the current language.
 *
 *     const useMessages = createMessages({ en: { title: 'Events' }, ru: { ... }, kk: { ... } })
 *     const t = useMessages()  // t.title
 */
export function createMessages<M extends MessageShape>(dictionary: Dictionary<M>) {
  return function useMessages(): M {
    return dictionary[useLocale()]
  }
}

/** Messages in the current language outside React, e.g. in plain functions. */
export function pickMessages<M extends MessageShape>(dictionary: Dictionary<M>): M {
  return dictionary[getLocale()]
}
