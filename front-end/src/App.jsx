import AuthProvider from './contexts/AuthProvider'
import CarrinhoProvider from './contexts/CarrinhoProvider'
import FavoritosProvider from './contexts/FavoritosProvider'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <FavoritosProvider>
        <CarrinhoProvider>
          <AppRoutes/>
        </CarrinhoProvider>
      </FavoritosProvider>
    </AuthProvider>
  )
}

export default App
