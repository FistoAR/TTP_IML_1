// DispatchDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY_DISPATCH_FOLLOWUPS = "iml_dispatch_followups";

const DispatchDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state || {};

  const [form, setForm] = useState({
    company: "",
    product: "",
    size: "",
    qty: "",
    invoiceNo: "",
    vehicleNo: "",
    driverName: "",
    driverPhone: "",
    dispatchDate: "",
    dispatchStatus: "Pending",
    remarks: "",
  });

  const [followups, setFollowups] = useState([]);

  // Load
  useEffect(() => {
    if (!entry) return;
    const entryId = entry.id;

    setForm((prev) => ({
      ...prev,
      company: entry.company || "",
      product: entry.product || "",
      size: entry.size || "",
      qty: entry.qty || "",
      invoiceNo: entry.invoiceNo || "",
      dispatchStatus: entry.dispatchStatus || "Pending",
      vehicleNo: entry.vehicleNo || "",
      driverName: entry.driverName || "",
      driverPhone: entry.driverPhone || "",
      dispatchDate: entry.dispatchDate || "",
      remarks: "",
    }));

    // Load followups
    const stored = localStorage.getItem(STORAGE_KEY_DISPATCH_FOLLOWUPS);
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
    if (!form.remarks) {
      alert("Please enter dispatch remarks");
      return;
    }

    const newFollowup = {
      date: new Date().toLocaleDateString("en-GB"),
      vehicleNo: form.vehicleNo,
      driverName: form.driverName,
      dispatchDate: form.dispatchDate,
      dispatchStatus: form.dispatchStatus,
      remarks: form.remarks,
    };

    const updated = [...followups, newFollowup];
    setFollowups(updated);

    const entryId = entry.id;
    const stored = localStorage.getItem(STORAGE_KEY_DISPATCH_FOLLOWUPS);
    const allData = stored ? JSON.parse(stored) : {};
    allData[entryId] = updated;
    localStorage.setItem(
      STORAGE_KEY_DISPATCH_FOLLOWUPS,
      JSON.stringify(allData)
    );

    setForm((prev) => ({
      ...prev,
      remarks: "",
    }));

    alert("Dispatch followup added!");
  };

  const handleBack = () => {
    navigate("/iml/dispatchManagement");
  };

  const handleSubmit = () => {
    // Update main dispatch entry
    const storedDispatch = localStorage.getItem("iml_dispatch_entries");
    const entries = storedDispatch ? JSON.parse(storedDispatch) : [];
    const updatedEntries = entries.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            vehicleNo: form.vehicleNo,
            driverName: form.driverName,
            driverPhone: form.driverPhone,
            dispatchDate: form.dispatchDate,
            dispatchStatus: form.dispatchStatus,
          }
        : e
    );
    localStorage.setItem(
      "iml_dispatch_entries",
      JSON.stringify(updatedEntries)
    );

    alert("Dispatch data saved successfully!");
    handleBack();
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] text-gray-800 font-bold m-0">
          Dispatch Details
        </h1>

        <button
          onClick={handleBack}
          className="flex items-center gap-[0.4vw] px-[1vw] py-[0.45vw] text-[0.85vw] bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors cursor-pointer"
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

      <div className="max-h-[70vh] overflow-y-auto">
     
        {/* Dispatch Form */}
        <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
          <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[1vw]">
            Dispatch Information
          </h3>

          <div className="grid grid-cols-5 gap-[1.25vw] pb-[1vw] mb-[.75vw] border-b border-b-gray-300">
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
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="text"
                name="qty"
                value={form.qty}
                disabled
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Invoice No */}
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Invoice No
              </label>
              <input
                type="text"
                name="invoiceNo"
                value={form.invoiceNo}
                disabled
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-[1vw] mb-[1vw]">

            {/* Vehicle No */}
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Vehicle No
              </label>
              <input
                type="text"
                name="vehicleNo"
                value={form.vehicleNo}
                onChange={handleChange}
                placeholder="TN-01-AB-1234"
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Driver Name */}
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Driver Name
              </label>
              <input
                type="text"
                name="driverName"
                value={form.driverName}
                onChange={handleChange}
                placeholder="Enter driver name"
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Driver Phone */}
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Driver Phone
              </label>
              <input
                type="text"
                name="driverPhone"
                value={form.driverPhone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Dispatch Date */}
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Dispatch Date
              </label>
              <input
                type="date"
                name="dispatchDate"
                value={form.dispatchDate}
                onChange={handleChange}
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Dispatch Status */}
            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Dispatch Status
              </label>
              <select
                name="dispatchStatus"
                value={form.dispatchStatus}
                onChange={handleChange}
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 bg-white cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Dispatched">Dispatched</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="col-span-2">
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Remarks
              </label>
              <input
                type="text"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter dispatch remarks"
                className="w-full px-[0.7vw] py-[0.55vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Add Followup */}
            <div className="col-span-1">
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700 opacity-0 select-none">
                Add
              </label>
              <button
                onClick={addFollowup}
                className="px-[1.2vw] py-[0.7vw] text-[0.9vw] bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors cursor-pointer"
              >
                Add Followup
              </button>
            </div>
          </div>
        </div>

        {/* Followup History */}
        <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
          <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[1vw]">
            Dispatch History
          </h3>

          {followups.length === 0 ? (
            <p className="text-[0.9vw] text-gray-500 m-0">
              No dispatch history available. Add followups to track dispatch
              updates.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[0.85vw]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                      Date
                    </th>
                    <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                      Vehicle No
                    </th>
                    <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                      Driver Name
                    </th>
                    <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                      Dispatch Date
                    </th>
                    <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                      Status
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
                      <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900 font-medium">
                        {f.vehicleNo || "-"}
                      </td>
                      <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                        {f.driverName || "-"}
                      </td>
                      <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                        {f.dispatchDate || "-"}
                      </td>
                      <td className="px-[0.9vw] py-[0.9vw] border border-gray-300">
                        <span
                          className={`px-[0.6vw] py-[0.25vw] rounded-full text-[0.75vw] font-medium ${
                            f.dispatchStatus === "Dispatched"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {f.dispatchStatus}
                        </span>
                      </td>
                      <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                        {f.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>


      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-[1.25vw] py-[0.55vw] mt-[.5vw] text-[1vw] bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default DispatchDetails;
