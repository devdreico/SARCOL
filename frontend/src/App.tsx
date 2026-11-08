import { Routes, Route } from "react-router-dom";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import Panel from "./pages/Panel";
import Herramientas from "./pages/Herramientas";
import EstadoActual from "./pages/EstadoActual";
import Historia from "./pages/Historia";
import Problematicas from "./pages/Problematicas";
import Soluciones from "./pages/Soluciones";
import Mapa from "./pages/Mapa";
import Fuentes from "./pages/Fuentes";
import Metodologia from "./pages/Metodologia";
import DatosAbiertos from "./pages/DatosAbiertos";
import Buscar from "./pages/Buscar";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Home />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/herramientas" element={<Herramientas />} />
        <Route path="/estado-actual" element={<EstadoActual />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/problematicas" element={<Problematicas />} />
        <Route path="/soluciones" element={<Soluciones />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/fuentes" element={<Fuentes />} />
        <Route path="/metodologia" element={<Metodologia />} />
        <Route path="/datos-abiertos" element={<DatosAbiertos />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
