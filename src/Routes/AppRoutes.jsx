import {Routes, Route} from "react-router-dom";
import Home from "../pages/Home";
import Catalogo from "../pages/Catalogo";

function AppRoutes(){

    return(

        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="catalogo" element={<Catalogo/>}/>
        </Routes>

    )

}

export default AppRoutes;