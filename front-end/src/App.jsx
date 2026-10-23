import AuthProvider from './contexts/AuthProvider'
import FavoritosProvider from './contexts/FavoritosProvider'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <FavoritosProvider>
        <AppRoutes/>
      </FavoritosProvider>
    </AuthProvider>
  )
}

export default App
