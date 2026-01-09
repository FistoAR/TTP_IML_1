// PurchaseDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY_TRACKING = "iml_tracking_followups";
const STORAGE_KEY_LABEL = "iml_label_followups";
const STORAGE_KEY_METADATA = "iml_purchase_metadata"; // NEW: For storing label type and supplier

const rgbaToString = (rgba) => {
  if (!rgba || typeof rgba !== "object") return "";
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
};

// Helper function to calculate total quantity used from followups
const calculateUsedQuantity = (followups) => {
  if (!followups || followups.length === 0) return 0;

  return followups.reduce((total, followup) => {
    // Remove commas and parse as number
    const qty =
      parseInt(followup.quantity.toString().replace(/,/g, ""), 10) || 0;
    return total + qty;
  }, 0);
};

// Helper function to parse quantity (handles comma-separated values)
const parseQuantity = (qtyString) => {
  if (!qtyString) return 0;
  return parseInt(qtyString.toString().replace(/,/g, ""), 10) || 0;
};

const PurchaseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry, mode } = location.state || {};

  const isTrackingSheet = mode === "tracking";

  // Tracking Sheet Form
  const [trackingForm, setTrackingForm] = useState({
    company: "",
    contact: "",
    product: "",
    size: "",
    labelType: "",
    supplierName: "",
    lidColor: "",
    tubColor: "",
    reaminingQuantity: "",
    quantity: "",
    comment: "",
  });

  // Label Quantity Sheet Form
  const [labelForm, setLabelForm] = useState({
    company: "",
    contact: "",
    product: "",
    size: "",
    lidOrTub: "lid", // radio button default
    reaminingQuantity: "",
    quantity: "",
    comment: "",
  });

  // Tracking followup history
  const [trackingFollowups, setTrackingFollowups] = useState([]);

  // Label followup history
  const [labelFollowups, setLabelFollowups] = useState([]);

  const [remainingQty, setRemainingQty] = useState(0);

  // Load data from localStorage and prefill from entry
  // Load data from localStorage and prefill from entry
  useEffect(() => {
    if (entry) {
      const entryId = entry.id;

      if (isTrackingSheet) {
        // Load tracking followups from localStorage
        const storedTracking = localStorage.getItem(STORAGE_KEY_TRACKING);
        const allTrackingData = storedTracking
          ? JSON.parse(storedTracking)
          : {};
        const followupHistory = allTrackingData[entryId] || [];
        setTrackingFollowups(followupHistory);

        // Calculate remaining quantity
        const totalQty = parseQuantity(entry.quantity || entry.qty);
        const usedQty = calculateUsedQuantity(followupHistory);
        const remaining = totalQty - usedQty;
        setRemainingQty(remaining);

        // Load metadata (labelType, supplier) from localStorage
        const storedMetadata = localStorage.getItem(STORAGE_KEY_METADATA);
        const allMetadata = storedMetadata ? JSON.parse(storedMetadata) : {};
        const metadata = allMetadata[entryId] || {};

        // Prefill form
        setTrackingForm({
          company: entry.company || "",
          contact: entry.contact || "",
          product: entry.product || "",
          size: entry.size || "",
          labelType: metadata.labelType || entry.labelType || "",
          supplierName: metadata.supplier || entry.supplier || "",
          lidColor:
            typeof entry.lidColor === "object"
              ? rgbaToString(entry.lidColor)
              : entry.lidColor || "",
          tubColor:
            typeof entry.tubColor === "object"
              ? rgbaToString(entry.tubColor)
              : entry.tubColor || "",
          reaminingQuantity: remaining.toLocaleString(), // Display with commas
          quantity: "",
          comment: "",
        });
      } else {
        // Load label followups from localStorage
        const storedLabel = localStorage.getItem(STORAGE_KEY_LABEL);
        const allLabelData = storedLabel ? JSON.parse(storedLabel) : {};
        const followupHistory = allLabelData[entryId] || [];
        setLabelFollowups(followupHistory);

        // Calculate remaining quantity
        const totalQty = parseQuantity(entry.quantity || entry.qty);
        const usedQty = calculateUsedQuantity(followupHistory);
        const remaining = totalQty - usedQty;
        setRemainingQty(remaining);

        // Prefill form
        setLabelForm({
          company: entry.company || "",
          contact: entry.contact || "",
          product: entry.product || "",
          size: entry.size || "",
          lidOrTub: "lid",
          reaminingQuantity: remaining.toLocaleString(), // Display with commas
          quantity: "",
          comment: "",
        });
      }
    }
  }, [entry, isTrackingSheet]);

  // Handle tracking form changes
  const handleTrackingChange = (e) => {
    const { name, value } = e.target;
    setTrackingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle label form changes
  const handleLabelChange = (e) => {
    const { name, value } = e.target;
    setLabelForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add tracking followup
  const addTrackingFollowup = () => {
    if (!trackingForm.quantity || !trackingForm.comment) {
      alert("Please enter both Quantity and Comment");
      return;
    }

    // Validate quantity doesn't exceed remaining
    const inputQty = parseQuantity(trackingForm.quantity);
    if (inputQty > remainingQty) {
      alert(`Quantity cannot exceed remaining quantity: ${remainingQty.toLocaleString()}`);
      return;
    }

    const newFollowup = {
      date: new Date().toLocaleDateString("en-GB"),
      quantity: trackingForm.quantity,
      comment: trackingForm.comment,
    };

    const updatedFollowups = [...trackingFollowups, newFollowup];
    setTrackingFollowups(updatedFollowups);

    // Recalculate remaining quantity
    const newRemaining = remainingQty - inputQty;
    setRemainingQty(newRemaining);

    // Save to localStorage
    const entryId = entry.id;
    const storedTracking = localStorage.getItem(STORAGE_KEY_TRACKING);
    const allTrackingData = storedTracking ? JSON.parse(storedTracking) : {};
    allTrackingData[entryId] = updatedFollowups;
    localStorage.setItem(STORAGE_KEY_TRACKING, JSON.stringify(allTrackingData));

    // Clear quantity and comment fields, update remaining quantity
    setTrackingForm((prev) => ({
      ...prev,
      quantity: "",
      comment: "",
      reaminingQuantity: newRemaining.toLocaleString(),
    }));
  };


  // Add label followup
const addLabelFollowup = () => {
  if (!labelForm.quantity || !labelForm.comment) {
    alert("Please enter both Quantity and Comment");
    return;
  }

  // Validate quantity doesn't exceed remaining
  const inputQty = parseQuantity(labelForm.quantity);
  if (inputQty > remainingQty) {
    alert(`Quantity cannot exceed remaining quantity: ${remainingQty.toLocaleString()}`);
    return;
  }

  const newFollowup = {
    date: new Date().toLocaleDateString("en-GB"),
    lidOrTub: labelForm.lidOrTub,
    quantity: labelForm.quantity,
    comment: labelForm.comment,
  };

  const updatedFollowups = [...labelFollowups, newFollowup];
  setLabelFollowups(updatedFollowups);

  // Recalculate remaining quantity
  const newRemaining = remainingQty - inputQty;
  setRemainingQty(newRemaining);

  // Save to localStorage
  const entryId = entry.id;
  const storedLabel = localStorage.getItem(STORAGE_KEY_LABEL);
  const allLabelData = storedLabel ? JSON.parse(storedLabel) : {};
  allLabelData[entryId] = updatedFollowups;
  localStorage.setItem(STORAGE_KEY_LABEL, JSON.stringify(allLabelData));

  // Clear quantity and comment fields, update remaining quantity
  setLabelForm((prev) => ({
    ...prev,
    quantity: "",
    comment: "",
    lidOrTub: "lid",
    reaminingQuantity: newRemaining.toLocaleString(),
  }));
};


  // Handle Submit (saves static fields to localStorage)
  const handleSubmit = () => {
    if (isTrackingSheet) {
      const entryId = entry.id;

      // Save metadata separately
      const storedMetadata = localStorage.getItem(STORAGE_KEY_METADATA);
      const allMetadata = storedMetadata ? JSON.parse(storedMetadata) : {};
      allMetadata[entryId] = {
        labelType: trackingForm.labelType,
        supplier: trackingForm.supplierName,
      };
      localStorage.setItem(STORAGE_KEY_METADATA, JSON.stringify(allMetadata));

      // Update the main entry with static tracking fields
      const storedEntries = localStorage.getItem("iml_purchase_entries");
      const entries = storedEntries ? JSON.parse(storedEntries) : [];
      const updatedEntries = entries.map((e) =>
        e.id === entry.id
          ? {
              ...e,
              labelType: trackingForm.labelType,
              supplier: trackingForm.supplierName,
              lidColor: trackingForm.lidColor,
              tubColor: trackingForm.tubColor,
            }
          : e
      );
      localStorage.setItem(
        "iml_purchase_entries",
        JSON.stringify(updatedEntries)
      );
      alert("Tracking sheet data saved successfully!");
    } else {
      alert("Label quantity sheet data saved successfully!");
    }
  };

  // Go back to purchase management
  const handleBack = () => {
    navigate("/iml/purchaseManagement", {
      state: {
        returnedFromSheet: mode, // Pass back which sheet the user was on
      },
    });
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header */}

      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.75vw] text-gray-800 font-bold">
          {isTrackingSheet ? "Tracking Sheet" : "Label Quantity Sheet"}
        </h1>

        <button
          onClick={handleBack}
          className="flex items-center gap-[0.4vw] px-[1.25vw] py-[0.7vw] text-[0.9vw] bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors cursor-pointer"
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

      {/* Tracking Sheet */}

      {isTrackingSheet && (
        <div className="bg-white p-[1vw] rounded-lg shadow-sm border border-gray-200">
          {/* Grid Layout - 3 columns */}

          <div className="grid grid-cols-4 gap-[1vw] mb-[1vw]">
            {/* Company Name - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Company Name
              </label>

              <input
                type="text"
                name="company"
                value={trackingForm.company}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Contact Name - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Contact Name
              </label>

              <input
                type="text"
                name="contact"
                value={trackingForm.contact}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Product - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Product
              </label>

              <input
                type="text"
                name="product"
                value={trackingForm.product}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Product Size - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Product Size
              </label>

              <input
                type="text"
                name="size"
                value={trackingForm.size}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Label Type - Editable */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Label Type
              </label>

              <input
                type="text"
                name="labelType"
                value={trackingForm.labelType}
                onChange={handleTrackingChange}
                placeholder="Enter label type"
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Supplier Name - Editable */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Supplier Name
              </label>

              <input
                type="text"
                name="supplierName"
                value={trackingForm.supplierName}
                onChange={handleTrackingChange}
                placeholder="Enter supplier name"
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Lid Color - Editable */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Lid Color
              </label>

              <input
                type="text"
                name="lidColor"
                value={trackingForm.lidColor}
                onChange={handleTrackingChange}
                placeholder="Enter lid color"
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Tub Color - Editable */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Tub Color
              </label>

              <input
                type="text"
                name="tubColor"
                value={trackingForm.tubColor}
                onChange={handleTrackingChange}
                placeholder="Enter tub color"
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          {/* Followup Section - Quantity & Comment */}

          <div className="max-h-[40vh] overflow-y-auto">
            <div className="border-t border-gray-300 pt-[1vw] mb-[1vw]">
              <div className="grid grid-cols-5 gap-[1.5vw]">
                {/* Quantity */}

                <div>
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                    Remaining Quantity
                  </label>

                  <input
                    type="text"
                    name="remaining_quantity"
                    value={trackingForm.reaminingQuantity}
                    disabled
                    placeholder="Total quantity"
                    className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors cursor-not-allowed bg-gray-100"
                  />
                </div>

                {/* Quantity */}

                <div>
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="text"
                    name="quantity"
                    value={trackingForm.quantity}
                    onChange={handleTrackingChange}
                    max={remainingQty} // Add this line
                    placeholder="Enter quantity"
                    className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                {/* Comment */}

                <div className="col-span-2">
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                    Comment
                  </label>

                  <input
                    type="text"
                    name="comment"
                    value={trackingForm.comment}
                    onChange={handleTrackingChange}
                    placeholder="Enter comment"
                    className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700 opacity-0 pointer-events-none select-none">
                    submit button
                  </label>

                  <button
                    onClick={addTrackingFollowup}
                    className="text-[0.9vw] px-[0.78vw] py-[.7vw] h-auto bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    Add Followup
                  </button>
                </div>
              </div>
            </div>

            {/* Followup History Table */}

            <div className="mb-[2vw]">
              <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[1vw]">
                Followup History
              </h3>

              {trackingFollowups.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[0.85vw]">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                          Date
                        </th>

                        <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                          Quantity
                        </th>

                        <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                          Comments
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {trackingFollowups.map((followup, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                            {followup.date}
                          </td>

                          <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                            {followup.quantity}
                          </td>

                          <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                            {followup.comment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[0.9vw] text-gray-500">
                  No followup history available.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}

          <button
            onClick={handleSubmit}
            className="px-[1.25vw] py-[0.55vw] text-[1vw] ml-auto mt-[.25vw] block bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      )}

      {/* Label Quantity Sheet */}

      {!isTrackingSheet && (
        <div className="bg-white px-[1.25vw] py-[1vw] rounded-lg shadow-sm border border-gray-200">
          {/* Grid Layout - 4 columns */}

          <div className="grid grid-cols-4 gap-[1.75vw] mb-[2vw]">
            {/* Company Name - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Company Name
              </label>

              <input
                type="text"
                name="company"
                value={labelForm.company}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Contact Name - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Contact Name
              </label>

              <input
                type="text"
                name="contact"
                value={labelForm.contact}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Product - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Product
              </label>

              <input
                type="text"
                name="product"
                value={labelForm.product}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Product Size - Disabled */}

            <div>
              <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                Product Size
              </label>

              <input
                type="text"
                name="size"
                value={labelForm.size}
                disabled
                className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Followup Section */}

          <div className="max-h-[45vh] overflow-y-auto">
            <div className="border-t border-gray-300 pt-[1vw] mb-[1vw]">
              <div className="grid grid-cols-6 gap-[1.5vw]">
                {/* remainingg quantity */}

                <div>
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                    Remaining Quantity
                  </label>

                  <input
                    type="text"
                    name="remaining_quantity"
                    value={labelForm.reaminingQuantity}
                    disabled
                    placeholder="Total quantity"
                    className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors cursor-not-allowed bg-gray-100"
                  />
                </div>

                {/* Lid or Tub - Radio Button */}

                <div>
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                    Lid or Tub
                  </label>

                  <div className="flex gap-[1vw] items-center mt-[1vw]">
                    <label className="flex items-center gap-[0.3vw] cursor-pointer">
                      <input
                        type="radio"
                        name="lidOrTub"
                        value="lid"
                        checked={labelForm.lidOrTub === "lid"}
                        onChange={handleLabelChange}
                        className="cursor-pointer"
                      />

                      <span className="text-[0.9vw]">Lid</span>
                    </label>

                    <label className="flex items-center gap-[0.3vw] cursor-pointer">
                      <input
                        type="radio"
                        name="lidOrTub"
                        value="tub"
                        checked={labelForm.lidOrTub === "tub"}
                        onChange={handleLabelChange}
                        className="cursor-pointer"
                      />

                      <span className="text-[0.9vw]">Tub</span>
                    </label>
                  </div>
                </div>

                {/* Quantity */}

                <div>
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="text"
                    name="quantity"
                    value={labelForm.quantity}
                    onChange={handleLabelChange}
                    max={remainingQty} // Add this line
                    placeholder="Enter quantity"
                    className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                {/* Comment */}

                <div className="col-span-3">
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
                    Comment
                  </label>

                  <input
                    type="text"
                    name="comment"
                    value={labelForm.comment}
                    onChange={handleLabelChange}
                    placeholder="Enter comment"
                    className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700 opacity-0 pointer-events-none select-none">
                    submit button
                  </label>

                  <button
                    onClick={addLabelFollowup}
                    className="px-[1.5vw] py-[0.7vw] text-[0.9vw] bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    Add Followup
                  </button>
                </div>
              </div>
            </div>

            {/* Followup History Table */}

            <div className="mb-[2vw]">
              <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[1vw]">
                Followup History
              </h3>

              {labelFollowups.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[0.85vw]">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                          Date
                        </th>

                        <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                          Lid or Tub
                        </th>

                        <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                          Quantity
                        </th>

                        <th className="px-[0.9vw] py-[0.9vw] text-left border border-gray-300 text-gray-700 font-semibold">
                          Comments
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {labelFollowups.map((followup, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                            {followup.date}
                          </td>

                          <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900 capitalize">
                            {followup.lidOrTub}
                          </td>

                          <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                            {followup.quantity}
                          </td>

                          <td className="px-[0.9vw] py-[0.9vw] border border-gray-300 text-gray-900">
                            {followup.comment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[0.9vw] text-gray-500">
                  No followup history available.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}

          <button
            onClick={handleSubmit}
            className="block ml-auto mt-[.25vw] px-[1.25vw] py-[0.55vw] text-[1vw] bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default PurchaseDetails;
