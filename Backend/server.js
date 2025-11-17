// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require("path")
const fs=  require("fs")
const PDFDocument= require("pdfkit") //pdfkit package import
const PORT = 3456;


const app = express();
app.use(cors());
app.use(express.json());
app.use("/inspection_pdfs", express.static(path.join(__dirname, "inspection_pdfs")));


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

  // checklist keys (same as frontend)
  const checklistItems = [
    'vehicle_documents', 'driver_fit_dl', 'body_condition', 'gear_condition',
    'tyre_condition', 'head_light', 'indicators', 'break_light', 'wind_shield',
    'wiper', 'mirrors', 'horn', 'first_aid_kit', 'fire_extinguisher',
    'reflective_tape', 'rupd', 'supd', 'seat_belt', 'gps_device',
    'speed_governor', 'brake_condition','rear_sensor_Rear_camera', 'steering_condition',
    'products_stored','walk_around','empty_bucket'
  ];

  // prepare checklistData (if needed separately)
  const checklistData = {};
  checklistItems.forEach((key) => {
    checklistData[key] = data[key];
    checklistData[`${key}_remark`] = data[`${key}_remark`];
  });

  // SQL and values (same columns as before)
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
      rear_sensor_Rear_camera, rear_sensor_Rear_camera_remark,
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
    checklistData.rear_sensor_Rear_camera, checklistData.rear_sensor_Rear_camera_remark,
    checklistData.steering_condition, checklistData.steering_condition_remark,
    checklistData.products_stored, checklistData.products_stored_remark,
    checklistData.walk_around, checklistData.walk_around_remark,
    checklistData.empty_bucket, checklistData.empty_bucket_remark,
    data.driver_declaration ? 1 : 0,
    data.driver_name, data.driver_contact_no,
    data.driver_dl_no, data.dl_valid_till, data.ddt_date, data.ddt_card_by,
    data.driver_sig, data.inspected_by
  ];

  // ---------------------------
  // Use transaction to avoid duplicates if pdf fails
  // ---------------------------
  db.beginTransaction((txErr) => {
    if (txErr) {
      console.error('Transaction start error:', txErr);
      return res.status(500).json({ message: 'DB transaction error', error: txErr });
    }

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('❌ Error saving data:', err);
        return db.rollback(() => {
          return res.status(500).json({ message: 'Database error', error: err });
        });
      }

      const insertId = result.insertId;
      console.log('Data Inserted with id:', insertId);

      // PDF folder & path
      const pdfFolder = path.join(__dirname, "inspection_pdfs");
      if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder, { recursive: true });
      const pdfPath = path.join(pdfFolder, `inspection_${insertId}.pdf`);

      // Start PDF generation (attempt). If it fails -> rollback
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 36 });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // --- Header ---
        doc.rect(18, 18, doc.page.width - 36, doc.page.height - 36).stroke(); // outer border
        doc.fontSize(18).font('Helvetica-Bold').text('BRINDAVAN AGRO INDUSTRIES PRIVATE LIMITED, Chhata', { align: 'center' });
        doc.moveDown(0.2);
        doc.fontSize(10).font('Helvetica').text('Revision No. 02 | BAIL-S-155-01-01-00-07', { align: 'center' });
        doc.moveDown(0.6);
        doc.fontSize(16).font('Helvetica-Bold').text('VEHICLE INSPECTION CHECKLIST', { align: 'center' });
        doc.moveDown(0.8);

        // --- Info table (4 columns laid out) ---
        const leftX = doc.page.margins.left;
        const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidth = usableWidth / 4;
        const cellH = 48;

        // small helper to draw cell
        function drawCell(x, y, w, h, label, value) {
          doc.rect(x, y, w, h).stroke();
          doc.font('Helvetica').fontSize(10).text(label, x + 6, y + 6, { width: w - 12 });
          if (value) {
            doc.font('Helvetica').fontSize(10).text(String(value), x + 6, y + 22, { width: w - 12 });
          }
        }

        let y = doc.y;
        // row 1
        drawCell(leftX, y, colWidth, cellH, 'Docket No.', data.docket_no || '');
        drawCell(leftX + colWidth, y, colWidth, cellH, 'DMC In Date & Time', data.dmc_in_datetime || '');
        drawCell(leftX + 2*colWidth, y, colWidth, cellH, 'Truck Number', data.truck_number || '');
        drawCell(leftX + 3*colWidth, y, colWidth, cellH, 'DMC Out Date & Time', data.dmc_out_datetime || '');
        y += cellH;

        // row 2
        drawCell(leftX, y, colWidth, cellH, 'Vehicle Type', data.vehicle_type || '');
        drawCell(leftX + colWidth, y, colWidth, cellH, 'Driver Safety Induction', data.driver_safety_induction || '');
        drawCell(leftX + 2*colWidth, y, colWidth, cellH, 'Transporter', data.transporter || '');
        drawCell(leftX + 3*colWidth, y, colWidth, cellH, 'Driver Counselling', data.driver_counselling || '');
        y += cellH + 10;

        // --- Checklist table header ---
        const tableX = leftX;
        const tableW = usableWidth;
        const colSrW = 40;
        const colDescW = tableW * 0.55;
        const colRespW = (tableW - colSrW - colDescW) / 2;
        const colRemW = colRespW;
        const rowH = 24;

        doc.font('Helvetica-Bold').fontSize(11).fillColor('white');
        doc.rect(tableX, y, tableW, rowH).fill('#222');
        doc.fillColor('white').text('Sr. No.', tableX + 6, y + 6, { width: colSrW - 12 });
        doc.text('Checklist Description', tableX + colSrW + 6, y + 6, { width: colDescW - 12 });
        doc.text('Response', tableX + colSrW + colDescW + 6, y + 6, { width: colRespW - 12 });
        doc.text('Remarks', tableX + colSrW + colDescW + colRespW + 6, y + 6, { width: colRemW - 12 });
        y += rowH;

        doc.fillColor('black').font('Helvetica').fontSize(10);

        // iterate checklist items to draw rows (wrap page if needed)
        checklistItems.forEach((key, i) => {
          const label = key.replace(/_/g, ' ').replace(/rear sensor rear camera/i, 'Rear Sensor & Rear Camera');
          const response = (data[key] !== undefined && data[key] !== null) ? data[key] : '';
          const remark = data[`${key}_remark`] || '';

          // page break if not enough space
          if (y + rowH + 80 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            y = doc.page.margins.top;
          }

          // row border
          doc.rect(tableX, y, tableW, rowH).stroke();
          doc.text(String(i + 1), tableX + 6, y + 6, { width: colSrW - 12 });
          doc.text(checklistItemsLabels(key) , tableX + colSrW + 6, y + 6, { width: colDescW - 12 });
          doc.text(response, tableX + colSrW + colDescW + 6, y + 6, { width: colRespW - 12 });
          doc.text(remark, tableX + colSrW + colDescW + colRespW + 6, y + 6, { width: colRemW - 12 });

          y += rowH;
        });

        // small helper to map nicer labels (so PDF matches frontend labels)
        function checklistItemsLabels(k) {
          const map = {
            'vehicle_documents': 'Vehicle Documents (Insurance, PUC, RC, Tax, Fitness & Permit)',
            'driver_fit_dl': 'Driver Fit for Working & Their DL',
            'body_condition': 'Vehicle Body Condition',
            'gear_condition': 'Vehicle Gear Condition',
            'tyre_condition': 'Vehicle Tyre and Rim Condition Or Spare Tyre',
            'head_light': 'Head Light',
            'indicators': 'Indicators',
            'break_light': 'Break Light',
            'wind_shield': 'Wind Shield',
            'wiper': 'Wiper (Both Side Working)',
            'mirrors': 'Rear View & Blind Spot Mirrors (Check for Clear Visibility)',
            'horn': 'Horn & Reverse Horn (Working Condition)',
            'first_aid_kit': 'Basic First aid Kit',
            'fire_extinguisher': 'Fire Extinguisher',
            'reflective_tape': 'Reflective Tape & Breakdown Safety Triangle',
            'rupd': 'RUPD (Rear Under Protection Device)',
            'supd': 'SUPD (Side Under Protection Device)',
            'seat_belt': 'Seat Belt (Both Side)',
            'gps_device': 'GPS Device',
            'speed_governor': 'Speed Governor (Speed Controller)',
            'brake_condition': 'Brake Condition, Hand Brake or Wheel Chocks',
            'rear_sensor_Rear_camera': 'Rear Sensor & Rear Camera',
            'steering_condition': 'Steering Wheel Looseness, Damage',
            'products_stored': 'Products Stored Securely',
            'walk_around': '360 Degree Walk Around',
            'empty_bucket': 'Other (Empty Bucket For Spillage Control)'
          };
          return map[k] || k;
        }

        // move down to signature area
        y += 20;
        if (y + 140 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        // Signature / Prepared / Approved area
        const sigX = tableX;
        const sigW = tableW;
        const sigH = 120;
        doc.rect(sigX, y, sigW, sigH).stroke();

        // left column (Prepared By)
        const colLeftW = sigW * 0.4;
        doc.text('Prepared By :', sigX + 10, y + 10);
        doc.rect(sigX + 8, y + 30, colLeftW - 16, 30).stroke();
        doc.text(String(data.prepared_by || ''), sigX + 12, y + 34);

        // middle text
        doc.text('Transport Incharge', sigX + colLeftW + 10, y + 12);

        // right column (Approved By)
        const rightX = sigX + colLeftW + 10;
        doc.text('Approved By :', rightX + 6, y + 10);
        doc.rect(rightX + 4, y + 30, sigW - colLeftW - 40, 30).stroke();
        doc.text(String(data.approved_by || ''), rightX + 8, y + 34);

        // final footer
        doc.text('Revision Date : 29-08-2023', sigX + 10, y + sigH - 30);
        doc.text('CLASSIFIED • CONFIDENTIAL • FOR INTERNAL USE ONLY', sigX + colLeftW + 10, y + sigH - 30);

        doc.end();

        // after write finished commit transaction and respond
        stream.on('finish', () => {
          db.commit((commitErr) => {
            if (commitErr) {
              console.error('Commit error:', commitErr);
              // attempt rollback (file already created) — remove created file if you want
              return db.rollback(() => {
                return res.status(500).json({ message: 'Commit failed', error: commitErr });
              });
            }

            const pdfUrl = `http://localhost:3456/inspection_pdfs/inspection_${insertId}.pdf`;
            console.log('PDF saved:', pdfPath);

            return res.json({
              message: "Data saved and PDF generated!",
              id: insertId,
              pdfUrl: pdfUrl
            });
          });
        });

        // capture stream errors
        stream.on('error', (sErr) => {
        console.error('Stream write error:', sErr);

        if (fs.existsSync(pdfPath)) {
        try { fs.unlinkSync(pdfPath); } catch (e) {}
        }

  return db.rollback(() => {
    return res.status(500).json({
      message: '❌ PDF write failed. DB rollback successful.',
      error: sErr
    });
  });
});
} catch (pdfErr) {
        console.error('PDF generation error:', pdfErr);
        // rollback DB insert
        return db.rollback(() => {
          return res.status(500).json({ message: 'PDF generation failed', error: pdfErr });
        });
      }
    });
  }); // end transaction
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


app.post('/dedicated_vehicle-inspection', (req, res) => {
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
    INSERT INTO vehicle_inspection_dedicated (
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
      steering_condition, steering_condition_remark,
      products_stored, products_stored_remark,
      walk_around, walk_around_remark,
      empty_bucket, empty_bucket_remark,
      driver_declaration, driver_name, driver_contact_no,
      driver_dl_no, dl_valid_till, ddt_date, ddt_card_by,
      driver_sig, inspected_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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



app.listen(PORT, () => console.log('🚀 Server running on port 3456'));

// coloumns = 54
// values= 42 fix krna ha value
