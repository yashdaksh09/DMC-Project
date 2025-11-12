import './App.css'
import {BrowserRouter as Router,Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import VehicleInspectionForm from './components/VehicleInspectionForm';
import SpotHiredVehicleForm from './components/SpotHiredVehicleForm';
function App() {

  return (
    <Router>
     <Routes>
      <Route path= "/" element={<Home/>}></Route>
      <Route path= "/own-vehicle" element={<VehicleInspectionForm/>}></Route>
      <Route path= "/spotHired_Vehicle" element={<SpotHiredVehicleForm/>}></Route>
     </Routes>
    </Router>
  )
}

export default App
