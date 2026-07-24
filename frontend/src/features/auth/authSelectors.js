export const selectUser = (state) => state.auth.user

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated

export const selectIsAdmin = (state) => state.auth.user?.role === 'ROLE_ADMIN'

export const selectAuthStatus = (state) => state.auth.status

export const selectAuthError = (state) => state.auth.error
