type PerforationProps = {
  /** `horizontal` cuts holes into the left and right edges; `vertical` into the top and bottom. */
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

// A page-coloured circle; a soft inner shadow makes it read as a cut-out against the light page
const HOLE =
  'absolute size-8 rounded-full border border-gray-200 bg-gray-50 shadow-[inset_0_2px_4px_rgb(0_0_0/0.12)]'

/**
 * A tear-off line with a half-circle hole cut into each end, like a paper ticket. Put it inside a
 * `relative overflow-hidden` card with a `border-gray-200` border on the `bg-gray-50` page: the
 * card clips away each hole's outer half. A vertical one stretches to the card's full height, so
 * use it as a direct child of a flex row.
 */
export function Perforation({ orientation = 'horizontal', className = '' }: PerforationProps) {
  if (orientation === 'vertical') {
    return (
      <div aria-hidden="true" className={`relative w-0 shrink-0 self-stretch ${className}`}>
        <div className="absolute inset-y-6 left-0 border-l-2 border-dashed border-gray-300" />
        <span className={`${HOLE} top-0 left-0 -translate-x-1/2 -translate-y-1/2`} />
        <span className={`${HOLE} bottom-0 left-0 -translate-x-1/2 translate-y-1/2`} />
      </div>
    )
  }

  return (
    <div aria-hidden="true" className={`relative h-0 ${className}`}>
      <div className="mx-6 border-t-2 border-dashed border-gray-300" />
      <span className={`${HOLE} top-0 -left-4 -translate-y-1/2`} />
      <span className={`${HOLE} top-0 -right-4 -translate-y-1/2`} />
    </div>
  )
}
