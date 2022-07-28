import React, { FC } from 'react'
import Repr from 'components/ReprLine'
import { useL10n } from 'modules/Localization'
import { ReprsListProps } from './ReprsList.types'

const ReprsList: FC<ReprsListProps> = ({ reprs }) => {
  const { t } = useL10n()

  const hasReprs = !!reprs.length

  return (
    <div>
      {hasReprs ? (
        reprs.map((r) => <Repr key={r.id} repr={r} />)
      ) : (
        <p style={{ padding: '15px' }}>{t('components.reprsList.noReprs')}</p>
      )}
    </div>
  )
}

export default ReprsList
