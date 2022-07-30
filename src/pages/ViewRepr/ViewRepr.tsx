import React from 'react'
import CategoryPills from 'components/CategoryPills'
import { CategoryPillSize } from 'components/CategoryPills/CategoryPills'
import ReprButton, { ReprButtonType } from 'components/ReprButton'
import { MAX_PRACTICED_DATES } from 'constants/index'
import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { Card } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useReprs } from 'state/reprs'
import { getDateAndFrom } from 'utilities/dates'
import { useL10n } from 'modules/Localization'
import { getPracticedStr } from './ViewRepr.helpers'

const ViewRepr = () => {
  const { id = '' } = useParams()
  const { getRepr } = useReprs()
  const navigate = useNavigate()

  const repr = getRepr(id)

  // FIXME: better way?
  if (!repr) {
    navigate('/', { replace: true })
    return null
  }

  const { title, categories, dateCreated, datesPracticed, comment } = repr

  const practicedStr = getPracticedStr(datesPracticed)

  const { t } = useL10n()

  return (
    <Card
      style={{
        margin: '5px',
        padding: '5px',
        backgroundColor: '#f6f6f6',
        maxWidth: '600px',
      }}
    >
      <Card.Title>{t('pages.viewRepr.title')}</Card.Title>

      {renderCardBody(t('pages.viewRepr.data.title'), title)}

      {renderCardBody(
        t('pages.viewRepr.data.categories'),
        categories.length ? undefined : t('pages.viewRepr.data.noCategories'),
        categories.length ? (
          <CategoryPills
            categories={categories}
            containerStyle={{ paddingTop: '15px' }}
            size={CategoryPillSize.MEDIUM}
          />
        ) : undefined
      )}

      {renderCardBody(
        t('pages.viewRepr.data.comment'),
        comment || t('pages.viewRepr.data.noComment')
      )}

      {renderCardBody(
        t('pages.viewRepr.data.dateCreated'),
        getDateAndFrom(dateCreated)
      )}

      {renderCardBody(
        t('pages.viewRepr.data.datesPracticed'),
        t('pages.viewRepr.data.noteMaxRepr', { max: MAX_PRACTICED_DATES }),
        <div style={Style.datesPracticedWrapper}>
          {datesPracticed.map((d: number) => (
            <Card.Text key={d} style={Style.dataWrapper}>
              {getDateAndFrom(d)}
            </Card.Text>
          ))}
        </div>
      )}

      {!!practicedStr &&
        renderCardBody(t('pages.viewRepr.data.practiceData'), practicedStr)}

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <ReprButton
          type={ReprButtonType.EDIT}
          actionData={{ selection: ModalSelection.EDIT_REPR, props: { id } }}
          style={{ flex: 1, margin: '5px', minWidth: '400px' }}
        />

        <ReprButton
          type={ReprButtonType.DELETE}
          actionData={id}
          style={{ flex: 1, margin: '5px', minWidth: '400px' }}
        />

        <ReprButton
          type={ReprButtonType.PRACTICED}
          actionData={id}
          style={{ flex: 1, margin: '5px', minWidth: '400px' }}
        />
      </div>
    </Card>
  )
}

export default ViewRepr

const renderCardBody = (title: string, text?: string, component?: any) => (
  <Card.Body>
    <Card.Subtitle>{title}:</Card.Subtitle>
    {!!component && component}
    {!!text && <Card.Text>{text}</Card.Text>}
  </Card.Body>
)

const Style = {
  header: {
    backgroundColor: '#bbb',
    borderRadius: '5px',
    margin: '0 auto',
    padding: '5px',
  },
  sectionHeaders: {
    color: '#222',
    padding: '5px',
    margin: '5px 0',
    display: 'inline-grid',
    borderRadius: '5px',
    backgroundColor: '#ddd',
  },
  dataWrapper: {
    padding: '0 5px',
    margin: '0',
  },
  datesPracticedWrapper: {
    backgroundColor: '#eee',
    maxHeight: '200px',
    width: '400px',
    margin: '10px 0',
  },
}
