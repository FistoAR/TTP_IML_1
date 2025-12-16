// ScreenPrintingJobWork.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const dummyJobWorks = [
  {
    id: 1,
    customer: "Terra Tech Packs",
    boxType: "Sweet Box",
    size: "250gms",
    printerName: "Printer A",
    qtySent: 3000,
    qtyReceived: 1500,
    status: "In Printing", // Pending / In Printing / Completed
  },
];

const ScreenPrintingJobWork = () => {
  const navigate = useNavigate();
  const [jobs] = useState(dummyJobWorks);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const filtered = useMemo(() => {
    const term = searchCustomer.trim().toLowerCase();
    return jobs.filter((j) => {
      const mc =
        !term || j.customer.toLowerCase().includes(term);
      const ms = !selectedStatus || j.status === selectedStatus;
      return mc && ms;
    });
  }, [jobs, searchCustomer, selectedStatus]);

  const openDetails = (job) => {
    navigate("/screen-printing/jobwork-details", { state: { job } });
  };

  return (
    <div className="p-[1vw] bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.7vw] font-bold text-gray-800 m-0">
          Screen Printing Job Work
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
            className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600"
          />
        </div>
        <div className="flex-1 min-w-[12vw]">
          <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
            Job Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none bg-white"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Printing">In Printing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse text-[0.85vw]">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Customer
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Box Type / Size
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Printer
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Qty Sent / Received
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Status
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-center border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-[0.9vw] py-[0.7vw] text-center text-gray-500"
                >
                  No job work records.
                </td>
              </tr>
            ) : (
              filtered.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 font-medium text-gray-800">
                    {j.customer}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {j.boxType} / {j.size}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {j.printerName}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {j.qtySent} / {j.qtyReceived}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {j.status}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 text-center">
                    <button
                      onClick={() => openDetails(j)}
                      className="px-[1.2vw] py-[0.4vw] text-[0.8vw] border border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white"
                    >
                      View / Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScreenPrintingJobWork;
