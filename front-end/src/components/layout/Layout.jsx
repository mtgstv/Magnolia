import { Outlet } from "react-router-dom";

import BarraAvisos from "./BarraAvisos";
import Footer from "./Footer";
import Header from "./Header";
import RolagemAutomatica from "./RolagemAutomatica";

// Moldura de todas as páginas: faixa de promoções e header em cima, footer sempre no fim da tela
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <RolagemAutomatica />
      <BarraAvisos />
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
