import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'
import { render } from '@testing-library/react'
import store from 'state/store'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import createMockStore from 'redux-mock-store'
import { CognitoAuthProvider } from 'modules/CognitoAuth/CognitoAuthContext'
import App from '../App'

describe('App', () => {
  describe('snapshots', () => {
    const renderer = new ShallowRenderer()
    describe('basic render', () => {
      const rendered = renderer.render(
        <Provider store={store}>
          <BrowserRouter>
            <CognitoAuthProvider>
              <App />
            </CognitoAuthProvider>
          </BrowserRouter>
        </Provider>
      )
      it('renders correctly', () => {
        expect(rendered).toMatchSnapshot()
      })
    })
  })

  describe('hooks', () => {
    let consoleLogSpy
    beforeAll(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => null)
    })
    afterAll(() => {
      consoleLogSpy.mockClear()
    })
    describe('useEffect', () => {
      let dispatchSpy
      beforeEach(() => {
        dispatchSpy = jest.spyOn(store, 'dispatch')
        const storeInstance = createMockStore([])(store.getState())

        render(<App />, {
          wrapper: ({ children }) => (
            <Provider store={storeInstance}>
              <BrowserRouter>
                <CognitoAuthProvider>{children}</CognitoAuthProvider>
              </BrowserRouter>
            </Provider>
          ),
        })
      })
      it('should call dispatch with saga/genesis action', () => {
        expect(dispatchSpy).toBeCalledWith({ type: 'SAGA/GENESIS' })
      })
    })
  })
})
