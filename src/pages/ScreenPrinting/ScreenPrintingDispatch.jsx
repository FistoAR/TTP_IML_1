// ScreenPrintingDispatch.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY_SP_DISPATCH = "sp_dispatch_entries";

// Dummy data
const dummyDispatchEntries = [
  {
    id: 1,
    date: "16/12/2025",
    customer: "Terra Tech Packs",
    boxType: "Sweet Box",
    size: "250gms",
    qtyToDispatch: 3000,
    qtyDispatched: 1500,
    invoiceNo: "SP-INV-001",
    dispatchStatus: "Pending", // Pending / Dispatched
    comments: "Urgent delivery",
  },
  {
    id: 2,
    date: "15/12/2025",
    customer: "ABC Industries",
    boxType: "Mono Carton",
    size: "Large",
    qtyToDispatch: 2000,
    qtyDispatched: 2000,
    invoiceNo: "SP-INV-002",
    dispatchStatus: "Dispatched",
    comments: "Completed",
  },
  {
    id: 3,
    date: "17/12/2025",
    customer: "SDF Industries",
    boxType: "sdfs Carton",
    size: "500gs",
    qtyToDispatch: 1600,
    qtyDispatched: 1400,
    invoiceNo: "SP-INV-335",
    dispatchStatus: "Pending",
    comments: "Not Completed",
  },
];

