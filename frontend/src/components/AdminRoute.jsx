import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
