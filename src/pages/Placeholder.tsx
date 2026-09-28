import { useParams } from 'react-router'

type PlaceholderProps = {
  title: string
}

export default function Placeholder({ title }: PlaceholderProps) {
  const params = useParams()
  const entries = Object.entries(params)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {entries.length > 0 && (
        <dl className="mt-4 text-sm text-gray-500">
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt className="inline font-medium">{key}:</dt>{' '}
              <dd className="inline">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
