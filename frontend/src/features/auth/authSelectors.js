export const selectUser = (state) => state.auth.user

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated

export const selectIsAdmin = (state) => state.auth.user?.role === 'ROLE_ADMIN'
