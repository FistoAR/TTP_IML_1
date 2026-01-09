// ScreenPrintingDispatchDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY_SP_DISPATCH = "sp_dispatch_entries";
const STORAGE_KEY_SP_DISPATCH_HISTORY = "sp_dispatch_history";

const ScreenPrintingDispatchDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state || {};

  const [form, setForm] = useState({
    customer: "",
    boxType: "",
    size: "",
    qtyToDispatch: "",
    qtyDispatched: "",
    invoiceNo: "",
    vehicleNo: "",
    driverName: "",
    driverPhone: "",
    dispatchDate: "",
    dispatchStatus: "Pending",
    remarks: "",
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!entry) return;

    setForm((prev) => ({
      ...prev,
      customer: entry.customer || "",
      boxType: entry.boxType || "",
      size: entry.size || "",
      qtyToDispatch: entry.qtyToDispatch || "",
      qtyDispatched: entry.qtyDispatched || "",
      invoiceNo: entry.invoiceNo || "",
      dispatchStatus: entry.dispatchStatus || "Pending",
      remarks: "",
    }));

    const stored = localStorage.getItem(STORAGE_KEY_SP_DISPATCH_HISTORY);
    const all = stored ? JSON.parse(stored) : {};
    setHistory(all[entry.id] || []);
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBack = () => {
    navigate("/screen-printing/dispatch");
  };

  const saveMainEntry = () => {
    const stored = localStorage.getItem(STORAGE_KEY_SP_DISPATCH);
    const list = stored ? JSON.parse(stored) : [];
    const updated = list.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            qtyDispatched: form.qtyDispatched,
            invoiceNo: form.invoiceNo,
            dispatchStatus: form.dispatchStatus,
          }
        : e
    );
    localStorage.setItem(STORAGE_KEY_SP_DISPATCH, JSON.stringify(updated));
  };

  const addHistory = () => {
    if (!form.dispatchDate || !form.qtyDispatched) {
      alert("Please enter dispatch date and quantity dispatched.");
      return;
    }

    const newItem = {
      date: new Date().toLocaleDateString("en-GB"),
      dispatchDate: form.dispatchDate,
      qtyDispatched: form.qtyDispatched,
      vehicleNo: form.vehicleNo,
      driverName: form.driverName,
      dispatchStatus: form.dispatchStatus,
      remarks: form.remarks,
    };

    const updatedHistory = [...history, newItem];
    setHistory(updatedHistory);

    const stored = localStorage.getItem(STORAGE_KEY_SP_DISPATCH_HISTORY);
    const all = stored ? JSON.parse(stored) : {};
    all[entry.id] = updatedHistory;
    localStorage.setItem(
      STORAGE_KEY_SP_DISPATCH_HISTORY,
      JSON.stringify(all)
    );

    saveMainEntry();

    setForm((p) => ({
      ...p,
      remarks: "",
    }));

    alert("Dispatch history updated.");
  };

  const handleSubmit = () => {
    saveMainEntry();
    alert("Dispatch details saved.");
    handleBack();
  };

  return (
    <div className="p-[1vw] bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] font-bold text-gray-800 m-0">
          Screen Printing Dispatch Details
        </h1>
        <button
          onClick={handleBack}
          className="px-[1.2vw] py-[0.5vw] text-[0.9vw] bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      {/* Form */}
      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
        <div className="grid grid-cols-4 gap-[1vw] mb-[1vw]">
          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
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
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
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
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
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
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Qty To Dispatch
            </label>
            <input
              type="number"
              name="qtyToDispatch"
              value={form.qtyToDispatch}
              disabled
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Qty Dispatched
            </label>
            <input
              type="number"
              name="qtyDispatched"
              value={form.qtyDispatched}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Invoice No
            </label>
            <input
              type="text"
              name="invoiceNo"
              value={form.invoiceNo}
              onChange={handleChange}
              placeholder="SP-INV-001"
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Vehicle No
            </label>
            <input
              type="text"
              name="vehicleNo"
              value={form.vehicleNo}
              onChange={handleChange}
              placeholder="TN-01-AB-1234"
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Driver Name
            </label>
            <input
              type="text"
              name="driverName"
              value={form.driverName}
              onChange={handleChange}
              placeholder="Enter driver name"
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Driver Phone
            </label>
            <input
              type="text"
              name="driverPhone"
              value={form.driverPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Dispatch Date
            </label>
            <input
              type="date"
              name="dispatchDate"
              value={form.dispatchDate}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Dispatch Status
            </label>
            <select
              name="dispatchStatus"
              value={form.dispatchStatus}
              onChange={handleChange}
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none bg-white focus:border-blue-600"
            >
              <option value="Pending">Pending</option>
              <option value="Dispatched">Dispatched</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
              Remarks
            </label>
            <input
              type="text"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Enter dispatch remarks"
              className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-blue-600"
            />
          </div>

          <div className="col-span-1">
            <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700 opacity-0 select-none">
              Add
            </label>
            <button
              onClick={addHistory}
              className="px-[1.2vw] py-[0.5vw] text-[0.85vw] bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
            >
              Add History
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
        <h3 className="text-[1.1vw] font-semibold text-gray-800 mb-[0.8vw]">
          Dispatch History
        </h3>

        {history.length === 0 ? (
          <p className="text-[0.85vw] text-gray-500 m-0">
            No dispatch history yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.85vw]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-[0.9vw] py-[0.6vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Entry Date
                  </th>
                  <th className="px-[0.9vw] py-[0.6vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Dispatch Date
                  </th>
                  <th className="px-[0.9vw] py-[0.6vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Qty Dispatched
                  </th>
                  <th className="px-[0.9vw] py-[0.6vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Vehicle No
                  </th>
                  <th className="px-[0.9vw] py-[0.6vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Driver
                  </th>
                  <th className="px-[0.9vw] py-[0.6vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Status
                  </th>
                  <th className="px-[0.9vw] py-[0.6vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-[0.9vw] py-[0.6vw] border border-gray-300 text-gray-900">
                      {h.date}
                    </td>
                    <td className="px-[0.9vw] py-[0.6vw] border border-gray-300 text-gray-900">
                      {h.dispatchDate || "-"}
                    </td>
                    <td className="px-[0.9vw] py-[0.6vw] border border-gray-300 text-gray-900">
                      {h.qtyDispatched || "-"}
                    </td>
                    <td className="px-[0.9vw] py-[0.6vw] border border-gray-300 text-gray-900">
                      {h.vehicleNo || "-"}
                    </td>
                    <td className="px-[0.9vw] py-[0.6vw] border border-gray-300 text-gray-900">
                      {h.driverName || "-"}
                    </td>
                    <td className="px-[0.9vw] py-[0.6vw] border border-gray-300">
                      <span
                        className={`px-[0.6vw] py-[0.25vw] rounded-full text-[0.75vw] font-medium ${
                          h.dispatchStatus === "Dispatched"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {h.dispatchStatus}
                      </span>
                    </td>
                    <td className="px-[0.9vw] py-[0.6vw] border border-gray-300 text-gray-900">
                      {h.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-[1.25vw] py-[0.5vw] text-[0.95vw] bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ScreenPrintingDispatchDetails;
