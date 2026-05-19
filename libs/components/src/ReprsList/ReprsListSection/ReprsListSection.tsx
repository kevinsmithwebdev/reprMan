import React, { type CSSProperties, FC } from 'react'
import ReprLine from '@reprman/components/ReprLine'
import { Repr } from '@reprman/types'

const sectionTitleStyle: CSSProperties = {
  maxWidth: 800,
  textTransform: 'uppercase',
}

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

export interface ReprsListSectionProps {
  sectionId: string
  title: string
  reprs: Repr[]
  marginTop?: boolean
}

const ReprsListSection: FC<ReprsListSectionProps> = ({
  sectionId,
  title,
  reprs,
  marginTop,
}) => (
  <section
    aria-labelledby={sectionId}
    style={{
      ...sectionStyle,
      marginTop: marginTop ? '16px' : undefined,
    }}
  >
    <h2
      id={sectionId}
      className="h6 text-muted fw-bold mb-0 text-center mx-auto px-1 w-100"
      style={sectionTitleStyle}
    >
      {title}
    </h2>
    {reprs.map((r) => (
      <div key={r.id} data-row-id={r.id}>
        <ReprLine repr={r} />
      </div>
    ))}
  </section>
)

export default ReprsListSection
