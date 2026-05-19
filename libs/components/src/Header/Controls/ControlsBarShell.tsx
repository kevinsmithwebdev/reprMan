import React, { CSSProperties, FC, ReactNode } from 'react'

export type ControlsBarShellVariant = 'homeRow' | 'reportsWrap'

const baseStyle: CSSProperties = {
  backgroundColor: '#444',
  padding: '5px 20px',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  boxShadow: '0 3px 3px rgba(64, 64, 64, 0.5)',
  color: '#d0d0d0',
}

const variantLayout: Record<ControlsBarShellVariant, CSSProperties> = {
  homeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: '8px',
  },
  reportsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
}

export interface ControlsBarShellProps {
  id: string
  variant: ControlsBarShellVariant
  className?: string
  /** Break out to viewport width so the bar matches the full-width header. */
  bleedFullViewport?: boolean
  /** Space below the bar (e.g. before scrolling list content). */
  marginBottomPx?: number
  children: ReactNode
}

const bleedWrapperStyle: CSSProperties = {
  width: '100vw',
  marginLeft: 'calc(50% - 50vw)',
  boxSizing: 'border-box',
}

const ControlsBarShell: FC<ControlsBarShellProps> = ({
  id,
  variant,
  className,
  bleedFullViewport,
  marginBottomPx,
  children,
}) => {
  const bar = (
    <div
      id={id}
      className={className}
      style={{
        ...baseStyle,
        ...variantLayout[variant],
        ...(!bleedFullViewport && marginBottomPx != null
          ? { marginBottom: marginBottomPx }
          : {}),
      }}
    >
      {children}
    </div>
  )

  if (bleedFullViewport) {
    return (
      <div
        style={{
          ...bleedWrapperStyle,
          ...(marginBottomPx != null ? { marginBottom: marginBottomPx } : {}),
        }}
      >
        {bar}
      </div>
    )
  }

  return bar
}

export default ControlsBarShell
