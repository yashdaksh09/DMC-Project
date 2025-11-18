import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css"
import BetaBadge from "../../BetaBadge";

function Home() {
  const navigate = useNavigate();

  return (
    <>
    <BetaBadge/>
    <div className="home-container">
      <img src="./images/BAIL_LOGO.jpg" alt="BAIL Logo" />
      <header className="home-header mt-4">
        <h1 style={{color: "green"}}>BRINDAVAN AGRO INDUSTRIES PRIVATE LIMITED</h1>
        <p className="subtitle">VEHICLE INSPECTION MANAGEMENT SYSTEM (DMC)</p>
      </header>

    
      <div className="home-card-container">
        <div className="home-card" onClick={() => navigate("/own-vehicle")}>
          <h3>OWN VEHICLE INSPECTION</h3>
          <p>For Company-Owned Vehicles</p>
        </div>

        <div className="home-card" onClick={() => navigate("/spotHired_Vehicle")}>
          <h3 style={{color: "red"}}>Inspection Checklist- Spot Hired Vehicle Form</h3>
          <p>For Spot Hired Vehicle</p>
        </div>

        <div className="home-card" onClick={() => navigate("/vehicle_inspection-dedicated")}>
          <h3 style={{color: "purple"}} >Vehicle Inspection Checklist - Dedicated</h3>
          <p>For Dedicated Vehicle</p>
        </div>

        <div className="home-card" onClick={() => navigate("/vehicle_inspection-SpotRm-PM_Form")}>
          <h3 style={{color: "brown"}}>Vehicle Inspection Checklist - Spot RM PM</h3>
          <p>For Spot RM PM</p>
        </div>

        {/* <div className="home-card" onClick={() => navigate("/reports")}>
          <h3>REPORTS & RECORDS</h3>
          <p>View inspection data</p>
        </div> */}
      </div>

      <footer className="home-footer">
        <p>Developed by: BAIL IT Department | Classified: Internal Use Only</p>
        <p>© 2025 BAIL - All Rights Reserved</p>
      </footer>
    </div>
    </>
  );
}

export default Home;