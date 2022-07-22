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
import { getPracticedStr } from './ViewRepr.helpers'

const ViewRepr = () => {
  const { id = '' } = useParams()
  const { getRepr } = useReprs()
  const navigate = useNavigate()

  const repr = getRepr(id)

  // FIXME: better way?
  if (!repr) {
    navigate('/', {replace: true})
    return null
  }

  const { title, categories, dateCreated, datesPracticed, comment } = repr

  const practicedStr = getPracticedStr(datesPracticed)

  return (
    <Card style={{ margin: '5px', padding: '5px', backgroundColor: '#f6f6f6' }}>
      <Card.Title>View Repr</Card.Title>
      {renderCardBody('Title', title)}

      {renderCardBody(
        'Categories',
        undefined,
        <CategoryPills
          categories={categories}
          containerStyle={{ paddingTop: '15px' }}
          size={CategoryPillSize.MEDIUM}
        />
      )}

      {renderCardBody('Comment', comment || '[No comment]')}

      {renderCardBody('Date Created', getDateAndFrom(dateCreated))}

      {renderCardBody(
        'Dates Practiced',
        `Note that we only store the last ${MAX_PRACTICED_DATES} practices for a repr.`,
        <div style={Style.datesPracticedWrapper}>
          {datesPracticed.map((d: number) => (
            <Card.Text key={d} style={Style.dataWrapper}>
              {getDateAndFrom(d)}
            </Card.Text>
          ))}
        </div>
      )}

      {!!practicedStr && renderCardBody('Practice Data', practicedStr)}

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <ReprButton
          type={ReprButtonType.EDIT}
          actionData={{ selection: ModalSelection.EDIT_REPR, props: { repr } }}
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
    overflowY: 'auto' as 'auto',
    width: '400px',
    margin: '10px 0',
  },
}
