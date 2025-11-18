import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import BetaBadge from '../../BetaBadge';

const checklistItems = [
  { key: 'vehicle_documents', label: 'Vehicle Documents (Insurance, PUC, RC, Tax, Fitness & Permit)' },
  { key: 'driver_fit_dl', label: 'Driver Fit for Working & Their DL' },
  { key: 'body_condition', label: 'Vehicle Body Condition' },
  { key: 'gear_condition', label: 'Vehicle Gear Condition' },
  { key: 'tyre_condition', label: 'Vehicle Tyre and Rim Condition Or Spare Tyre' },
  { key: 'head_light', label: 'Head Light' },
  { key: 'indicators', label: 'Indicators' },
  { key: 'break_light', label: 'Break Light' },
  { key: 'wind_shield', label: 'Wind Shield' },
  { key: 'wiper', label: 'Wiper (Both Side Working)' },
  { key: 'mirrors', label: 'Rear View & Blind Spot Mirrors (Check for Clear Visibility)' },
  { key: 'horn', label: 'Horn & Reverse Horn (Working Condition)' },
  { key: 'first_aid_kit', label: 'Basic First aid Kit' },
  { key: 'fire_extinguisher', label: 'Fire Extinguisher' },
  { key: 'reflective_tape', label: 'Reflective Tape & Breakdown Safety Triangle' },
  { key: 'rupd_supd', label: 'RUPD and SUPD (Rear and Side Under Protection Device)' },
  { key: 'seat_belt', label: 'Seat Belt (Both Side)' },
  { key: 'brake_condition', label: 'Brake Condition, Hand Brake or Wheel Chocks' },
];

const schema = yup.object().shape({
  docket_no: yup.string().required('Required'),
  truck_number: yup.string().required('Required'),
  vehicle_type: yup.string().required('Required'),
  dmc_in_datetime: yup.string().required('Required'),
  dmc_out_datetime: yup.string().required('Required'),
  checklist: yup.array().of(
    yup.object().shape({
      response: yup.string().required('Required'),
      remark: yup.string()
    })
  ),
  driver_declaration: yup.bool().oneOf([true], 'Required'),
  driver_name: yup.string().trim().required('Driver name required'),
  driver_contact_no: yup.string().trim().required('Driver contact no required'),
  driver_dl_no: yup.string().trim().required('Driver DL no required'),
  dl_valid_till: yup.string().required('DL valid till required'),
  ddt_date: yup.string().required('DDT date required'),
  ddt_card_by: yup.string().trim().nullable(),
  driver_sig: yup.string().trim().required('Driver signature required'),
  inspected_by: yup.string().trim().required('Inspected by required'),
});

