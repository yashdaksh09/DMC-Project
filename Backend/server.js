// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require("path")
const fs=  require("fs")
const PDFDocument= require("pdfkit") //pdfkit package import
const PORT = 3456;
const hindiFont = path.join(
  __dirname,
  "fonts",
  "NotoSansDevanagari-Regular.ttf",
  "NotoSansDevanagari-VariableFont_wdth,wght.ttf"
);
 //hindi font require



const app = express();
app.use(cors());
app.use(express.json());
app.use("/OwnVehicle_inspection_pdfs", express.static(path.join(__dirname, "OwnVehicle_inspection_pdfs")));
app.use("/Spot-Hired-Vehicle_inspection_pdfs", express.static(path.join(__dirname, "Spot-Hired-Vehicle_inspection_pdfs" )));
app.use("/Dedicated-form_Vehicle_inspection_pdfs", express.static(path.join(__dirname, "Dedicated-form_Vehicle_inspection_pdfs" )));






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

  // prepare checklistData
  const checklistData = {};
  checklistItems.forEach((key) => {
    checklistData[key] = data[key];
    checklistData[`${key}_remark`] = data[`${key}_remark`];
  });

  // SQL query
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
    ) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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

  // TRANSACTION START
  db.beginTransaction((txErr) => {
    if (txErr) {
      return res.status(500).json({ message: 'DB transaction error', error: txErr });
    }

    db.query(sql, values, (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Database error', error: err });
        });
      }

      const insertId = result.insertId;
      console.log("Data Inserted with id:", insertId);

      const pdfFolder = path.join(__dirname, "OwnVehicle_inspection_pdfs");
      if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder, { recursive: true });

      const pdfPath = path.join(pdfFolder, `inspection_${insertId}.pdf`);

      try {
        const doc = new PDFDocument({ size: 'A4', margin: 36 });

        // FONT REGISTER SAFE MODE
        if (hindiFont && fs.existsSync(hindiFont)) {
          doc.registerFont("Hindi", hindiFont);
        } else {
          console.warn("⚠ Hindi font missing:", hindiFont);
        }

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        /*******************************
         *  HEADER
         ******************************/
        doc.rect(18, 18, doc.page.width - 36, doc.page.height - 36).stroke();
        doc.fontSize(18).font("Helvetica-Bold")
          .text("BRINDAVAN AGRO INDUSTRIES PRIVATE LIMITED, Chhata", { align: "center" });

        doc.moveDown(0.2);
        doc.fontSize(10).font("Helvetica")
          .text("Revision No. 02 | BAIL-S-155-01-01-00-07", { align: "center" });

        doc.moveDown(0.6);
        doc.fontSize(16).font("Helvetica-Bold")
          .text("VEHICLE INSPECTION CHECKLIST", { align: "center" });

        doc.moveDown(0.8);

        /*********************************
         * INFO TABLE
         *********************************/
        const leftX = doc.page.margins.left;
        const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidth = usableWidth / 4;
        const cellH = 48;

        function drawCell(x, y, w, h, label, value) {
          doc.rect(x, y, w, h).stroke();
          doc.font("Helvetica").fontSize(10).text(label, x + 6, y + 6);
          if (value) {
            doc.text(String(value), x + 6, y + 22);
          }
        }

        let y = doc.y;

        drawCell(leftX, y, colWidth, cellH, "Docket No.", data.docket_no);
        drawCell(leftX + colWidth, y, colWidth, cellH, "DMC In Date & Time", data.dmc_in_datetime);
        drawCell(leftX + 2 * colWidth, y, colWidth, cellH, "Truck Number", data.truck_number);
        drawCell(leftX + 3 * colWidth, y, colWidth, cellH, "DMC Out Date & Time", data.dmc_out_datetime);
        y += cellH;

        drawCell(leftX, y, colWidth, cellH, "Vehicle Type", data.vehicle_type);
        drawCell(leftX + colWidth, y, colWidth, cellH, "Driver Safety Induction", data.driver_safety_induction);
        drawCell(leftX + 2 * colWidth, y, colWidth, cellH, "Transporter", data.transporter);
        drawCell(leftX + 3 * colWidth, y, colWidth, cellH, "Driver Counselling", data.driver_counselling);
        y += cellH + 10;

        /************************************
         * CHECKLIST TABLE HEADER
         ************************************/
        const tableX = leftX;
        const tableW = usableWidth;
        const colSrW = 40;
        const colDescW = tableW * 0.55;
        const colRespW = (tableW - colSrW - colDescW) / 2;
        const colRemW = colRespW;
        const rowH = 24;

        doc.font("Helvetica-Bold").fontSize(11).fillColor("white");
        doc.rect(tableX, y, tableW, rowH).fill("#222");

        doc.text("Sr. No.", tableX + 6, y + 6);
        doc.text("Checklist Description", tableX + colSrW + 6, y + 6);
        doc.text("Response", tableX + colSrW + colDescW + 6, y + 6);
        doc.text("Remarks", tableX + colSrW + colDescW + colRespW + 6, y + 6);

        y += rowH;

        doc.fillColor("black").font("Helvetica").fontSize(10);

        function checklistItemsLabels(k) {
          const map = {
            vehicle_documents: "Vehicle Documents (Insurance, PUC, RC, Tax, Fitness & Permit)",
            driver_fit_dl: "Driver Fit for Working & Their DL",
            body_condition: "Vehicle Body Condition",
            gear_condition: "Vehicle Gear Condition",
            tyre_condition: "Vehicle Tyre & Rim Condition / Spare Tyre",
            head_light: "Head Light",
            indicators: "Indicators",
            break_light: "Break Light",
            wind_shield: "Wind Shield",
            wiper: "Wiper",
            mirrors: "Rear View & Blind Spot Mirrors",
            horn: "Horn & Reverse Horn",
            first_aid_kit: "First Aid Kit",
            fire_extinguisher: "Fire Extinguisher",
            reflective_tape: "Reflective Tape / Triangle",
            rupd: "RUPD",
            supd: "SUPD",
            seat_belt: "Seat Belt",
            gps_device: "GPS Device",
            speed_governor: "Speed Governor",
            brake_condition: "Brake Condition",
            rear_sensor_Rear_camera: "Rear Sensor & Rear Camera",
            steering_condition: "Steering Condition",
            products_stored: "Products Stored",
            walk_around: "360° Walk Around",
            empty_bucket: "Empty Bucket"
          };
          return map[k] || k;
        }

        checklistItems.forEach((key, i) => {

          if (y + rowH + 80 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            y = doc.page.margins.top;
          }

          doc.rect(tableX, y, tableW, rowH).stroke();
          doc.text(String(i + 1), tableX + 6, y + 6);
          doc.text(checklistItemsLabels(key), tableX + colSrW + 6, y + 6);
          doc.text(String(checklistData[key] || ""), tableX + colSrW + colDescW + 6, y + 6);
          doc.text(String(checklistData[`${key}_remark`] || ""), tableX + colSrW + colDescW + colRespW + 6, y + 6);

          y += rowH;
        });

        /*******************************
         *  DECLARATION
         ******************************/
        y += 20;

        if (y + 250 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        doc.rect(leftX, y, usableWidth, 30).stroke();
        doc.font("Hindi").fontSize(12)
          .text("Driver Declaration:", leftX + 10, y + 8);

        y += 30;
        doc.rect(leftX, y, tableW, 120).stroke();

        doc.font("Hindi").fontSize(12)
          .text(
            "मैं यह घोषणा करता हूँ कि मैं कोई शराब या नशीली दवा नहीं पी है। "
            + "मैंने वाहन की जांच की है और वह पूरी तरह सुरक्षित है।",
            leftX + 10, y + 10, { width: tableW - 20 }
          );

        doc.rect(leftX + 10, y + 55, 12, 12).stroke();
        doc.font("Hindi").text("मैं सहमत हूँ", leftX + 30, y + 53);

        y += 140;

        /*******************************
         * DRIVER DETAILS TABLE
         ******************************/
        const rowHeight = 40;
        const half = tableW / 2;

        function drawRow(label1, v1, label2, v2) {
          doc.rect(leftX, y, half, rowHeight).stroke();
          doc.rect(leftX + half, y, half, rowHeight).stroke();

          doc.font("Helvetica-Bold").text(label1, leftX + 8, y + 8);
          doc.font("Helvetica").text(String(v1 || ""), leftX + 8, y + 25);

          doc.font("Helvetica-Bold").text(label2, leftX + half + 8, y + 8);
          doc.font("Helvetica").text(String(v2 || ""), leftX + half + 8, y + 25);

          y += rowHeight;
        }

        drawRow("Driver Name", data.driver_name, "Driver Contact No.", data.driver_contact_no);
        drawRow("Driver DL No.", data.driver_dl_no, "DL Valid Till", data.dl_valid_till);
        drawRow("DDT Date", data.ddt_date, "DDT Card", data.ddt_card_by);
        drawRow("Driver Sign.", data.driver_sig, "Inspected By", data.inspected_by);

        /*******************************
         * SIGNATURE BLOCK
         ******************************/
        y += 20;

        if (y + 160 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        doc.rect(leftX, y, tableW, 160).stroke();

        const leftColW = tableW * 0.45;

        // row 1
        doc.font("Helvetica-Bold").text("Prepared By :", leftX + 10, y + 10);
        doc.rect(leftX + 10, y + 25, leftColW - 20, 25).stroke();
        doc.font("Helvetica").text("Transport Incharge", leftX + leftColW + 20, y + 15);

        // row 2
        y += rowHeight;
        doc.font("Helvetica-Bold").text("Approved By :", leftX + 10, y + 10);
        doc.rect(leftX + 10, y + 25, leftColW - 20, 25).stroke();
        doc.font("Helvetica").text("General Manager", leftX + leftColW + 20, y + 15);

        // row 3
        y += rowHeight;
        doc.font("Helvetica").text("Revision Date : 29-08-2023", leftX + 10, y + 15);
        doc.text("CLASSIFIED • CONFIDENTIAL • FOR INTERNAL USE ONLY",
          leftX + leftColW + 20, y + 15);

        /*******************************
         * END PDF
         ******************************/
        doc.end();

        stream.on("finish", () => {
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "Commit failed", error: err });
              });
            }

            const pdfUrl = `http://localhost:3456/OwnVehicle_inspection_pdfs/inspection_${insertId}.pdf`;

            res.json({
              message: "Data saved and PDF generated!",
              id: insertId,
              pdfUrl
            });
          });
        });

        stream.on("error", (err) => {
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
          return db.rollback(() => {
            res.status(500).json({
              message: "PDF write failed. Rollback done.",
              error: err
            });
          });
        });

      } catch (err) {
        return db.rollback(() => {
          res.status(500).json({ message: "PDF generation failed.", error: err });
        });
      }
    });
  });
});



