// BillingDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY_BILLING_FOLLOWUPS = "iml_billing_followups";

const BillingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state || {};

  const [form, setForm] = useState({
    company: "",
    product: "",
    size: "",
    finalQty: "",
    rate: "",
    amount: "",
    gst: "18",
    totalAmount: "",
    paymentStatus: "Pending",
    invoiceNo: "",
    invoiceDate: "",
    remarks: "",
  });

  const [followups, setFollowups] = useState([]);

  // Load data
  useEffect(() => {
    if (!entry) return;
    const entryId = entry.id;

    // Prefill
    setForm((prev) => ({
      ...prev,
      company: entry.company || "",
      product: entry.product || "",
      size: entry.size || "",
      finalQty: entry.finalQty || "",
      rate: entry.rate || "",
      amount: entry.amount || "",
      paymentStatus: entry.paymentStatus || "Pending",
      invoiceNo: entry.invoiceNo || "",
      invoiceDate: entry.invoiceDate || "",
      remarks: "",
    }));

    // Compute totals if rate and qty present
    const qty = parseFloat((entry.finalQty || "").replace(/,/g, "")) || 0;
    const rate = parseFloat(entry.rate) || 0;
    const baseAmount = qty * rate;
    const gstAmt = (baseAmount * 18) / 100;
    const total = baseAmount + gstAmt;

    setForm((prev) => ({
      ...prev,
      amount: baseAmount.toFixed(2),
      totalAmount: total.toFixed(2),
    }));

    // Load followups
    const stored = localStorage.getItem(STORAGE_KEY_BILLING_FOLLOWUPS);
    const allData = stored ? JSON.parse(stored) : {};
    const history = allData[entryId] || [];
    setFollowups(history);
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Recalculate if rate/finalQty/gst changes
      if (name === "rate" || name === "finalQty" || name === "gst") {
        const qty = parseFloat((updated.finalQty || "").replace(/,/g, "")) || 0;
        const rate = parseFloat(updated.rate) || 0;
        const gst = parseFloat(updated.gst) || 0;

        const baseAmount = qty * rate;
        const gstAmt = (baseAmount * gst) / 100;
        const total = baseAmount + gstAmt;

        updated.amount = baseAmount.toFixed(2);
        updated.totalAmount = total.toFixed(2);
      }

      return updated;
    });
  };

  const addFollowup = () => {
    if (!form.remarks) {
      alert("Please enter remarks for billing followup");
      return;
    }

    const newFollowup = {
      date: new Date().toLocaleDateString("en-GB"),
      invoiceNo: form.invoiceNo,
      totalAmount: form.totalAmount,
      paymentStatus: form.paymentStatus,
      remarks: form.remarks,
    };

    const updated = [...followups, newFollowup];
    setFollowups(updated);

    const entryId = entry.id;
    const stored = localStorage.getItem(STORAGE_KEY_BILLING_FOLLOWUPS);
    const allData = stored ? JSON.parse(stored) : {};
    allData[entryId] = updated;
    localStorage.setItem(
      STORAGE_KEY_BILLING_FOLLOWUPS,
      JSON.stringify(allData)
    );

    // clear remarks
    setForm((prev) => ({
      ...prev,
      remarks: "",
    }));

    alert("Billing followup added!");
  };

  const handleBack = () => {
    navigate("/iml/billingManagement");
  };

  const handleSubmit = () => {
    // Update main billing entry
    const storedBilling = localStorage.getItem("iml_billing_entries");
    const entries = storedBilling ? JSON.parse(storedBilling) : [];
    const updatedEntries = entries.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            rate: form.rate,
            amount: form.amount,
            paymentStatus: form.paymentStatus,
            invoiceNo: form.invoiceNo,
            invoiceDate: form.invoiceDate,
          }
        : e
    );
    localStorage.setItem("iml_billing_entries", JSON.stringify(updatedEntries));

    alert("Billing data saved successfully!");
    handleBack();
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] text-gray-800 font-bold m-0">
          Billing Details
        </h1>

        <button
          onClick={handleBack}
          className="flex items-center gap-[0.4vw] px-[1vw] py-[0.35vw] text-[0.9vw] bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors cursor-pointer"
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

    {/* overflow parent */}
    <div className="overflow-y-auto max-h-[70vh]">

      {/* Billing Form */}
      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
        <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[1vw]">
          Invoice Information
        </h3>

        <div className="grid grid-cols-4 gap-[.9vw] ">
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
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Final Quantity */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Final Quantity
            </label>
            <input
              type="text"
              name="finalQty"
              value={form.finalQty}
              onChange={handleChange}
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Rate (₹)
            </label>
            <input
              type="number"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* GST % */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              GST (%)
            </label>
            <input
              type="number"
              name="gst"
              value={form.gst}
              onChange={handleChange}
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Amount (base) */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Amount (₹)
            </label>
            <input
              type="text"
              name="amount"
              value={form.amount}
              disabled
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed font-semibold"
            />
          </div>

          {/* Total Amount (with GST) */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Total Amount (₹)
            </label>
            <input
              type="text"
              name="totalAmount"
              value={form.totalAmount}
              disabled
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md bg-blue-50 cursor-not-allowed font-bold text-blue-700"
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
              onChange={handleChange}
              placeholder="INV-12345"
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={form.invoiceDate}
              onChange={handleChange}
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Payment Status
            </label>
            <select
              name="paymentStatus"
              value={form.paymentStatus}
              onChange={handleChange}
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 bg-white cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
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
              placeholder="Enter any remarks or comments"
              className="w-full px-[0.75vw] py-[0.55vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Add Followup button */}
          <div className="col-span-1">
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700 opacity-0 select-none">
              Add
            </label>
            <button
              onClick={addFollowup}
              className="px-[1.2vw] py-[0.55vw] text-[0.9vw] bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors cursor-pointer"
            >
              Add Followup
            </button>
          </div>
        </div>
      </div>

      {/* Followup History */}
      <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200 mb-[1vw]">
        <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[1vw]">
          Billing History
        </h3>

        {followups.length === 0 ? (
          <p className="text-[0.9vw] text-gray-500 m-0">
            No billing history. Add followups to track invoice and payment
            updates.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.85vw]">
              <thead>
                <tr className="bg-gray-100 sticky top-0">
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Date
                  </th>
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Invoice No
                  </th>
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Total Amount (₹)
                  </th>
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Payment Status
                  </th>
                  <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {followups.map((f, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                      {f.date}
                    </td>
                    <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900 font-medium">
                      {f.invoiceNo || "-"}
                    </td>
                    <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900 font-semibold">
                      {f.totalAmount || "-"}
                    </td>
                    <td className="px-[0.9vw] py-[0.9vw] border border-gray-300">
                      <span
                        className={`px-[0.6vw] py-[0.25vw] rounded-full text-[0.75vw] font-medium ${
                          f.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {f.paymentStatus}
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
          className="px-[1.25vw] py-[0.55vw] text-[1vw] bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default BillingDetails;
