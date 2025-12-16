// ScreenPrintingOrders.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const dummyScreenOrders = [
  {
    id: 1,
    date: "16/12/2025",
    customer: "Terra Tech Packs",
    boxType: "Sweet Box",
    size: "250gms",
    colors: "2 Color",
    designStatus: "Approved",
    qtyOrdered: 5000,
    qtyPrinted: 2500,
    overallStatus: "In Printing", // or Completed / Pending
  },
  {
    id: 2,
    date: "16/12/2025",
    customer: "ABC Industries",
    boxType: "Plain Mono Carton",
    size: "Large",
    colors: "Single Color",
    designStatus: "Pending",
    qtyOrdered: 3000,
    qtyPrinted: 0,
    overallStatus: "Pending",
  },
];

const ScreenPrintingOrders = () => {
  const navigate = useNavigate();
  const [orders] = useState(dummyScreenOrders);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDesignStatus, setSelectedDesignStatus] = useState("");

  const filteredOrders = useMemo(() => {
    const term = searchCustomer.trim().toLowerCase();

    return orders.filter((o) => {
      const matchCustomer =
        !term || o.customer.toLowerCase().includes(term);
      const matchStatus =
        !selectedStatus || o.overallStatus === selectedStatus;
      const matchDesign =
        !selectedDesignStatus || o.designStatus === selectedDesignStatus;

      return matchCustomer && matchStatus && matchDesign;
    });
  }, [orders, searchCustomer, selectedStatus, selectedDesignStatus]);

  const openDetails = (order) => {
    navigate("/screen-printing/order-details", { state: { order } });
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.7vw] font-bold text-gray-800 m-0">
          Screen Printing Orders
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
            Order Status
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

        <div className="flex-1 min-w-[12vw]">
          <label className="block mb-[0.4vw] text-[0.85vw] font-medium text-gray-700">
            Design Status
          </label>
          <select
            value={selectedDesignStatus}
            onChange={(e) => setSelectedDesignStatus(e.target.value)}
            className="w-full px-[0.7vw] py-[0.5vw] text-[0.85vw] border border-gray-300 rounded-md outline-none bg-white"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse text-[0.85vw]">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Date
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Customer
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Box Type / Size
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Colors
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Design Status
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Qty Ordered / Printed
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-left border-b border-gray-200">
                Overall Status
              </th>
              <th className="px-[0.9vw] py-[0.6vw] text-center border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-[0.9vw] py-[0.7vw] text-center text-gray-500"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {o.date}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 font-medium text-gray-800">
                    {o.customer}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {o.boxType} / {o.size}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {o.colors}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {o.designStatus}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {o.qtyOrdered} / {o.qtyPrinted}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100">
                    {o.overallStatus}
                  </td>
                  <td className="px-[0.9vw] py-[0.7vw] border-b border-gray-100 text-center">
                    <button
                      onClick={() => openDetails(o)}
                      className="px-[1.2vw] py-[0.4vw] text-[0.8vw] border border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      View / Edit
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

export default ScreenPrintingOrders;
