import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useUser } from 'state/user'

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user } = useUser()
  const location = useLocation()

  console.log('RequireAuth1 user', user)

  if (!user.email) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
