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
      <header className="home-header">
        <h1>BRINDAVAN AGRO INDUSTRIES PRIVATE LIMITED</h1>
        <p className="subtitle">VEHICLE INSPECTION MANAGEMENT SYSTEM</p>
      </header>

    
      <div className="home-card-container">
        <div className="home-card" onClick={() => navigate("/own-vehicle")}>
          <h3>OWN VEHICLE INSPECTION</h3>
          <p>For company-owned vehicles</p>
        </div>

        <div className="home-card" onClick={() => navigate("/spotHired_Vehicle")}>
          <h3>Inspection Checklist- Spot Hired Vehicle Form</h3>
          <p>For Spot Hired Vehicle</p>
        </div>

        <div className="home-card" onClick={() => navigate("/vehicle_inspection-dedicated")}>
          <h3>Vehicle Inspection Checklist - Dedicated</h3>
          <p>For Spot Hired Vehicle</p>
        </div>

        <div className="home-card" onClick={() => navigate("/reports")}>
          <h3>REPORTS & RECORDS</h3>
          <p>View inspection data</p>
        </div>
      </div>

      <footer className="home-footer">
        <p>Developed by: IT Department | Classified: Internal Use Only</p>
        <p>© 2025 BAIL - All Rights Reserved</p>
      </footer>
    </div>
    </>
  );
}

export default Home;