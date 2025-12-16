// ScreenPrintingJobWorkDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ScreenPrintingJobWorkDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, job, fromOrderForm } = location.state || {};

  const base = order || job || fromOrderForm || {};

  const [form, setForm] = useState({
    customer: "",
    boxType: "",
    size: "",
    printerName: "",
    qtySent: "",
    qtyReceived: "",
    status: "Pending",
    remarks: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      customer: base.customer || "",
      boxType: base.boxType || "",
      size: base.size || "",
      printerName: base.printerName || "",
      qtySent: base.qtyForJobWork || base.qtySent || "",
      qtyReceived: base.qtyReceived || "",
      status: base.status || "Pending",
      remarks: base.remarks || "",
    }));
  }, [base]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBack = () => {
    navigate("/screen-printing/jobwork");
  };

  const handleSave = () => {
    // TODO: persist to storage
    alert("Job work updated!");
    handleBack();
  };

  return (
    <div className="p-[1vw] bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] font-bold text-gray-800 m-0">
          Job Work Details
        </h1>
        <button
          onClick={handleBack}
          className="px-[1.2vw] py-[0.5vw] text-[0.9vw] bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-4 gap-[1vw] mb-[1vw]">
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Customer
            </label>
            <input
              type="text"
              value={form.customer}
              disabled
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Box Type
            </label>
            <input
              type="text"
              value={form.boxType}
              disabled
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Size
            </label>
            <input
              type="text"
              value={form.size}
              disabled
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Printer Name
            </label>
            <input
              type="text"
              name="printerName"
              value={form.printerName}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Qty Sent for Printing
            </label>
            <input
              type="number"
              name="qtySent"
              value={form.qtySent}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Qty Received (Printed)
            </label>
            <input
              type="number"
              name="qtyReceived"
              value={form.qtyReceived}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Job Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none bg-white focus:border-blue-600"
            >
              <option value="Pending">Pending</option>
              <option value="In Printing">In Printing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Remarks
            </label>
            <input
              type="text"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Any special notes, delays, issues..."
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-[1.25vw] py-[0.5vw] text-[0.9vw] bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenPrintingJobWorkDetails;
