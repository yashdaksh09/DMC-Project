// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'DMC_Database'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err);
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// API to insert vehicle inspection form
app.post('/submit-inspection', (req, res) => {
  const data = req.body;

  console.log('Request Body: ', data);

  // Prepare checklist data
  const checklistData = {};
  const checklistItems = [
    'vehicle_documents', 'driver_fit_dl', 'body_condition', 'gear_condition',
    'tyre_condition', 'head_light', 'indicators', 'break_light', 'wind_shield',
    'wiper', 'mirrors', 'horn', 'first_aid_kit', 'fire_extinguisher',
    'reflective_tape', 'rupd', 'supd', 'seat_belt', 'gps_device',
    'speed_governor', 'brake_condition', 'steering_condition', 'products_stored',
    'walk_around', 'empty_bucket'
  ];

  checklistItems.forEach((key) => {
    checklistData[key] = data[key];
    checklistData[`${key}_remark`] = data[`${key}_remark`];
  });

  const sql = `
    INSERT INTO vehicle_inspection_form (
      docket_no, dmc_in_datetime, dmc_out_datetime,
      truck_number, vehicle_type, transporter,
      driver_safety_induction, driver_counselling,
      vehicle_documents, vehicle_documents_remark,
      driver_fit_dl, driver_fit_dl_remark,
      body_condition, body_condition_remark,
      gear_condition, gear_condition_remark,
      tyre_condition, tyre_condition_remark,
      head_light, head_light_remark,
      indicators, indicators_remark,
      break_light, break_light_remark,
      wind_shield, wind_shield_remark,
      wiper, wiper_remark,
      mirrors, mirrors_remark,
      horn, horn_remark,
      first_aid_kit, first_aid_kit_remark,
      fire_extinguisher, fire_extinguisher_remark,
      reflective_tape, reflective_tape_remark,
      rupd, rupd_remark,
      supd, supd_remark,
      seat_belt, seat_belt_remark,
      gps_device, gps_device_remark,
      speed_governor, speed_governor_remark,
      brake_condition, brake_condition_remark,
      rear_sensor_Rear_camera, rear_sensor_Rear_camera_remarks ,
      steering_condition, steering_condition_remark,
      products_stored, products_stored_remark,
      walk_around, walk_around_remark,
      empty_bucket, empty_bucket_remark,
      driver_declaration, driver_name, driver_contact_no,
      driver_dl_no, dl_valid_till, ddt_date, ddt_card_by,
      driver_sig, inspected_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    data.docket_no, data.dmc_in_datetime, data.dmc_out_datetime,
    data.truck_number, data.vehicle_type, data.transporter,
    data.driver_safety_induction, data.driver_counselling,
    checklistData.vehicle_documents, checklistData.vehicle_documents_remark,
    checklistData.driver_fit_dl, checklistData.driver_fit_dl_remark,
    checklistData.body_condition, checklistData.body_condition_remark,
    checklistData.gear_condition, checklistData.gear_condition_remark,
    checklistData.tyre_condition, checklistData.tyre_condition_remark,
    checklistData.head_light, checklistData.head_light_remark,
    checklistData.indicators, checklistData.indicators_remark,
    checklistData.break_light, checklistData.break_light_remark,
    checklistData.wind_shield, checklistData.wind_shield_remark,
    checklistData.wiper, checklistData.wiper_remark,
    checklistData.mirrors, checklistData.mirrors_remark,
    checklistData.horn, checklistData.horn_remark,
    checklistData.first_aid_kit, checklistData.first_aid_kit_remark,
    checklistData.fire_extinguisher, checklistData.fire_extinguisher_remark,
    checklistData.reflective_tape, checklistData.reflective_tape_remark,
    checklistData.rupd, checklistData.rupd_remark,
    checklistData.supd, checklistData.supd_remark,
    checklistData.seat_belt, checklistData.seat_belt_remark,
    checklistData.gps_device, checklistData.gps_device_remark,
    checklistData.speed_governor, checklistData.speed_governor_remark,
    checklistData.brake_condition, checklistData.brake_condition_remark,
    checklistData.rear_sensor_Rear_camera, checklistData.rear_sensor_Rear_camera_remarks,
    checklistData.steering_condition, checklistData.steering_condition_remark,
    checklistData.products_stored, checklistData.products_stored_remark,
    checklistData.walk_around, checklistData.walk_around_remark,
    checklistData.empty_bucket, checklistData.empty_bucket_remark,
    data.driver_declaration ? 1 : 0,
    data.driver_name, data.driver_contact_no,
    data.driver_dl_no, data.dl_valid_till, data.ddt_date, data.ddt_card_by,
    data.driver_sig, data.inspected_by
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error saving data:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    console.log("Data Insert Succesfully")
    res.json({ message: '✅ Data saved successfully!', id: result.insertId });
  });
});



app.post('/spot-hired-vehicle', (req, res) => {
  const data = req.body;

  console.log('Request Body: ', data);

  // Prepare checklist data
  const checklistData = {};
  const checklistItems = [
    'vehicle_documents', 'driver_fit_dl', 'body_condition', 'gear_condition',
    'tyre_condition', 'head_light', 'indicators', 'break_light', 'wind_shield',
    'wiper', 'mirrors', 'horn', 'first_aid_kit', 'fire_extinguisher',
    'reflective_tape', 'rupd_supd',  'seat_belt', 'brake_condition'
  ];

  checklistItems.forEach((key) => {
    checklistData[key] = data[key];
    checklistData[`${key}_remark`] = data[`${key}_remark`];
  });

  const sql = `
    INSERT INTO spot_hired_vehicle_form (
      docket_no, dmc_in_datetime, dmc_out_datetime,
      truck_number, vehicle_type, transporter,
      driver_safety_induction, driver_counselling,
      vehicle_documents, vehicle_documents_remark,
      driver_fit_dl, driver_fit_dl_remark,
      body_condition, body_condition_remark,
      gear_condition, gear_condition_remark,
      tyre_condition, tyre_condition_remark,
      head_light, head_light_remark,
      indicators, indicators_remark,
      break_light, break_light_remark,
      wind_shield, wind_shield_remark,
      wiper, wiper_remark,
      mirrors, mirrors_remark,
      horn, horn_remark,
      first_aid_kit, first_aid_kit_remark,
      fire_extinguisher, fire_extinguisher_remark,
      reflective_tape, reflective_tape_remark,
      rupd_supd, rupd_supd_remark,
      seat_belt, seat_belt_remark,
      brake_condition, brake_condition_remark,
      driver_declaration, driver_name, driver_contact_no,
      driver_dl_no, dl_valid_till, ddt_date, ddt_card_by,
      driver_sig, inspected_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    data.docket_no, data.dmc_in_datetime, data.dmc_out_datetime,
    data.truck_number, data.vehicle_type, data.transporter,
    data.driver_safety_induction, data.driver_counselling,
    checklistData.vehicle_documents, checklistData.vehicle_documents_remark,
    checklistData.driver_fit_dl, checklistData.driver_fit_dl_remark,
    checklistData.body_condition, checklistData.body_condition_remark,
    checklistData.gear_condition, checklistData.gear_condition_remark,
    checklistData.tyre_condition, checklistData.tyre_condition_remark,
    checklistData.head_light, checklistData.head_light_remark,
    checklistData.indicators, checklistData.indicators_remark,
    checklistData.break_light, checklistData.break_light_remark,
    checklistData.wind_shield, checklistData.wind_shield_remark,
    checklistData.wiper, checklistData.wiper_remark,
    checklistData.mirrors, checklistData.mirrors_remark,
    checklistData.horn, checklistData.horn_remark,
    checklistData.first_aid_kit, checklistData.first_aid_kit_remark,
    checklistData.fire_extinguisher, checklistData.fire_extinguisher_remark,
    checklistData.reflective_tape, checklistData.reflective_tape_remark,
    checklistData.rupd_supd, checklistData.rupd_supd_remark,
    checklistData.seat_belt, checklistData.seat_belt_remark,
    checklistData.brake_condition, checklistData.brake_condition_remark,
    data.driver_declaration ? 1 : 0,
    data.driver_name, data.driver_contact_no,
    data.driver_dl_no, data.dl_valid_till, data.ddt_date, data.ddt_card_by,
    data.driver_sig, data.inspected_by
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error saving data:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json({ message: '✅ Data saved successfully!', id: result.insertId });
  });
});

app.listen(3456, () => console.log('🚀 Server running on port 3456'));

// coloumns = 54
// values= 42 fix krna ha value
