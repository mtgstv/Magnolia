import HomeCliente from "../components/home/HomeCliente";
import HomeVisitante from "../components/home/HomeVisitante";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { usuario, verificando } = useAuth();

  // Espera saber se há login salvo, para não mostrar a home de visitante e trocar em seguida
  if (verificando) {
    return <main className="min-h-[70vh]" aria-busy="true" />;
  }

  return usuario ? <HomeCliente /> : <HomeVisitante />;
}
