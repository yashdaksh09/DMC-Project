CREATE DATABASE IF NOT EXISTS DMC_Database;
USE DMC_Database;


-- Vehicle Inspection Table
CREATE TABLE vehicle_inspection_form (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Basic Vehicle Info
  docket_no VARCHAR(50),
  dmc_in_datetime DATETIME,
  dmc_out_datetime DATETIME,
  truck_number VARCHAR(50),
  vehicle_type VARCHAR(50),
  transporter VARCHAR(100),
  driver_safety_induction VARCHAR(100),
  driver_counselling VARCHAR(100),

  -- Checklist Columns (each with remarks)
  vehicle_documents ENUM('Yes', 'No', 'N/A'),
  vehicle_documents_remark VARCHAR(255),

  driver_fit_dl ENUM('Yes', 'No', 'N/A'),
  driver_fit_dl_remark VARCHAR(255),

  body_condition ENUM('Yes', 'No', 'N/A'),
  body_condition_remark VARCHAR(255),

  gear_condition ENUM('Yes', 'No', 'N/A'),
  gear_condition_remark VARCHAR(255),

  tyre_condition ENUM('Yes', 'No', 'N/A'),
  tyre_condition_remark VARCHAR(255),

  head_light ENUM('Yes', 'No', 'N/A'),
  head_light_remark VARCHAR(255),

  indicators ENUM('Yes', 'No', 'N/A'),
  indicators_remark VARCHAR(255),

  break_light ENUM('Yes', 'No', 'N/A'),
  break_light_remark VARCHAR(255),

  wind_shield ENUM('Yes', 'No', 'N/A'),
  wind_shield_remark VARCHAR(255),

  wiper ENUM('Yes', 'No', 'N/A'),
  wiper_remark VARCHAR(255),

  mirrors ENUM('Yes', 'No', 'N/A'),
  mirrors_remark VARCHAR(255),

  horn ENUM('Yes', 'No', 'N/A'),
  horn_remark VARCHAR(255),

  first_aid_kit ENUM('Yes', 'No', 'N/A'),
  first_aid_kit_remark VARCHAR(255),

  fire_extinguisher ENUM('Yes', 'No', 'N/A'),
  fire_extinguisher_remark VARCHAR(255),

  reflective_tape ENUM('Yes', 'No', 'N/A'),
  reflective_tape_remark VARCHAR(255),

  rupd ENUM('Yes', 'No', 'N/A'),
  rupd_remark VARCHAR(255),

  supd ENUM('Yes', 'No', 'N/A'),
  supd_remark VARCHAR(255),

  seat_belt ENUM('Yes', 'No', 'N/A'),
  seat_belt_remark VARCHAR(255),

  gps_device ENUM('Yes', 'No', 'N/A'),
  gps_device_remark VARCHAR(255),

  speed_governor ENUM('Yes', 'No', 'N/A'),
  speed_governor_remark VARCHAR(255),

  brake_condition ENUM('Yes', 'No', 'N/A'),
  brake_condition_remark VARCHAR(255),

  rear_sensor_Rear_camera ENUM('Yes', 'No', 'N/A'),
  rear_sensor_Rear_camera_remarks VARCHAR(255),
  
  steering_condition ENUM('Yes', 'No', 'N/A'),
  steering_condition_remark VARCHAR(255),

  products_stored ENUM('Yes', 'No', 'N/A'),
  products_stored_remark VARCHAR(255),

  walk_around ENUM('Yes', 'No', 'N/A'),
  walk_around_remark VARCHAR(255),

  empty_bucket ENUM('Yes', 'No', 'N/A'),
  empty_bucket_remark VARCHAR(255),

  -- Driver declaration & signature
  driver_declaration BOOLEAN,
  driver_name VARCHAR(100),
  driver_contact_no VARCHAR(20),
  driver_dl_no VARCHAR(50),
  dl_valid_till DATE,
  ddt_date DATE,
  ddt_card_by VARCHAR(100),
  driver_sig VARCHAR(100),
  inspected_by VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Spot Hired Vehicle Inspection Form
CREATE TABLE spot_hired_vehicle_form (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Basic Vehicle Info
  docket_no VARCHAR(50),
  dmc_in_datetime DATETIME,
  dmc_out_datetime DATETIME,
  truck_number VARCHAR(50),
  vehicle_type VARCHAR(50),
  transporter VARCHAR(100),
  driver_safety_induction VARCHAR(100),
  driver_counselling VARCHAR(100),

  -- Checklist Columns (each with remarks)
  vehicle_documents ENUM('Yes', 'No', 'N/A'),
  vehicle_documents_remark VARCHAR(255),

  driver_fit_dl ENUM('Yes', 'No', 'N/A'),
  driver_fit_dl_remark VARCHAR(255),

  body_condition ENUM('Yes', 'No', 'N/A'),
  body_condition_remark VARCHAR(255),

  gear_condition ENUM('Yes', 'No', 'N/A'),
  gear_condition_remark VARCHAR(255),

  tyre_condition ENUM('Yes', 'No', 'N/A'),
  tyre_condition_remark VARCHAR(255),

  head_light ENUM('Yes', 'No', 'N/A'),
  head_light_remark VARCHAR(255),

  indicators ENUM('Yes', 'No', 'N/A'),
  indicators_remark VARCHAR(255),

  break_light ENUM('Yes', 'No', 'N/A'),
  break_light_remark VARCHAR(255),

  wind_shield ENUM('Yes', 'No', 'N/A'),
  wind_shield_remark VARCHAR(255),

  wiper ENUM('Yes', 'No', 'N/A'),
  wiper_remark VARCHAR(255),

  mirrors ENUM('Yes', 'No', 'N/A'),
  mirrors_remark VARCHAR(255),

  horn ENUM('Yes', 'No', 'N/A'),
  horn_remark VARCHAR(255),

  first_aid_kit ENUM('Yes', 'No', 'N/A'),
  first_aid_kit_remark VARCHAR(255),

  fire_extinguisher ENUM('Yes', 'No', 'N/A'),
  fire_extinguisher_remark VARCHAR(255),

  reflective_tape ENUM('Yes', 'No', 'N/A'),
  reflective_tape_remark VARCHAR(255),

  rupd_supd ENUM('Yes', 'No', 'N/A'),
  rupd_supd_remark VARCHAR(255),

  seat_belt ENUM('Yes', 'No', 'N/A'),
  seat_belt_remark VARCHAR(255),


  brake_condition ENUM('Yes', 'No', 'N/A'),
  brake_condition_remark VARCHAR(255),

  -- Driver declaration & signature
  driver_declaration BOOLEAN,
  driver_name VARCHAR(100),
  driver_contact_no VARCHAR(20),
  driver_dl_no VARCHAR(50),
  dl_valid_till DATE,
  ddt_date DATE,
  ddt_card_by VARCHAR(100),
  driver_sig VARCHAR(100),
  inspected_by VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE vehicle_inspection_form
DROP COLUMN rupd,
DROP COLUMN supd,
ADD COLUMN rupd_supd ENUM('Yes', 'No', 'N/A'),
ADD COLUMN rupd_supd_remark TEXT;


SELECT * FROM spot_hired_vehicle_form;
DROP TABLE spot_hired_vehicle_form;
-- Test Data Insert
INSERT INTO vehicle_inspection_form
(docket_no, truck_number, vehicle_type, vehicle_documents, vehicle_documents_remark)
VALUES ('123', 'MH12AB1234', 'Tanker', 'Yes', 'All valid documents verified');

-- Verify
SELECT * FROM vehicle_inspection_form;
DESCRIBE vehicle_inspection_form;