function SpotRm_PM_Form() {
  const pdfOpened= React.useRef(false);
  const isSubmitting= React.useRef(false); // only add one time entry reason:-  user not submit again and again
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      checklist: checklistItems.map(() => ({ response: '', remark: '' })),
      driver_declaration: false
    }
  });

  const onSubmit = async (data) => {
    if(isSubmitting.current){
      return isSubmitting.current= true;
    }
    try {
      // convert checklist array into object key-value pairs for database
      const checklistData = {};
      checklistItems.forEach((item, i) => {
        checklistData[item.key] = data.checklist[i].response;
        checklistData[`${item.key}_remark`] = data.checklist[i].remark;
      });

      const payload = {
        docket_no: data.docket_no,
        dmc_in_datetime: data.dmc_in_datetime,
        dmc_out_datetime: data.dmc_out_datetime,
        truck_number: data.truck_number,
        vehicle_type: data.vehicle_type,
        transporter: data.transporter,
        driver_safety_induction: data.driver_safety_induction,
        driver_counselling: data.driver_counselling,
        ...checklistData,
        driver_declaration: data.driver_declaration,
        driver_name: data.driver_name,
        driver_contact_no: data.driver_contact_no,
        driver_dl_no: data.driver_dl_no,
        dl_valid_till: data.dl_valid_till,
        ddt_date: data.ddt_date,
        ddt_card_by: data.ddt_card_by,
        driver_sig: data.driver_sig,
        inspected_by: data.inspected_by
      };

      const res = await fetch('http://localhost:3456/spot-rm-pm', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        alert('✅ Form submitted successfully!');
        if (result.pdfUrl && !pdfOpened.current) {
            pdfOpened.current=true;
          const link = document.createElement('a');
          link.href = result.pdfUrl;
          link.download = `Spot-Hired-Vehicle_inspection_${result.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          }
        reset();
      } else {
        alert(`⚠️ Submission failed: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Network error.');
    }
    finally{ // finally feature work always run try or catch run or not but finally always execute
      isSubmitting.current= false
    }
  };

  return (
    <>
    <BetaBadge/>
    
    <div className="container py-4" style={{ border: '1.5px solid black' }}>
      <div className="text-center mb-3">
        <h4>BRINDAVAN AGRO INDUSTRIES PRIVATE LIMITED, Chhata (Mathura)</h4>
        <small>Revision No. 02 | BAIL-S-155-01-01-00-10</small>
        <h5 className="mt-3">VEHICLE INSPECTION CHECKLIST - Spot RM PM</h5>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Info Table */}
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td>Docket No.</td>
              <td><textarea className="form-control" {...register('docket_no')} />
              {errors.docket_no && <small className="text-danger d-block">Required</small>}
              </td>
              <td>DMC In Date & Time</td>
              <td><input type="datetime-local" className="form-control" {...register('dmc_in_datetime')} />
              {errors.dmc_in_datetime && <small className="text-danger d-block">Required</small>}
              </td>
            </tr>
            <tr>
              <td>Truck Number</td>
              <td><textarea className="form-control" {...register('truck_number')} />
              {errors.truck_number && <small className="text-danger d-block">Required</small>}
              </td>
              <td>DMC Out Date & Time</td>
              <td><input type="datetime-local" className="form-control" {...register('dmc_out_datetime')} />
              {errors.dmc_out_datetime && <small className="text-danger d-block">Required</small>}
              </td>
            </tr>
            <tr>
              <td>Vehicle Type</td>
              <td><textarea className="form-control" {...register('vehicle_type')} />
              {errors.vehicle_type && <small className="text-danger d-block">Required</small>}
              </td>
              <td>Driver Safety Induction</td>
              <td><textarea className="form-control" {...register('driver_safety_induction')} />
              {errors.driver_safety_induction && <small className="text-danger d-block">Required</small>}
              </td>
            </tr>
            <tr>
              <td>Transporter</td>
              <td><textarea className="form-control" {...register('transporter')} /></td>
              <td>Driver Counselling</td>
              <td><textarea className="form-control" {...register('driver_counselling')} /></td>
            </tr>
          </tbody>
        </table>

        {/* Checklist */}
        <table className="table table-bordered table-striped" style={{ border: '2px solid black' }}>
          <thead className="table-dark">
            <tr>
              <th>Sr. No.</th>
              <th>Checklist Description</th>
              <th>Response</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {checklistItems.map((item, i) => (
              <tr key={item.key}>
                <td>{i + 1}</td>
                <td>{item.label}</td>
                <td>
                  <select className="form-select" {...register(`checklist.${i}.response`)}>
                    <option value="">Select</option>
                    <option>Yes</option>
                    <option>No</option>
                    <option>N/A</option>
                  </select>
                  {errors.checklist?.[i]?.response && <small className="text-danger">Required</small>}
                </td>
                <td>
                  <textarea className="form-control" {...register(`checklist.${i}.remark`)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Declaration */}
        <div className="my-3">
          <p><strong>Driver Declaration:</strong> मैं यह घोषणा करता हूँ कि मैं कोई शराब या नशीली दवा नहीं पी है। मैंने वाहन की जांच की है और वह पूरी तरह से सुरक्षित है...</p>
          <div className="form-check">
            <input type="checkbox" className="form-check-input" {...register('driver_declaration')} />
            <label className="form-check-label">मैं सहमत हूँ</label>
            {errors.driver_declaration && <small className="text-danger d-block">Required</small>}
          </div>
        </div>

        {/* Signatures */}
        <table className="table table-bordered" style={{ border: '2px solid black' }}>
          <tbody>
            <tr>
              <td>Driver Name</td>
              <td><textarea className="form-control" {...register('driver_name')} />
              {errors.driver_name && <small className="text-danger d-block">Required</small>}
              </td>
              <td>Driver Contact No.</td>
              <td><textarea className="form-control" {...register('driver_contact_no')} />
              {errors.driver_contact_no && <small className="text-danger d-block">Required</small>}
              </td>
            </tr>
            <tr>
              <td>Driver DL No.</td>
              <td><textarea className="form-control" {...register('driver_dl_no')} />
              {errors.driver_dl_no && <small className="text-danger d-block">Required</small>}
              </td>
              <td>DL Valid Till</td>
              <td><input type="date" className="form-control" {...register('dl_valid_till')} />
              {errors.dl_valid_till && <small className="text-danger d-block">Required</small>}
              </td>
            </tr>
            <tr>
              <td>DDT Date</td>
              <td><input type="date" className="form-control" {...register('ddt_date')} />
              {errors.ddt_date && <small className="text-danger d-block">Required</small>}
              </td>
              <td>DDT Card</td>
              <td><textarea className="form-control" {...register('ddt_card_by')} />
              {errors.ddt_card_by && <small className="text-danger d-block">Required</small>}
              </td>
            </tr>
            <tr>
              <td>Driver Sign.</td>
              <td><textarea className="form-control" placeholder="Name as signature" {...register('driver_sig')} />
              {errors.driver_sig && <small className="text-danger d-block">Required</small>}
              </td>
              <td>Inspected By</td>
              <td><textarea className="form-control" {...register('inspected_by')} />
              {errors.inspected_by && <small className="text-danger d-block">Required</small>}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="table table-bordered w-100" style={{ border: "2px solid black" }}>
  <tbody>
    <tr>
      {/* LEFT CELL */}
      <td style={{ width: "30%", textAlign: "left" }}>
        <p >Prepared By</p>
      </td>

      {/* RIGHT CELL */}
      <td style={{ width: "50%" }}>
        <p>Safetey Team</p>
      </td>
    </tr>

    <tr>
      <td style={{ width: "30%", textAlign: "left" }}>
        <p>Approved By</p>
      </td>

      <td>
        <p>Safety Manager</p>
      </td>
    </tr>

    <tr>
      <td style={{ width: "30%", textAlign: "left" }}>
        <p>Revision Date :</p>
        <p>28-10-2024</p>
      </td>

      <td>
        <p>CLASSIFIED • CONFIDENTIAL • FOR INTERNAL USE ONLY</p>
      </td>
    </tr>
  </tbody>
</table>


        <div className="text-center my-3">
          <button type="submit" className="btn btn-primary me-2">Submit & Save</button>
          {/* <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print</button> */}
          <button type="button" className="btn btn-secondary">Save as Draft</button>
        </div>
      </form>
    </div>
    </>
  );
}

export default SpotRm_PM_Form;
