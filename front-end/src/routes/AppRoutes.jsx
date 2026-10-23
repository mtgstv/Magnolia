import {Routes, Route} from "react-router-dom";
import Layout from "../components/layout/Layout";
import Cadastro from "../pages/Cadastro";
import Catalogo from "../pages/Catalogo";
import Favoritos from "../pages/Favoritos";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NaoEncontrado from "../pages/NaoEncontrado";
import Produto from "../pages/Produto";
import { RotaPrivada, SomenteVisitante } from "./RotasProtegidas";

function AppRoutes(){

    return(

        <Routes>
            <Route element={<Layout/>}>
                <Route path="/" element={<Home/>} />
                <Route path="catalogo" element={<Catalogo/>}/>
                <Route path="produto/:slug" element={<Produto/>}/>
                <Route
                    path="favoritos"
                    element={
                        <RotaPrivada aviso="Entre na sua conta para ver seus perfumes favoritos.">
                            <Favoritos/>
                        </RotaPrivada>
                    }
                />
                <Route path="login" element={<SomenteVisitante><Login/></SomenteVisitante>}/>
                <Route path="cadastro" element={<SomenteVisitante><Cadastro/></SomenteVisitante>}/>
                <Route path="*" element={<NaoEncontrado/>}/>
            </Route>
        </Routes>

    )

}

export default AppRoutes;
