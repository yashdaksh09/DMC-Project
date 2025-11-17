import './App.css'
import {BrowserRouter as Router,Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import VehicleInspectionForm from './components/VehicleInspectionForm';
import SpotHiredVehicleForm from './components/SpotHiredVehicleForm';
import VehicleInspectionDedicated from './components/VehicleInspectionDedicated';
function App() {

  return (
    <Router>
     <Routes>
      <Route path= "/" element={<Home/>}></Route>
      <Route path= "/own-vehicle" element={<VehicleInspectionForm/>}></Route>
      <Route path= "/spotHired_Vehicle" element={<SpotHiredVehicleForm/>}></Route>
      <Route path= "/vehicle_inspection-dedicated" element={<VehicleInspectionDedicated/>}></Route>
     </Routes>
    </Router>
  )
}

export default App
