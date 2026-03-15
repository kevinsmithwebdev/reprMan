export const SHOW_PING = 'SAGA/SHOW_PING'

export const showPing = (payload: any) => ({
  type: SHOW_PING,
  payload,
})
