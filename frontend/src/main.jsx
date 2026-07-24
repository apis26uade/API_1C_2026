import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import App from './App.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import CartSync from './components/CartSync.jsx'
import CartAddedModal from './components/CartAddedModal.jsx'
import './styles/fonts.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ToastProvider>
          <CartSync />
          <CartAddedModal />
          <ScrollToTop />
          <App />
        </ToastProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
