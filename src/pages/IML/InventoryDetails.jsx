// InventoryDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY_INVENTORY_FOLLOWUPS = "iml_inventory_followups";

const InventoryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state || {};

  const [form, setForm] = useState({
    company: "",
    product: "",
    size: "",
    countedQty: "",
    finalQty: "",
    remarks: "",
  });

  const [followups, setFollowups] = useState([]);

  // Load data & followups
  useEffect(() => {
    if (!entry) return;
    const entryId = entry.id;

    // Prefill static fields
    setForm((prev) => ({
      ...prev,
      company: entry.company || "",
      product: entry.product || "",
      size: entry.size || "",
      countedQty: entry.qty || "",
      finalQty: "",
      remarks: "",
    }));

    // Load followup history
    const stored = localStorage.getItem(STORAGE_KEY_INVENTORY_FOLLOWUPS);
    const allData = stored ? JSON.parse(stored) : {};
    const history = allData[entryId] || [];
    setFollowups(history);
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addFollowup = () => {
    if (!form.finalQty || !form.remarks) {
      alert("Please enter both Final Quantity and Remarks");
      return;
    }

    const newFollowup = {
      date: new Date().toLocaleDateString("en-GB"),
      finalQty: form.finalQty,
      remarks: form.remarks,
    };

    const updated = [...followups, newFollowup];
    setFollowups(updated);

    const entryId = entry.id;
    const stored = localStorage.getItem(STORAGE_KEY_INVENTORY_FOLLOWUPS);
    const allData = stored ? JSON.parse(stored) : {};
    allData[entryId] = updated;
    localStorage.setItem(
      STORAGE_KEY_INVENTORY_FOLLOWUPS,
      JSON.stringify(allData)
    );

    // clear only finalQty and remarks
    setForm((prev) => ({
      ...prev,
      finalQty: "",
      remarks: "",
    }));

    alert("Final quantity sent to Billing & Dispatch");
  };

  const handleBack = () => {
    navigate("/iml/inventoryManagement");
  };

  const handleSubmit = () => {
    // If you want to also update main inventory entry with last finalQty, you can do it here.
    alert("Inventory verification data saved successfully!");
    handleBack();
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] text-gray-800 font-bold m-0">
          Inventory Verification
        </h1>

        <button
          onClick={handleBack}
          className="flex items-center gap-[0.4vw] px-[1vw] py-[0.4vw] text-[0.8vw] bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[0.9vw] h-[0.9vw]"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* Verification Form */}
      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
        <div className="grid grid-cols-4 gap-[1vw] mb-[1vw]">
          {/* Company */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              disabled
              className="w-full px-[0.7vw] py-[0.6vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Product */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Product
            </label>
            <input
              type="text"
              name="product"
              value={form.product}
              disabled
              className="w-full px-[0.7vw] py-[0.6vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Size
            </label>
            <input
              type="text"
              name="size"
              value={form.size}
              disabled
              className="w-full px-[0.7vw] py-[0.6vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Counted qty (from production/inventory count) */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Counted Quantity
            </label>
            <input
              type="text"
              name="countedQty"
              value={form.countedQty}
              disabled
              className="w-full px-[0.7vw] py-[0.6vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Final quantity + remarks */}
        <div className="border-t border-gray-300 pt-[1vw]">
          <div className="grid grid-cols-4 gap-[1.5vw] mb-[1vw]">
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Final Quantity for Billing
              </label>
              <input
                type="number"
                name="finalQty"
                value={form.finalQty}
                onChange={handleChange}
                placeholder="Enter final quantity"
                className="w-full px-[0.7vw] py-[0.6vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Remarks
              </label>
              <input
                type="text"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks for Billing / Dispatch"
                className="w-full px-[0.7vw] py-[0.6vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700 opacity-0 select-none">
                Add
              </label>
              <button
                onClick={addFollowup}
                className="px-[1vw] py-[0.6vw] text-[0.85vw] bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors cursor-pointer"
              >
                Send to Billing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
        <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[1vw]">
          Dispatch Instruction History
        </h3>

        {followups.length === 0 ? (
          <p className="text-[0.9vw] text-gray-500 m-0">
            No history available. Once you send final quantity, it will appear
            here.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[25vh]">
            <table className="w-full border-collapse text-[0.85vw]">
              <thead className="sticky top-0 left-0">
                <tr className="bg-gray-100">
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Date
                  </th>
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Final Quantity
                  </th>
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...followups].reverse().map((f, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                      {f.date}
                    </td>
                    <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                      {f.finalQty}
                    </td>
                    <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                      {f.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit (optional global save) */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-[1.25vw] py-[0.55vw] text-[1vw] bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default InventoryDetails;