//---------------------------------Spot Hired Vehicle Inspection API-----------------------------------------

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

  
  // TRANSACTION START
  db.beginTransaction((txErr) => {
    if (txErr) {
      return res.status(500).json({ message: 'DB transaction error', error: txErr });
    }

    db.query(sql, values, (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Database error', error: err });
        });
      }

      const insertId = result.insertId;
      console.log("Data Inserted with id:", insertId);

      const pdfFolder = path.join(__dirname, "Spot-Hired-Vehicle_inspection_pdfs");
      if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder, { recursive: true });

      const pdfPath = path.join(pdfFolder, `inspection_${insertId}.pdf`);

      try {
        const doc = new PDFDocument({ size: 'A4', margin: 36 });

        // FONT REGISTER SAFE MODE
        if (hindiFont && fs.existsSync(hindiFont)) {
          doc.registerFont("Hindi", hindiFont);
        } else {
          console.warn("⚠ Hindi font missing:", hindiFont);
        }

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        /*******************************
         *  HEADER
         ******************************/
        doc.rect(18, 18, doc.page.width - 36, doc.page.height - 36).stroke();
        doc.fontSize(18).font("Helvetica-Bold")
          .text("BRINDAVAN AGRO INDUSTRIES PRIVATE LIMITED, Chhata", { align: "center" });

        doc.moveDown(0.2);
        doc.fontSize(10).font("Helvetica")
          .text("Revision No. 02 | BAIL-S-155-01-01-00-07", { align: "center" });

        doc.moveDown(0.6);
        doc.fontSize(16).font("Helvetica-Bold")
          .text("VEHICLE INSPECTION CHECKLIST-Spot Hired Vehicle ", { align: "center" });

        doc.moveDown(0.8);

        /*********************************
         * INFO TABLE
         *********************************/
        const leftX = doc.page.margins.left;
        const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidth = usableWidth / 4;
        const cellH = 48;

        function drawCell(x, y, w, h, label, value) {
          doc.rect(x, y, w, h).stroke();
          doc.font("Helvetica").fontSize(10).text(label, x + 6, y + 6);
          if (value) {
            doc.text(String(value), x + 6, y + 22);
          }
        }

        let y = doc.y;

        drawCell(leftX, y, colWidth, cellH, "Docket No. :", data.docket_no);
        drawCell(leftX + colWidth, y, colWidth, cellH, "DMC In Date & Time: ", data.dmc_in_datetime);
        drawCell(leftX + 2 * colWidth, y, colWidth, cellH, "Truck Number: ", data.truck_number);
        drawCell(leftX + 3 * colWidth, y, colWidth, cellH, "DMC Out Date & Time: ", data.dmc_out_datetime);
        y += cellH;

        drawCell(leftX, y, colWidth, cellH, "Vehicle Type: ", data.vehicle_type);
        drawCell(leftX + colWidth, y, colWidth, cellH, "Driver Safety Induction: ", data.driver_safety_induction);
        drawCell(leftX + 2 * colWidth, y, colWidth, cellH, "Transporter: ", data.transporter);
        drawCell(leftX + 3 * colWidth, y, colWidth, cellH, "Driver Counselling: ", data.driver_counselling);
        y += cellH + 10;

        /************************************
         * CHECKLIST TABLE HEADER
         ************************************/
        const tableX = leftX;
        const tableW = usableWidth;
        const colSrW = 40;
        const colDescW = tableW * 0.55;
        const colRespW = (tableW - colSrW - colDescW) / 2;
        const colRemW = colRespW;
        const rowH = 24;

        doc.font("Helvetica-Bold").fontSize(11).fillColor("white");
        doc.rect(tableX, y, tableW, rowH).fill("#222");

        doc.text("Sr. No.", tableX + 6, y + 6);
        doc.text("Checklist Description", tableX + colSrW + 6, y + 6);
        doc.text("Response", tableX + colSrW + colDescW + 6, y + 6);
        doc.text("Remarks", tableX + colSrW + colDescW + colRespW + 6, y + 6);

        y += rowH;

        doc.fillColor("black").font("Helvetica").fontSize(10);

        function checklistItemsLabels(k) {
          const map = {
            vehicle_documents: "Vehicle Documents (Insurance, PUC, RC, Tax, Fitness & Permit)",
            driver_fit_dl: "Driver Fit for Working & Their DL",
            body_condition: "Vehicle Body Condition",
            gear_condition: "Vehicle Gear Condition",
            tyre_condition: "Vehicle Tyre & Rim Condition / Spare Tyre",
            head_light: "Head Light",
            indicators: "Indicators",
            break_light: "Break Light",
            wind_shield: "Wind Shield",
            wiper: "Wiper",
            mirrors: "Rear View & Blind Spot Mirrors",
            horn: "Horn & Reverse Horn",
            first_aid_kit: "First Aid Kit",
            fire_extinguisher: "Fire Extinguisher",
            reflective_tape: "Reflective Tape / Triangle",
            rupd_supd: "RUPD and SUPD (Rear and Side Under Protection Device)",
            seat_belt: "Seat Belt",
            speed_governor: "Speed Governor",
            brake_condition: "Brake Condition",
          };
          return map[k] || k;
        }

        checklistItems.forEach((key, i) => {

          if (y + rowH + 80 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            y = doc.page.margins.top;
          }

          doc.rect(tableX, y, tableW, rowH).stroke();
          doc.text(String(i + 1), tableX + 6, y + 6);
          doc.text(checklistItemsLabels(key), tableX + colSrW + 6, y + 6);
          doc.text(String(checklistData[key] || ""), tableX + colSrW + colDescW + 6, y + 6);
          doc.text(String(checklistData[`${key}_remark`] || ""), tableX + colSrW + colDescW + colRespW + 6, y + 6);

          y += rowH;
        });

        /*******************************
         *  DECLARATION
         ******************************/
        y += 20;

        if (y + 250 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        doc.rect(leftX, y, usableWidth, 30).stroke();
        doc.font("Hindi").fontSize(12)
          .text("Driver Declaration:", leftX + 10, y + 8);

        y += 30;
        doc.rect(leftX, y, tableW, 120).stroke();

        doc.font("Hindi").fontSize(12)
          .text(
            "मैं यह घोषणा करता हूँ कि मैं कोई शराब या नशीली दवा नहीं पी है। "
            + "मैंने वाहन की जांच की है और वह पूरी तरह सुरक्षित है।",
            leftX + 10, y + 10, { width: tableW - 20 }
          );

        doc.rect(leftX + 10, y + 55, 12, 12).stroke();
        doc.font("Hindi").text("मैं सहमत हूँ", leftX + 30, y + 53);

        y += 140;

        /*******************************
         * DRIVER DETAILS TABLE
         ******************************/
        const rowHeight = 40;
        const half = tableW / 2;

        function drawRow(label1, v1, label2, v2) {
          doc.rect(leftX, y, half, rowHeight).stroke();
          doc.rect(leftX + half, y, half, rowHeight).stroke();

          doc.font("Helvetica-Bold").text(label1, leftX + 8, y + 8);
          doc.font("Helvetica").text(String(v1 || ""), leftX + 8, y + 25);

          doc.font("Helvetica-Bold").text(label2, leftX + half + 8, y + 8);
          doc.font("Helvetica").text(String(v2 || ""), leftX + half + 8, y + 25);

          y += rowHeight;
        }

        drawRow("Driver Name: ", data.driver_name, "Driver Contact No.: ", data.driver_contact_no);
        drawRow("Driver DL No.: ", data.driver_dl_no, "DL Valid Till: ", data.dl_valid_till);
        drawRow("DDT Date: ", data.ddt_date, "DDT Card: ", data.ddt_card_by);
        drawRow("Driver Sign.: ", data.driver_sig, "Inspected By: ", data.inspected_by);

        /*******************************
         * SIGNATURE BLOCK
         ******************************/
        y += 20;

        if (y + 160 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        doc.rect(leftX, y, tableW, 160).stroke();

        const leftColW = tableW * 0.45;

        // row 1
        doc.font("Helvetica-Bold").text("Prepared By :", leftX + 10, y + 10);
        doc.rect(leftX + 10, y + 25, leftColW - 20, 25).stroke();
        doc.font("Helvetica").text("Transport Incharge", leftX + leftColW + 20, y + 15);

        // row 2
        y += rowHeight;
        doc.font("Helvetica-Bold").text("Approved By :", leftX + 10, y + 10);
        doc.rect(leftX + 10, y + 25, leftColW - 20, 25).stroke();
        doc.font("Helvetica").text("General Manager", leftX + leftColW + 20, y + 15);

        // row 3
        y += rowHeight;
        doc.font("Helvetica").text("Revision Date : 29-08-2023", leftX + 10, y + 15);
        doc.text("CLASSIFIED • CONFIDENTIAL • FOR INTERNAL USE ONLY",
          leftX + leftColW + 20, y + 15);

        /*******************************
         * END PDF
         ******************************/
        doc.end();

        stream.on("finish", () => {
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "Commit failed", error: err });
              });
            }

            const pdfUrl = `http://localhost:3456/Spot-Hired-Vehicle_inspection_pdfs/inspection_${insertId}.pdf`; // Generate Only Spot Hired Vehicle

            res.json({
              message: "Data saved and PDF generated!",
              id: insertId,
              pdfUrl
            });
          });
        });

        stream.on("error", (err) => {
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
          return db.rollback(() => {
            res.status(500).json({
              message: "PDF write failed. Rollback done.",
              error: err
            });
          });
        });

      } catch (err) {
        return db.rollback(() => {
          res.status(500).json({ message: "PDF generation failed.", error: err });
        });
      }
    });
  });




  // db.query(sql, values, (err, result) => {
  //   if (err) {
  //     console.error('❌ Error saving data:', err);
  //     return res.status(500).json({ message: 'Database error', error: err });
  //   }
  //   res.json({ message: '✅ Data saved successfully!', id: result.insertId });
  // });
});




