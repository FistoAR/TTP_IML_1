// ScreenPrintingDashboard.jsx
import React, { useMemo } from "react";

const ScreenPrintingDashboard = ({
  orders = [],
  jobWorks = [],
  dispatches = [],
}) => {
  // Basic aggregates – replace with real data wiring later
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const inPrinting = jobWorks.filter((j) => j.status === "In Printing").length;
    const pendingDispatch = dispatches.filter(
      (d) => d.dispatchStatus === "Pending"
    ).length;
    const completed = orders.filter((o) => o.overallStatus === "Completed").length;

    return { totalOrders, inPrinting, pendingDispatch, completed };
  }, [orders, jobWorks, dispatches]);

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.7vw] font-bold text-gray-800 m-0">
          Screen Printing Dashboard
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-[1vw] mb-[1.25vw]">
        <div className="bg-white px-[0.9vw] py-[0.65vw] rounded-lg shadow-sm border border-gray-200">
          <p className="text-[0.85vw] text-gray-600 mb-[0.2vw]">
            Total Screen Print Orders
          </p>
          <p className="text-[1.8vw] font-bold text-gray-900">
            {stats.totalOrders}
          </p>
        </div>
        <div className="bg-white px-[0.9vw] py-[0.65vw] rounded-lg shadow-sm border border-gray-200">
          <p className="text-[0.85vw] text-gray-600 mb-[0.2vw]">
            In Printing (Job Work)
          </p>
          <p className="text-[1.8vw] font-bold text-blue-600">
            {stats.inPrinting}
          </p>
        </div>
        <div className="bg-white px-[0.9vw] py-[0.65vw] rounded-lg shadow-sm border border-gray-200">
          <p className="text-[0.85vw] text-gray-600 mb-[0.2vw]">
            Pending for Dispatch
          </p>
          <p className="text-[1.8vw] font-bold text-orange-600">
            {stats.pendingDispatch}
          </p>
        </div>
        <div className="bg-white px-[0.9vw] py-[0.65vw] rounded-lg shadow-sm border border-gray-200">
          <p className="text-[0.85vw] text-gray-600 mb-[0.2vw]">
            Completed Orders
          </p>
          <p className="text-[1.8vw] font-bold text-green-600">
            {stats.completed}
          </p>
        </div>
      </div>

      {/* You can later add compact tables: recent orders, recent job works, recent dispatches */}
    </div>
  );
};

export default ScreenPrintingDashboard;
