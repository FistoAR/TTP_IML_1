// ProductionDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY_PRODUCTION_FOLLOWUPS = "iml_production_followups";

// Machine options
const MACHINE_OPTIONS = ["01", "02", "03", "04", "05"];

// Received By options
const RECEIVED_BY_OPTIONS = ["Murali", "Praveen", "Kumar", "Ravi"];

// Packing Incharge options
const PACKING_INCHARGE_OPTIONS = ["Murugan", "Praveen", "Ravi", "Kumar"];

// Approved By options
const APPROVED_BY_OPTIONS = ["Murugan", "Praveen", "Ravi", "Kumar"];

// Helper: parse number safely (handles empty and strings)
const toNumber = (value) => {
  if (!value && value !== 0) return 0;
  return Number(String(value).replace(/,/g, "")) || 0;
};

// Helper: format number with commas
const formatNumber = (value) => {
  const num = toNumber(value);
  return num.toLocaleString("en-IN");
};

const ProductionDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state || {};

  // Customer Details Form
  const [customerForm, setCustomerForm] = useState({
    customerName: "",
    product: "",
    size: "",
    containerColor: "",
    machineNumber: "",
    noOfLabels: "",
    receivedBy: "",
  });

  // Add Entry Form
  const [entryForm, setEntryForm] = useState({
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD
    shift: "Day",
    packingIncharge: "",
    acceptedComponents: "",
    rejectedComponents: "",
    labelWastage: "0",
    approvedBy: "",
  });

  // Production entries history
  const [productionEntries, setProductionEntries] = useState([]);

  const [remainingLabels, setRemainingLabels] = useState(0);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load data from localStorage and prefill from entry
  useEffect(() => {
    if (entry) {
      const entryId = entry.id;

      // Load production entries from localStorage
      const storedProduction = localStorage.getItem(
        STORAGE_KEY_PRODUCTION_FOLLOWUPS
      );
      const allProductionData = storedProduction
        ? JSON.parse(storedProduction)
        : {};
      const entriesHistory = allProductionData[entryId] || [];

      const withFlags = entriesHistory.map((e) => ({
        ...e,
        submitted: e.submitted ?? true, // default to true if missing
      }));

      setProductionEntries(entriesHistory);

      // Prefill customer form
      setCustomerForm({
        customerName: entry.company || "",
        size: entry.size || "",
        product: entry.product || "",
        containerColor: entry.containerColor || "",
        machineNumber: entry.machineNumber || "",
        noOfLabels: entry.noOfLabels || "",
        receivedBy: entry.receivedBy || "",
      });

      const storedMain = localStorage.getItem("iml_production_entries");
      if (storedMain) {
        const mainEntries = JSON.parse(storedMain);
        const current = mainEntries.find((e) => e.id === entryId);

        // only set true if flag exists and is true
        if (current && current.isSubmitted === true) {
          setIsSubmitted(true);
        } else {
          setIsSubmitted(false);
        }
      } else {
        setIsSubmitted(false);
      }

      // Compute remaining labels
      const totalLabels = toNumber(entry.noOfLabels);
      const usedLabels = entriesHistory.reduce((sum, e) => {
        const accepted = toNumber(e.acceptedComponents);
        const rejected = toNumber(e.rejectedComponents);
        const wastage = toNumber(e.labelWastage);
        return sum + accepted + rejected + wastage;
      }, 0);
      setRemainingLabels(Math.max(totalLabels - usedLabels, 0));
    }
  }, [entry]);

  // Handle customer form changes
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle entry form changes
  const handleEntryChange = (e) => {
    const { name, value } = e.target;
    setEntryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle shift radio button change
  const handleShiftChange = (shift) => {
    setEntryForm((prev) => ({
      ...prev,
      shift: shift,
    }));
  };

  // Add production entry
  const addProductionEntry = () => {
    if (
      !entryForm.acceptedComponents ||
      !entryForm.rejectedComponents ||
      !entryForm.packingIncharge ||
      !entryForm.approvedBy
    ) {
      alert("Please fill all required fields");
      return;
    }

    const newEntry = {
      date: new Date().toLocaleDateString("en-GB"), // current date
      shift: entryForm.shift,
      acceptedComponents: entryForm.acceptedComponents,
      rejectedComponents: entryForm.rejectedComponents,
      labelWastage: entryForm.labelWastage || "0",
      packingIncharge: entryForm.packingIncharge,
      approvedBy: entryForm.approvedBy,
      submitted: false, // NEW: newly added row is editable
    };

    const updatedEntries = [...productionEntries, newEntry];
    setProductionEntries(updatedEntries);

    const entryId = entry.id;

    // Save followups
    const storedProduction = localStorage.getItem(
      STORAGE_KEY_PRODUCTION_FOLLOWUPS
    );
    const allProductionData = storedProduction
      ? JSON.parse(storedProduction)
      : {};
    allProductionData[entryId] = updatedEntries;
    localStorage.setItem(
      STORAGE_KEY_PRODUCTION_FOLLOWUPS,
      JSON.stringify(allProductionData)
    );

    // Recompute remaining labels
    const totalLabels = toNumber(customerForm.noOfLabels || entry.noOfLabels);
    const usedLabels = updatedEntries.reduce((sum, e) => {
      const accepted = toNumber(e.acceptedComponents);
      const rejected = toNumber(e.rejectedComponents);
      const wastage = toNumber(e.labelWastage);
      return sum + accepted + rejected + wastage;
    }, 0);
    const remaining = Math.max(totalLabels - usedLabels, 0);
    setRemainingLabels(remaining);

    // ALSO: update main production entries in localStorage so the summary screen can show it
    const storedMain = localStorage.getItem("iml_production_entries");
    const mainEntries = storedMain ? JSON.parse(storedMain) : [];
    const updatedMainEntries = mainEntries.map((e) =>
      e.id === entryId ? { ...e, remainingLabels: remaining } : e
    );
    localStorage.setItem(
      "iml_production_entries",
      JSON.stringify(updatedMainEntries)
    );

    // Clear entry form fields
    setEntryForm({
      date: new Date().toISOString().split("T")[0],
      shift: "Day",
      packingIncharge: "",
      acceptedComponents: "",
      rejectedComponents: "",
      labelWastage: "0",
      approvedBy: "",
    });
  };

  // Go back to production management
  const handleBack = () => {
    navigate("/iml/productionManagement");
  };

  // Handle Submit button
  const handleSubmit = () => {
  alert("Production details submitted successfully!");

  const entryId = entry.id;

   // Mark all current rows as submitted
  const submittedEntries = productionEntries.map((e) => ({
    ...e,
    submitted: true,
  }));
  setProductionEntries(submittedEntries);

  // Save followups with submitted=true
  const storedProduction = localStorage.getItem(
    STORAGE_KEY_PRODUCTION_FOLLOWUPS
  );
  const allProductionData = storedProduction
    ? JSON.parse(storedProduction)
    : {};
  allProductionData[entryId] = submittedEntries;
  localStorage.setItem(
    STORAGE_KEY_PRODUCTION_FOLLOWUPS,
    JSON.stringify(allProductionData)
  );

  const storedMain = localStorage.getItem("iml_production_entries");
  const mainEntries = storedMain ? JSON.parse(storedMain) : [];
  const updatedMainEntries = mainEntries.map((e) =>
    e.id === entryId ? { ...e, isSubmitted: true } : e
  );
  localStorage.setItem(
    "iml_production_entries",
    JSON.stringify(updatedMainEntries)
  );

  setIsSubmitted(true); // not strictly needed because you navigate back, but safe
  handleBack();
};


  const handleDeleteEntry = (indexToRemove) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    const entryId = entry.id;

    const updatedEntries = productionEntries.filter(
      (_e, idx) => idx !== indexToRemove
    );
    setProductionEntries(updatedEntries);

    // update followups storage
    const storedProduction = localStorage.getItem(
      STORAGE_KEY_PRODUCTION_FOLLOWUPS
    );
    const allProductionData = storedProduction
      ? JSON.parse(storedProduction)
      : {};
    allProductionData[entryId] = updatedEntries;
    localStorage.setItem(
      STORAGE_KEY_PRODUCTION_FOLLOWUPS,
      JSON.stringify(allProductionData)
    );

    // recompute remaining labels
    const totalLabels = toNumber(customerForm.noOfLabels || entry.noOfLabels);
    const usedLabels = updatedEntries.reduce((sum, e) => {
      const accepted = toNumber(e.acceptedComponents);
      const rejected = toNumber(e.rejectedComponents);
      const wastage = toNumber(e.labelWastage);
      return sum + accepted + rejected + wastage;
    }, 0);
    const remaining = Math.max(totalLabels - usedLabels, 0);
    setRemainingLabels(remaining);

    // optionally reflect remaining in main entries if you are storing it there
    const storedMain = localStorage.getItem("iml_production_entries");
    if (storedMain) {
      const mainEntries = JSON.parse(storedMain);
      const updatedMainEntries = mainEntries.map((e) =>
        e.id === entryId ? { ...e, remainingLabels: remaining } : e
      );
      localStorage.setItem(
        "iml_production_entries",
        JSON.stringify(updatedMainEntries)
      );
    }
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header */}

      <div className="flex justify-between items-center mb-[.5vw]">
        <h1 className="text-[1.6vw] text-gray-800 font-bold m-0">
          Production Details
        </h1>

        <button
          onClick={handleBack}
          className="px-[1vw] py-[0.45vw] text-[0.8vw] bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Customer Details Section */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-[1.5vw]">
        <div className="bg-blue-600 text-white px-[.95vw] py-[0.85vw] text-[1vw] font-semibold rounded-t-lg">
          Customer Details
        </div>

        <div className="p-[1vw]">
          <div className="grid grid-cols-4 gap-[1vw]">
            {/* Customer Name */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                Customer Name
              </label>

              <input
                type="text"
                name="customerName"
                value={customerForm.customerName}
                onChange={handleCustomerChange}
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-gray-50"
                readOnly
              />
            </div>

            {/* product */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                Product
              </label>

              <input
                type="text"
                name="product"
                value={customerForm.product}
                onChange={handleCustomerChange}
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-gray-50"
                readOnly
              />
            </div>

            {/* Size */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                Size
              </label>

              <input
                type="text"
                name="size"
                value={customerForm.size}
                onChange={handleCustomerChange}
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-gray-50"
                readOnly
              />
            </div>

            {/* Container Color */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                Container Color
              </label>

              <input
                type="text"
                name="containerColor"
                value={customerForm.containerColor}
                onChange={handleCustomerChange}
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600"
              />
            </div>

            {/* Machine Number */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                Machine Number
              </label>

              <select
                name="machineNumber"
                value={customerForm.machineNumber}
                onChange={handleCustomerChange}
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-white cursor-pointer"
              >
                <option value="">Select Machine</option>

                {MACHINE_OPTIONS.map((machine) => (
                  <option key={machine} value={machine}>
                    {machine}
                  </option>
                ))}
              </select>
            </div>

            {/* No. Of Labels */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                No. Of Labels
              </label>

              <input
                type="text"
                name="noOfLabels"
                value={customerForm.noOfLabels}
                onChange={handleCustomerChange}
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-gray-50"
                readOnly
              />
            </div>

            {/* Remaining Labels */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                Remaining Labels
              </label>

              <input
                type="text"
                value={formatNumber(remainingLabels)}
                readOnly
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none bg-gray-50"
              />
            </div>

            {/* Received By */}

            <div>
              <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                Received By
              </label>

              <select
                name="receivedBy"
                value={customerForm.receivedBy}
                onChange={handleCustomerChange}
                className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-white cursor-pointer"
              >
                <option value="">Select Person</option>

                {RECEIVED_BY_OPTIONS.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[35vh] ">
        {/* Add Entry Section */}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-[.75vw]">
          <div className="bg-blue-600 text-white px-[.95vw] py-[0.85vw] text-[1vw] font-semibold rounded-tl-lg rounded-tr-lg">
            Add Entry
          </div>

          <div className="p-[1vw]">
            <div className="grid grid-cols-4 gap-[1.5vw]">
              {/* Shift */}

              <div>
                <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                  Shift
                </label>

                <div className="flex gap-[2vw] mt-[0.7vw]">
                  <label className="flex items-center gap-[0.5vw] cursor-pointer">
                    <input
                      type="radio"
                      name="shift"
                      value="Day"
                      checked={entryForm.shift === "Day"}
                      onChange={() => handleShiftChange("Day")}
                      className="w-[1vw] h-[1vw] cursor-pointer"
                    />

                    <span className="text-[0.8vw] text-gray-700">Day</span>
                  </label>

                  <label className="flex items-center gap-[0.5vw] cursor-pointer">
                    <input
                      type="radio"
                      name="shift"
                      value="Night"
                      checked={entryForm.shift === "Night"}
                      onChange={() => handleShiftChange("Night")}
                      className="w-[1vw] h-[1vw] cursor-pointer"
                    />

                    <span className="text-[0.8vw] text-gray-700">Night</span>
                  </label>
                </div>
              </div>

              {/* Accepted Components */}

              <div>
                <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                  Accepted Components
                </label>

                <input
                  type="number"
                  name="acceptedComponents"
                  value={entryForm.acceptedComponents}
                  onChange={handleEntryChange}
                  className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600"
                  placeholder="Enter accepted components"
                />
              </div>

              {/* Rejected Components */}

              <div>
                <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                  Rejected Components
                </label>

                <input
                  type="number"
                  name="rejectedComponents"
                  value={entryForm.rejectedComponents}
                  onChange={handleEntryChange}
                  className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600"
                  placeholder="Enter rejected components"
                />
              </div>

              {/* Label Wastage */}

              <div>
                <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                  Label Wastage
                </label>

                <input
                  type="number"
                  name="labelWastage"
                  value={entryForm.labelWastage}
                  onChange={handleEntryChange}
                  className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600"
                  placeholder="Enter label wastage"
                />
              </div>

              {/* Packing Incharge */}

              <div>
                <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                  Packing Incharge
                </label>

                <select
                  name="packingIncharge"
                  value={entryForm.packingIncharge}
                  onChange={handleEntryChange}
                  className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-white cursor-pointer"
                >
                  <option value="">Select Incharge</option>

                  {PACKING_INCHARGE_OPTIONS.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>

              {/* Approved By */}

              <div>
                <label className="block mb-[0.5vw] text-[0.8vw] font-medium text-gray-700">
                  Approved By
                </label>

                <select
                  name="approvedBy"
                  value={entryForm.approvedBy}
                  onChange={handleEntryChange}
                  className="w-full px-[0.75vw] py-[0.45vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 bg-white cursor-pointer"
                >
                  <option value="">Select Approver</option>

                  {APPROVED_BY_OPTIONS.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add and Cancel Buttons */}

            <div className="flex justify-end gap-[1vw] mt-[.25vw]">
              <button
                onClick={addProductionEntry}
                className="px-[.9vw] py-[0.5vw] text-[0.8vw] bg-blue-700 text-white rounded-md font-medium hover:bg-[#4a6dd5] transition-colors cursor-pointer flex items-center gap-[0.5vw] cursor-pointer"
              >
                <span className="text-[.9vw]">+</span>
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Production Entries Table */}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-[1.15vw]">
          <div className="overflow-x-auto rounded-tl-lg rounded-tr-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-300 text-gray-900 ">
                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400 w-[5vw]">
                    S.no
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400">
                    Date
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400">
                    Shift Day / Night
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400">
                    Accepted Components
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400">
                    Rejected Components
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400">
                    Labels Wastages
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400">
                    Packing In charge
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-left text-[0.8vw] font-semibold border-r border-gray-400">
                    Approved By
                  </th>

                  <th className="px-[1vw] py-[0.8vw] text-center text-[0.8vw] font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {productionEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-[1vw] py-[2vw] text-center text-[0.8vw] text-gray-500"
                    >
                      No entries added yet. Add your first entry above.
                    </td>
                  </tr>
                ) : (
                  [...productionEntries].reverse().map((entry, idx) => {
                    const actualIndex = productionEntries.length - 1 - idx; // index in original array

                    return (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400 w-[5vw]">
                          {idx + 1}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400">
                          {entry.date}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400">
                          {entry.shift}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400">
                          {entry.acceptedComponents}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400">
                          {entry.rejectedComponents}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400">
                          {entry.labelWastage || "-"}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400">
                          {entry.packingIncharge}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 border-r border-gray-400">
                          {entry.approvedBy}
                        </td>

                        <td className="px-[1vw] py-[0.8vw] text-[0.8vw] text-gray-900 flex justify-center items-center">
                          {entry.submitted ? (
                            <span className="text-[0.9vw] text-green-600">✓</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteEntry(actualIndex)}
                              className="px-[0.7vw] py-[0.25vw] text-[0.75vw] bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit Button */}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="mt-[.5vw] px-[1vw] py-[0.6vw] text-[1vw] bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ProductionDetails;
