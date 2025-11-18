import './App.css'
import {BrowserRouter as Router,Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import VehicleInspectionForm from './components/VehicleInspectionForm';
import SpotHiredVehicleForm from './components/SpotHiredVehicleForm';
import VehicleInspectionDedicated from './components/VehicleInspectionDedicated';
import SpotRm_PM_Form from './components/Spot-Rm-Pm_Form';
function App() {

  return (
    <Router>
     <Routes>
      <Route path= "/" element={<Home/>}></Route>
      <Route path= "/own-vehicle" element={<VehicleInspectionForm/>}></Route>
      <Route path= "/spotHired_Vehicle" element={<SpotHiredVehicleForm/>}></Route>
      <Route path= "/vehicle_inspection-dedicated" element={<VehicleInspectionDedicated/>}></Route>
      <Route path= "/vehicle_inspection-SpotRm-PM_Form" element={<SpotRm_PM_Form/>}></Route>

     </Routes>
    </Router>
  )
}

export default App
