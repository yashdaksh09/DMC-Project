import './App.css'
import {BrowserRouter as Router,Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import VehicleInspectionForm from './components/VehicleInspectionForm';
function App() {

  return (
    <Router>
     <Routes>
      <Route path= "/" element={<Home/>}></Route>
      <Route path= "/own-vehicle" element={<VehicleInspectionForm/>}></Route>
     </Routes>
    </Router>
  )
}

export default App
