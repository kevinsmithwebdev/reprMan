import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useUser } from 'state/user'

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user } = useUser()
  const location = useLocation()

  if (!user.email) {
    return <Navigate to="/signing" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
