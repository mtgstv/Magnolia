import {Routes, Route} from "react-router-dom";
import Layout from "../components/layout/Layout";
import Cadastro from "../pages/Cadastro";
import AdminProdutoForm from "../pages/admin/AdminProdutoForm";
import AdminProdutos from "../pages/admin/AdminProdutos";
import AdminPromocoes from "../pages/admin/AdminPromocoes";
import Carrinho from "../pages/Carrinho";
import Checkout from "../pages/Checkout";
import Catalogo from "../pages/Catalogo";
import Favoritos from "../pages/Favoritos";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NaoEncontrado from "../pages/NaoEncontrado";
import Pedido from "../pages/Pedido";
import Pedidos from "../pages/Pedidos";
import Produto from "../pages/Produto";
import { RotaAdmin, RotaPrivada, SomenteVisitante } from "./RotasProtegidas";

function AppRoutes(){

    return(

        <Routes>
            <Route element={<Layout/>}>
                <Route path="/" element={<Home/>} />
                <Route path="catalogo" element={<Catalogo/>}/>
                <Route path="produto/:slug" element={<Produto/>}/>
                <Route path="carrinho" element={<Carrinho/>}/>
                <Route
                    path="favoritos"
                    element={
                        <RotaPrivada aviso="Entre na sua conta para ver seus perfumes favoritos.">
                            <Favoritos/>
                        </RotaPrivada>
                    }
                />
                <Route
                    path="checkout"
                    element={
                        <RotaPrivada aviso="Entre na sua conta para finalizar a compra. Sua sacola continua salva.">
                            <Checkout/>
                        </RotaPrivada>
                    }
                />
                <Route path="pedidos" element={<RotaPrivada aviso="Entre na sua conta para ver seus pedidos."><Pedidos/></RotaPrivada>}/>
                <Route path="pedidos/:numero" element={<RotaPrivada aviso="Entre na sua conta para ver seus pedidos."><Pedido/></RotaPrivada>}/>
                <Route path="admin" element={<RotaAdmin/>}>
                    <Route index element={<AdminProdutos/>}/>
                    <Route path="produtos/novo" element={<AdminProdutoForm/>}/>
                    <Route path="produtos/:id" element={<AdminProdutoForm/>}/>
                    <Route path="promocoes" element={<AdminPromocoes/>}/>
                </Route>
                <Route path="login" element={<SomenteVisitante><Login/></SomenteVisitante>}/>
                <Route path="cadastro" element={<SomenteVisitante><Cadastro/></SomenteVisitante>}/>
                <Route path="*" element={<NaoEncontrado/>}/>
            </Route>
        </Routes>

    )

}

export default AppRoutes;
