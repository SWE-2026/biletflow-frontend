import { useState, type FormEvent, type ReactNode } from 'react'
import { useCommonMessages } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'

type SearchFormProps = {
  label: string
  placeholder?: string
  initial: string
  onSearch: (query: string) => void
  children?: ReactNode
}

export function SearchForm({ label, placeholder, initial, onSearch, children }: SearchFormProps) {
  const t = useCommonMessages()
  const [query, setQuery] = useState(initial)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(query.trim())
  }

  return (
    <form role="search" onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <TextField
        type="search"
        label={label}
        placeholder={placeholder}
        value={query}
        maxLength={100}
        onChange={(event) => setQuery(event.target.value)}
        className="min-w-56 flex-1"
      />
      {children}
      <Button type="submit" variant="secondary">
        {t.search}
      </Button>
    </form>
  )
}
