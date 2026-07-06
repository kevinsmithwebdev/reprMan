'use client'

import React, { useEffect, useRef } from 'react'
import AcceptTermsGate from '@reprman/components/AcceptTermsGate'
import Footer from '@reprman/components/Footer'
import Header from '@reprman/components/Header'
import ReprLimitBanner from '@reprman/components/ReprLimitBanner'
import ToastWrapper from '@reprman/components/ToastWrapper'
import { isCognitoConfigured, useCognitoAuth } from '@reprman/cognito-auth'
import ModalContainer from '@reprman/modals/ModalContainer'
import { useDispatch } from 'react-redux'
import { runGenesisSaga } from '@reprman/state/sagas/genesis/genesis.actions'
import { LogBuildInfoOnMount } from '../src/LogBuildInfoOnMount'

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const initialGenesisDone = useRef(false)

  useEffect(() => {
    if (isCognitoConfigured() && !sessionChecked) {
      return
    }
    if (initialGenesisDone.current) {
      return
    }
    initialGenesisDone.current = true
    dispatch(runGenesisSaga(signedIn ? { afterSignIn: true } : undefined))
  }, [dispatch, sessionChecked, signedIn])

  return (
    <>
      <LogBuildInfoOnMount />
      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
        id="home-page"
      >
        <Header />
        <ReprLimitBanner />
        <div className="app-content-container">
          <div className="app-content-routes">{children}</div>
          <ModalContainer />
          <AcceptTermsGate />
        </div>
        <ToastWrapper />
        <Footer />
      </main>
    </>
  )
}
