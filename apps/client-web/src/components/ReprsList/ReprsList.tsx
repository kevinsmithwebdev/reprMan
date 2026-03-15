import React, { FC } from 'react'
import Repr from 'components/ReprLine'
import { useL10n } from 'modules/Localization'
import { ReprsListProps } from './ReprsList.types'

const ReprsList: FC<ReprsListProps> = ({ reprs }) => {
  const { t } = useL10n()

  const hasReprs = !!reprs.length

  return (
    <div id="reprs-list-component">
      <p>{t('components.reprsList.reprsCount', { count: reprs.length })}</p>
      {hasReprs && reprs.map((r) => <Repr key={r.id} repr={r} />)}
    </div>
  )
}

export default ReprsList