//--------------------------------------------------Dedicated Vehicle Inspection API------------------------------------------------------------------
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

  
  // TRANSACTION START
  db.beginTransaction((txErr) => {
    if (txErr) {
      return res.status(500).json({ message: 'DB transaction error', error: txErr });
    }

    db.query(sql, values, (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Database error', error: err });
        });
      }

      const insertId = result.insertId;
      console.log("Data Inserted with id:", insertId);

      const pdfFolder = path.join(__dirname, "Dedicated-form_Vehicle_inspection_pdfs");
      if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder, { recursive: true });

      const pdfPath = path.join(pdfFolder, `inspection_${insertId}.pdf`);

      try {
        const doc = new PDFDocument({ size: 'A4', margin: 36 });

        // FONT REGISTER SAFE MODE
        if (hindiFont && fs.existsSync(hindiFont)) {
          doc.registerFont("Hindi", hindiFont);
        } else {
          console.warn("⚠ Hindi font missing:", hindiFont);
        }

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        /*******************************
         *  HEADER
         ******************************/
        doc.rect(18, 18, doc.page.width - 36, doc.page.height - 36).stroke();
        doc.fontSize(18).font("Helvetica-Bold")
          .text("BRINDAVAN AGRO INDUSTRIES PRIVATE LIMITED, Chhata", { align: "center" });

        doc.moveDown(0.2);
        doc.fontSize(10).font("Helvetica")
          .text("Revision No. 02 | BAIL-S-155-01-01-00-07", { align: "center" });

        doc.moveDown(0.6);
        doc.fontSize(16).font("Helvetica-Bold")
          .text("VEHICLE INSPECTION CHECKLIST-Dedicated ", { align: "center" });

        doc.moveDown(0.8);

        /*********************************
         * INFO TABLE
         *********************************/
        const leftX = doc.page.margins.left;
        const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidth = usableWidth / 4;
        const cellH = 48;

        function drawCell(x, y, w, h, label, value) {
          doc.rect(x, y, w, h).stroke();
          doc.font("Helvetica").fontSize(10).text(label, x + 6, y + 6);
          if (value) {
            doc.text(String(value), x + 6, y + 22);
          }
        }

        let y = doc.y;

        drawCell(leftX, y, colWidth, cellH, "Docket No. :", data.docket_no);
        drawCell(leftX + colWidth, y, colWidth, cellH, "DMC In Date & Time: ", data.dmc_in_datetime);
        drawCell(leftX + 2 * colWidth, y, colWidth, cellH, "Truck Number: ", data.truck_number);
        drawCell(leftX + 3 * colWidth, y, colWidth, cellH, "DMC Out Date & Time: ", data.dmc_out_datetime);
        y += cellH;

        drawCell(leftX, y, colWidth, cellH, "Vehicle Type: ", data.vehicle_type);
        drawCell(leftX + colWidth, y, colWidth, cellH, "Driver Safety Induction: ", data.driver_safety_induction);
        drawCell(leftX + 2 * colWidth, y, colWidth, cellH, "Transporter: ", data.transporter);
        drawCell(leftX + 3 * colWidth, y, colWidth, cellH, "Driver Counselling: ", data.driver_counselling);
        y += cellH + 10;

        /************************************
         * CHECKLIST TABLE HEADER
         ************************************/
        const tableX = leftX;
        const tableW = usableWidth;
        const colSrW = 40;
        const colDescW = tableW * 0.55;
        const colRespW = (tableW - colSrW - colDescW) / 2;
        const colRemW = colRespW;
        const rowH = 24;

        doc.font("Helvetica-Bold").fontSize(11).fillColor("white");
        doc.rect(tableX, y, tableW, rowH).fill("#222");

        doc.text("Sr. No.", tableX + 6, y + 6);
        doc.text("Checklist Description", tableX + colSrW + 6, y + 6);
        doc.text("Response", tableX + colSrW + colDescW + 6, y + 6);
        doc.text("Remarks", tableX + colSrW + colDescW + colRespW + 6, y + 6);

        y += rowH;

        doc.fillColor("black").font("Helvetica").fontSize(10);

        function checklistItemsLabels(k) {
          const map = {
            vehicle_documents: "Vehicle Documents (Insurance, PUC, RC, Tax, Fitness & Permit)",
            driver_fit_dl: "Driver Fit for Working & Their DL",
            body_condition: "Vehicle Body Condition",
            gear_condition: "Vehicle Gear Condition",
            tyre_condition: "Vehicle Tyre & Rim Condition / Spare Tyre",
            head_light: "Head Light",
            indicators: "Indicators",
            break_light: "Break Light",
            wind_shield: "Wind Shield",
            wiper: "Wiper",
            mirrors: "Rear View & Blind Spot Mirrors",
            horn: "Horn & Reverse Horn",
            first_aid_kit: "First Aid Kit",
            fire_extinguisher: "Fire Extinguisher",
            reflective_tape: "Reflective Tape / Triangle",
            rupd: "RUPD (Rear Under Protection Device)",
            supd: "SUPD (Side Under Protection Device)",
            seat_belt: "Seat Belt",
            speed_governor: "Speed Governor",
            brake_condition: "Brake Condition",
            steering_condition: "Steering Condition",
            products_stored: "Products Stored",
            walk_around: "360° Walk Around",
            empty_bucket: "Empty Bucket"
          };
          return map[k] || k;
        }

        checklistItems.forEach((key, i) => {

          if (y + rowH + 80 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            y = doc.page.margins.top;
          }

          doc.rect(tableX, y, tableW, rowH).stroke();
          doc.text(String(i + 1), tableX + 6, y + 6);
          doc.text(checklistItemsLabels(key), tableX + colSrW + 6, y + 6);
          doc.text(String(checklistData[key] || ""), tableX + colSrW + colDescW + 6, y + 6);
          doc.text(String(checklistData[`${key}_remark`] || ""), tableX + colSrW + colDescW + colRespW + 6, y + 6);

          y += rowH;
        });

        /*******************************
         *  DECLARATION
         ******************************/
        y += 20;

        if (y + 250 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        doc.rect(leftX, y, usableWidth, 30).stroke();
        doc.font("Hindi").fontSize(12)
          .text("Driver Declaration:", leftX + 10, y + 8);

        y += 30;
        doc.rect(leftX, y, tableW, 120).stroke();

        doc.font("Hindi").fontSize(12)
          .text(
            "मैं यह घोषणा करता हूँ कि मैं कोई शराब या नशीली दवा नहीं पी है। "
            + "मैंने वाहन की जांच की है और वह पूरी तरह सुरक्षित है।",
            leftX + 10, y + 10, { width: tableW - 20 }
          );

        doc.rect(leftX + 10, y + 55, 12, 12).stroke();
        doc.font("Hindi").text("मैं सहमत हूँ", leftX + 30, y + 53);

        y += 140;

        /*******************************
         * DRIVER DETAILS TABLE
         ******************************/
        const rowHeight = 40;
        const half = tableW / 2;

        function drawRow(label1, v1, label2, v2) {
          doc.rect(leftX, y, half, rowHeight).stroke();
          doc.rect(leftX + half, y, half, rowHeight).stroke();

          doc.font("Helvetica-Bold").text(label1, leftX + 8, y + 8);
          doc.font("Helvetica").text(String(v1 || ""), leftX + 8, y + 25);

          doc.font("Helvetica-Bold").text(label2, leftX + half + 8, y + 8);
          doc.font("Helvetica").text(String(v2 || ""), leftX + half + 8, y + 25);

          y += rowHeight;
        }

        drawRow("Driver Name: ", data.driver_name, "Driver Contact No.: ", data.driver_contact_no);
        drawRow("Driver DL No.: ", data.driver_dl_no, "DL Valid Till: ", data.dl_valid_till);
        drawRow("DDT Date: ", data.ddt_date, "DDT Card: ", data.ddt_card_by);
        drawRow("Driver Sign.: ", data.driver_sig, "Inspected By: ", data.inspected_by);

        /*******************************
         * SIGNATURE BLOCK
         ******************************/
        y += 20;

        if (y + 160 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        doc.rect(leftX, y, tableW, 160).stroke();

        const leftColW = tableW * 0.45;

        // row 1
        doc.font("Helvetica-Bold").text("Prepared By :", leftX + 10, y + 10);
        doc.rect(leftX + 10, y + 25, leftColW - 20, 25).stroke();
        doc.font("Helvetica").text("Transport Incharge", leftX + leftColW + 20, y + 15);

        // row 2
        y += rowHeight;
        doc.font("Helvetica-Bold").text("Approved By :", leftX + 10, y + 10);
        doc.rect(leftX + 10, y + 25, leftColW - 20, 25).stroke();
        doc.font("Helvetica").text("General Manager", leftX + leftColW + 20, y + 15);

        // row 3
        y += rowHeight;
        doc.font("Helvetica").text("Revision Date : 29-08-2023", leftX + 10, y + 15);
        doc.text("CLASSIFIED • CONFIDENTIAL • FOR INTERNAL USE ONLY",
          leftX + leftColW + 20, y + 15);

        /*******************************
         * END PDF
         ******************************/
        doc.end();

        stream.on("finish", () => {
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "Commit failed", error: err });
              });
            }

            const pdfUrl = `http://localhost:3456/Dedicated-form_Vehicle_inspection_pdfs/inspection_${insertId}.pdf`; // Generate Only Spot Hired Vehicle

            res.json({
              message: "Data saved and PDF generated!",
              id: insertId,
              pdfUrl
            });
          });
        });

        stream.on("error", (err) => {
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
          return db.rollback(() => {
            res.status(500).json({
              message: "PDF write failed. Rollback done.",
              error: err
            });
          });
        });

      } catch (err) {
        return db.rollback(() => {
          res.status(500).json({ message: "PDF generation failed.", error: err });
        });
      }
    });
  });






  // db.query(sql, values, (err, result) => {
  //   if (err) {
  //     console.error('❌ Error saving data:', err);
  //     return res.status(500).json({ message: 'Database error', error: err });
  //   }
  //   console.log("Data Insert Succesfully")
  //   res.json({ message: '✅ Data saved successfully!', id: result.insertId });
  // });
});



app.listen(PORT, () => console.log('🚀 Server running on port 3456'));

// coloumns = 54
// values= 42 fix krna ha value
