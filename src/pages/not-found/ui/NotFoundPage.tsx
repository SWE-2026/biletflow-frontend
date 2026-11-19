import { Link } from 'react-router'
import { useNotFoundMessages } from '../i18n/messages'

export function NotFoundPage() {
  const t = useNotFoundMessages()

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <p className="text-sm font-semibold text-indigo-600">{t.code}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{t.title}</h1>
      <p className="mt-3 text-gray-600">{t.hint}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.home}
        </Link>
        <Link
          to="/events"
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t.browse}
        </Link>
      </div>
    </div>
  )
}
