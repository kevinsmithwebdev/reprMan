import React from 'react'
import CategoryPills from '@reprman/components/CategoryPills'
import { CategoryPillSize } from '@reprman/components/CategoryPills/CategoryPills'
import ReprButton, { ReprButtonType } from '@reprman/components/ReprButton'
import { MAX_PRACTICED_DATES } from '@reprman/constants'
import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import { Button, Card } from 'react-bootstrap'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useReprs } from '@reprman/state/reprs'
import { getDateAndFrom } from '@reprman/utilities'
import { useL10n } from '@reprman/localization'
import { getPracticedStr } from './ViewRepr.helpers'

const ViewRepr = () => {
  const { id = '' } = useParams()
  const { getRepr } = useReprs()
  const navigate = useNavigate()
  const { t } = useL10n()

  const repr = getRepr(id)

  if (!repr) {
    return <Navigate to="/" replace />
  }

  const { title, categories, dateCreated, datesPracticed, comment, learning } =
    repr

  const practicedStr = getPracticedStr(datesPracticed, t)

  return (
    <div className="app-page-padded">
      <Card
        style={{
          padding: '16px',
          backgroundColor: '#f6f6f6',
          maxWidth: '600px',
          margin: '0 auto',
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
          t('pages.viewRepr.data.learning'),
          learning
            ? t('pages.viewRepr.data.learningYes')
            : t('pages.viewRepr.data.learningNo')
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ReprButton
            type={ReprButtonType.EDIT}
            actionData={{ selection: ModalSelection.EDIT_REPR, props: { id } }}
            style={{ width: '100%' }}
          />

          <ReprButton
            type={ReprButtonType.DELETE}
            actionData={id}
            style={{ width: '100%' }}
          />
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            style={{ width: '100%' }}
          >
            {t('buttons.back')}
          </Button>
        </div>
      </Card>
    </div>
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