const ChevronDownIcon = ({ className = "" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const ChevronUpIcon = ({ className = "" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 15.75 7.5-7.5 7.5 7.5"
    />
  </svg>
);

const ScreenPrintingDispatch = () => {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedBoxType, setSelectedBoxType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [expandedBoxTypes, setExpandedBoxTypes] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});

  // Initialize data
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SP_DISPATCH);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }
    setEntries(dummyDispatchEntries);
    localStorage.setItem(
      STORAGE_KEY_SP_DISPATCH,
      JSON.stringify(dummyDispatchEntries)
    );
  }, []);

  // Default expand all box types and first size
  useEffect(() => {
    if (entries.length === 0) return;

    const newExpandedBox = {};
    const newExpandedSizes = {};
    const boxGroups = {};

    entries.forEach((e) => {
      const boxType = e.boxType || "Uncategorized";
      if (!boxGroups[boxType]) boxGroups[boxType] = new Set();
      boxGroups[boxType].add(e.size || "No Size");
    });

    Object.keys(boxGroups).forEach((boxType) => {
      newExpandedBox[boxType] = true;
      const sizes = Array.from(boxGroups[boxType]).sort();
      if (sizes.length > 0) {
        newExpandedSizes[`${boxType}-${sizes[0]}`] = true;
      }
    });

    setExpandedBoxTypes(newExpandedBox);
    setExpandedSizes(newExpandedSizes);
  }, [entries]);

  // Persist entries
  useEffect(() => {
    if (entries.length === 0) return;
    localStorage.setItem(STORAGE_KEY_SP_DISPATCH, JSON.stringify(entries));
  }, [entries]);

  const openDetails = (entry) => {
    navigate("/screen-printing/dispatch-details", { state: { entry } });
  };

  // Unique filters
  const uniqueBoxTypes = useMemo(() => {
    const set = new Set();
    entries.forEach((e) => set.add(e.boxType || "Uncategorized"));
    return Array.from(set).sort();
  }, [entries]);

  const uniqueSizes = useMemo(() => {
    const set = new Set();
    entries.forEach((e) => {
      if (!selectedBoxType || e.boxType === selectedBoxType) {
        set.add(e.size || "No Size");
      }
    });
    return Array.from(set).sort();
  }, [entries, selectedBoxType]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    const term = searchCustomer.trim().toLowerCase();
    return entries.filter((e) => {
      const matchesCustomer =
        !term || (e.customer || "").toLowerCase().includes(term);
      const matchesBoxType =
        !selectedBoxType || e.boxType === selectedBoxType;
      const matchesStatus =
        !selectedStatus || e.dispatchStatus === selectedStatus;
      return matchesCustomer && matchesBoxType && matchesStatus;
    });
  }, [entries, searchCustomer, selectedBoxType, selectedStatus]);

  // Group by boxType -> size
  const groupedEntries = useMemo(() => {
    const grouped = {};
    filteredEntries.forEach((e) => {
      const boxType = e.boxType || "Uncategorized";
      const size = e.size || "No Size";
      if (!grouped[boxType]) grouped[boxType] = {};
      if (!grouped[boxType][size]) grouped[boxType][size] = [];
      grouped[boxType][size].push(e);
    });
    return grouped;
  }, [filteredEntries]);

  const hasEntries = Object.keys(groupedEntries).length > 0;

  // Auto-expand on filter
  useEffect(() => {
    const hasFilter =
      searchCustomer.trim() || selectedBoxType || selectedStatus;
    if (!hasFilter) return;

    const newExpandedBox = {};
    const newExpandedSizes = {};

    Object.entries(groupedEntries).forEach(([boxType, sizeMap]) => {
      newExpandedBox[boxType] = true;
      Object.keys(sizeMap).forEach((size) => {
        const key = `${boxType}-${size}`;
        newExpandedSizes[key] = true;
      });
    });

    setExpandedBoxTypes(newExpandedBox);
    setExpandedSizes(newExpandedSizes);
  }, [searchCustomer, selectedBoxType, selectedStatus, groupedEntries]);

  const toggleBoxType = (boxType) => {
    setExpandedBoxTypes((prev) => ({
      ...prev,
      [boxType]: !prev[boxType],
    }));
  };

  const toggleSize = (boxType, size) => {
    const key = `${boxType}-${size}`;
    setExpandedSizes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const clearFilters = () => {
    setSearchCustomer("");
    setSelectedBoxType("");
    setSelectedStatus("");
  };

  const stats = useMemo(() => {
    const total = entries.length;
    const pending = entries.filter((e) => e.dispatchStatus === "Pending").length;
    const dispatched = entries.filter(
      (e) => e.dispatchStatus === "Dispatched"
    ).length;
    return { total, pending, dispatched };
  }, [entries]);

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] font-bold text-gray-800 m-0">
          Screen Printing Dispatch
        </h1>
      </div>


      {/* Filters */}
      <div className="flex gap-[1vw] mb-[1vw] flex-wrap bg-white px-[1vw] py-[1vw] rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 min-w-[15vw]">
          <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
            Search by Customer
          </label>
          <input
            type="text"
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            placeholder="Enter customer name..."
            className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex-1 min-w-[12vw]">
          <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
            Box Type
          </label>
          <select
            value={selectedBoxType}
            onChange={(e) => setSelectedBoxType(e.target.value)}
            className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none bg-white"
          >
            <option value="">All</option>
            {uniqueBoxTypes.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[12vw]">
          <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
            Dispatch Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none bg-white"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
          </select>
        </div>

        <div className="flex-none self-end">
          <button
            onClick={clearFilters}
            className="px-[1vw] py-[0.5vw] text-[0.8vw] bg-red-500 text-white rounded-md font-medium hover:bg-red-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Grouped Entries */}
      {!hasEntries ? (
        <div className="bg-white p-[2.5vw] rounded-lg shadow-sm text-center">
          <p className="text-[0.9vw] text-gray-500 m-0">
            No dispatch entries found.
          </p>
        </div>
      ) : (
        <div className="max-h-[65vh] overflow-y-auto">
          {Object.keys(groupedEntries)
            .sort()
            .map((boxType) => {
              const sizeMap = groupedEntries[boxType];
              const isBoxExpanded = expandedBoxTypes[boxType];

              return (
                <div
                  key={boxType}
                  className="mb-[1.2vw] rounded-lg overflow-hidden bg-white shadow-sm border border-gray-300"
                >
                  {/* Box type header */}
                  <div
                    onClick={() => toggleBoxType(boxType)}
                    className="px-[1vw] py-[0.6vw] bg-[#059669] text-white text-[1.1vw] font-semibold cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex items-center gap-[0.5vw]">
                      <div className="w-[2vw] h-[2vw] flex items-center justify-center">
                        <svg
                          className="w-[1.2vw] h-[1.2vw] text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="1" y="3" width="15" height="13" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        </svg>
                      </div>
                      <span>{boxType}</span>
                      <span className="bg-white/20 px-[0.7vw] py-[0.15vw] rounded text-[0.8vw] font-medium">
                        {Object.keys(sizeMap).length} Size
                        {Object.keys(sizeMap).length > 1 ? "s" : ""}
                      </span>
                    </div>
                    {isBoxExpanded ? (
                      <ChevronUpIcon className="w-[1.2vw] h-[1.2vw]" />
                    ) : (
                      <ChevronDownIcon className="w-[1.2vw] h-[1.2vw]" />
                    )}
                  </div>

                  {isBoxExpanded && (
                    <div className="p-[0.6vw]">
                      {Object.keys(sizeMap)
                        .sort()
                        .map((size) => {
                          const list = sizeMap[size];
                          const key = `${boxType}-${size}`;
                          const isSizeExpanded = expandedSizes[key];

                          return (
                            <div
                              key={key}
                              className="mb-[0.7vw] mx-[0.6vw] border border-gray-200 rounded-lg bg-gray-50 overflow-hidden"
                            >
                              {/* Size header */}
                              <div
                                onClick={() => toggleSize(boxType, size)}
                                className="px-[0.9vw] py-[0.55vw] bg-gray-200 text-gray-900 text-[0.95vw] font-medium cursor-pointer flex justify-between items-center border border-gray-300 hover:bg-gray-300"
                              >
                                <div className="flex items-center gap-[0.6vw]">
                                  <div className="w-[1.8vw] h-[1.8vw] bg-[#333333] rounded-[0.45vw] flex items-center justify-center">
                                    <svg
                                      className="w-[1vw] h-[1vw] text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                  <span>{size}</span>
                                  <span className="bg-white text-gray-900 px-[0.7vw] py-[0.1vw] rounded text-[0.8vw] font-medium">
                                    {list.length} Record
                                    {list.length > 1 ? "s" : ""}
                                  </span>
                                </div>
                                {isSizeExpanded ? (
                                  <ChevronUpIcon className="w-[1.1vw] h-[1.1vw] text-gray-600" />
                                ) : (
                                  <ChevronDownIcon className="w-[1.1vw] h-[1.1vw] text-gray-600" />
                                )}
                              </div>

                              {/* Table */}
                              {isSizeExpanded && (
                                <div>
                                  <table className="w-full border-collapse text-[0.85vw]">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Date
                                        </th>
                                        <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Customer
                                        </th>
                                        <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Qty (To Dispatch / Done)
                                        </th>
                                        <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Invoice No
                                        </th>
                                        <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Status
                                        </th>
                                        <th className="px-[0.9vw] py-[0.6vw] text-center border-b border-gray-200 text-gray-700 font-semibold">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {list.map((entry) => (
                                        <tr
                                          key={entry.id}
                                          className="bg-white hover:bg-gray-50"
                                        >
                                          <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 text-gray-900">
                                            {entry.date}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 text-gray-900 font-medium">
                                            {entry.customer}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 text-gray-900">
                                            {entry.qtyToDispatch} /{" "}
                                            {entry.qtyDispatched}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 text-gray-900">
                                            {entry.invoiceNo || "-"}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                                            <span
                                              className={`px-[0.6vw] py-[0.25vw] rounded-full text-[0.75vw] font-medium ${
                                                entry.dispatchStatus ===
                                                "Dispatched"
                                                  ? "bg-green-100 text-green-700"
                                                  : "bg-orange-100 text-orange-700"
                                              }`}
                                            >
                                              {entry.dispatchStatus}
                                            </span>
                                          </td>
                                          <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 text-center">
                                            <button
                                              onClick={() =>
                                                openDetails(entry)
                                              }
                                              className="px-[1.2vw] py-[0.45vw] text-[0.8vw] border border-green-600 text-green-600 rounded-full font-semibold hover:bg-green-600 hover:text-white"
                                            >
                                              Dispatch / Edit
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default ScreenPrintingDispatch;
