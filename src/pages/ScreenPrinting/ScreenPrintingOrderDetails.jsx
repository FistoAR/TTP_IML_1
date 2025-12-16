// ScreenPrintingOrderDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ScreenPrintingOrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  const [form, setForm] = useState({
    customer: "",
    boxType: "",
    size: "",
    colors: "",
    designStatus: "Pending",
    designRemarks: "",
    qtyOrdered: "",
    qtyForJobWork: "",
    jobInstruction: "",
  });

  useEffect(() => {
    if (!order) return;
    setForm((prev) => ({
      ...prev,
      customer: order.customer || "",
      boxType: order.boxType || "",
      size: order.size || "",
      colors: order.colors || "",
      designStatus: order.designStatus || "Pending",
      qtyOrdered: order.qtyOrdered || "",
      qtyForJobWork: order.qtyForJobWork || "",
      jobInstruction: order.jobInstruction || "",
    }));
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBack = () => {
    navigate("/screen-printing/orders");
  };

  const handleSave = () => {
    // TODO: write back to localStorage / API
    alert("Screen printing order saved!");
    handleBack();
  };

  const moveToJobWork = () => {
    // simple navigation with current form data
    navigate("/screen-printing/jobwork-details", {
      state: { order, fromOrderForm: form },
    });
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] font-bold text-gray-800 m-0">
          Screen Printing Order Details
        </h1>

        <button
          onClick={handleBack}
          className="px-[1.2vw] py-[0.5vw] text-[0.9vw] bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
        <div className="grid grid-cols-4 gap-[1vw] mb-[1vw]">
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Customer
            </label>
            <input
              type="text"
              name="customer"
              value={form.customer}
              disabled
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Box Type
            </label>
            <input
              type="text"
              name="boxType"
              value={form.boxType}
              disabled
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Size
            </label>
            <input
              type="text"
              name="size"
              value={form.size}
              disabled
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Colors
            </label>
            <input
              type="text"
              name="colors"
              value={form.colors}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Qty Ordered
            </label>
            <input
              type="number"
              name="qtyOrdered"
              value={form.qtyOrdered}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Qty to Send for Printing
            </label>
            <input
              type="number"
              name="qtyForJobWork"
              value={form.qtyForJobWork}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Design Status
            </label>
            <select
              name="designStatus"
              value={form.designStatus}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none bg-white focus:border-blue-600"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-[0.4vw] text-[0.85vw] text-gray-700 font-medium">
              Design / Printing Instructions
            </label>
            <input
              type="text"
              name="jobInstruction"
              value={form.jobInstruction}
              onChange={handleChange}
              placeholder="Color, alignment, placement, special notes..."
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-[0.7vw]">
          <button
            onClick={handleSave}
            className="px-[1.25vw] py-[0.5vw] text-[0.9vw] bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={moveToJobWork}
            disabled={form.designStatus !== "Approved"}
            className={`px-[1.25vw] py-[0.5vw] text-[0.9vw] rounded-md ${
              form.designStatus === "Approved"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Send to Job Work
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenPrintingOrderDetails;
