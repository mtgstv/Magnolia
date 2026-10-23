import { Navigate, Outlet, useLocation } from "react-router-dom";

import LayoutAdmin from "../components/admin/LayoutAdmin";
import NaoEncontrado from "../pages/NaoEncontrado";

import { useAuth } from "../hooks/useAuth";

function Verificando() {
  return <main className="min-h-[60vh]" aria-busy="true" />;
}

// Só para quem está logado: visitante vai para o login e volta depois de entrar
export function RotaPrivada({ aviso, children }) {
  const { usuario, verificando } = useAuth();
  const location = useLocation();

  if (verificando) return <Verificando />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: location, aviso }} />;
  return children;
}

// Login e cadastro: quem já está logado não precisa ver
export function SomenteVisitante({ children }) {
  const { usuario, verificando } = useAuth();
  const location = useLocation();

  if (verificando) return <Verificando />;
  if (usuario) return <Navigate to={location.state?.de ?? "/"} replace />;
  return children;
}

// Painel admin: só para contas com papel ADMIN. Para os outros, a página "não existe".
export function RotaAdmin() {
  const { usuario, verificando } = useAuth();
  const location = useLocation();

  if (verificando) return <Verificando />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: location, aviso: "Entre com uma conta de administrador." }} />;
  if (usuario.papel !== "ADMIN") return <NaoEncontrado />;
  return (
    <LayoutAdmin>
      <Outlet />
    </LayoutAdmin>
  );
}
