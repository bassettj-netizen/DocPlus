import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Tooltip, tooltipPlacements } from '@goat-ui/goat-ui-core'

interface TruncatedCellProps {
  /** Full value shown in the tooltip — the table's own CSS already forces
   *  the cell to one line and ellipsis-truncates it visually. */
  title: string
  children: ReactNode
}

// Used for the one column long enough to actually overflow its cell
// (Template Name) — the surrounding `.back-office-table` CSS keeps every
// cell to a single line; this adds the "full value on hover" half of that,
// but only when the text is actually cut off (not on every short value).
export default function TruncatedCell({ title, children }: TruncatedCellProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const checkTruncation = () => setIsTruncated(el.scrollWidth > el.clientWidth)
    checkTruncation()

    // The table's column widths can change (sidebar collapse, window
    // resize), so truncation is re-checked whenever this cell's box does.
    const observer = new ResizeObserver(checkTruncation)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    // Tooltip always wraps the same span (rather than only mounting it once
    // truncated) so the measured node is never unmounted/remounted — doing
    // that previously fed the ResizeObserver a detached 0×0 node, which
    // silently reset `isTruncated` back to false. `visible={false}` forces
    // it hidden for non-truncated cells instead; `undefined` when truncated
    // falls back to the Tooltip's own hover-triggered display.
    <Tooltip title={title} placement={tooltipPlacements.TOP} visible={isTruncated ? undefined : false}>
      <span ref={ref} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </Tooltip>
  )
}
