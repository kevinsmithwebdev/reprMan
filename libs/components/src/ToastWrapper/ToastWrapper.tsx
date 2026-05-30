import React from 'react'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import store from '@reprman/state/store'
import { removeToastAC, useToasts } from '@reprman/state/toasts'
import { ToastData, ToastLevel } from '@reprman/types'

const ToastWrapper = () => {
  const { toasts } = useToasts()

  if (toasts.length === 0) return null

  return (
    <ToastContainer
      position="bottom-center"
      className="position-fixed"
      style={{ marginBottom: '25px' }}
    >
      {toasts.map(renderToast)}
    </ToastContainer>
  )
}

export default ToastWrapper

const renderToast = ({
  id,
  title = '',
  body,
  level = ToastLevel.INFO,
}: ToastData) => {
  const backgroundColors = getBackgroundColors(level)
  return (
    <Toast
      key={id}
      bg="custom"
      onClose={() => store.dispatch(removeToastAC(id))}
    >
      <Toast.Header
        closeVariant="white"
        style={{ backgroundColor: backgroundColors.title, color: '#eee' }}
      >
        <span
          style={{
            flex: 1,
            fontWeight: '800',
            fontSizeAdjust: '120%',
          }}
        >
          {title.toUpperCase()}
        </span>
      </Toast.Header>
      <Toast.Body style={{ backgroundColor: backgroundColors.body }}>
        {body}
      </Toast.Body>
    </Toast>
  )
}

const BG_COLORS_BY_LEVEL = {
  [ToastLevel.SUCCESS]: { title: '#009933', body: '#b3ffcc' },
  [ToastLevel.FAIL]: { title: '#ff3300', body: '#ffc2b3' },
  [ToastLevel.INFO]: { title: '#0059b3', body: '#cce6ff' },
  [ToastLevel.WARNING]: { title: '#ff9900', body: '#ffe0b3' },
}

const getBackgroundColors = (
  level: ToastLevel = ToastLevel.INFO
): { title: string; body: string } => BG_COLORS_BY_LEVEL[level]
