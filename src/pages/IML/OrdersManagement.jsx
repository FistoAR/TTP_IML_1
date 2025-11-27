import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewOrder from "./NewOrder";

// Mock data storage (In production, this would be an API/Database)
const STORAGE_KEY = "iml_orders";

export default function OrdersManagement() {
  const [view, setView] = useState("dashboard"); // 'dashboard' or 'form'
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  // Load orders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setOrders(JSON.parse(stored));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  // Handle create new order
  const handleNewOrder = () => {
    setEditingOrder(null);
    setView("form");
  };

  // Handle edit order
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setView("form");
  };

  // Handle delete order
  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter((order) => order.id !== orderId));
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(orders.filter((order) => order.id !== orderId))
      );
    }
  };

  // Handle form submission from NewOrder component
  const handleOrderSubmit = (orderData) => {
    if (editingOrder) {
      // Update existing order
      const updatedOrders = orders.map((order) =>
        order.id === editingOrder.id
          ? { ...orderData, id: editingOrder.id }
          : order
      );
      setOrders(updatedOrders);
    } else {
      // Add new order
      const newOrder = {
        ...orderData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setOrders([...orders, newOrder]);
    }
    setView("dashboard");
    setEditingOrder(null);
  };

  // Handle cancel from form
  const handleCancel = () => {
    setView("dashboard");
    setEditingOrder(null);
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact.contactName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.contact.imlName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    inProgress: orders.filter((o) => o.status === "in-progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  if (view === "form") {
    return (
      <NewOrder
        existingOrder={editingOrder}
        onSubmit={handleOrderSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="p-0">
      <div className="max-w-[95vw] mx-auto rounded-[1.5vw] overflow-hidden">
        {/* Header Section */}
        <div className="bg-white shadow-sm p-[1.5vw] ">
          <div className="flex items-center justify-between mb-[1.25vw]">
            <div>
              <h1 className="text-[1.5vw] font-bold text-black mb-[0.3vw]">
                IML Orders Management
              </h1>
              <p className="text-[0.85vw] text-gray-500">
                Manage all your orders, designs, and client information
              </p>
            </div>
            <button
              onClick={handleNewOrder}
              className="flex items-center gap-[0.5vw] px-[1.5vw] py-[0.75vw] bg-blue-600 text-white rounded-[0.5vw] text-[0.9vw] font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-700 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-[1.2vw] h-[1.2vw]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Order
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-[1.5vw]">
            <StatCard
              title="Total Orders"
              value={stats.total}
              color="blue"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              color="orange"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              color="yellow"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              color="green"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow-sm p-[.5vw_1.25vw]">
          <div className="flex items-center gap-[1.5vw]">
            {/* Search */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-[0.75vw] top-1/2 -translate-y-1/2 w-[1.1vw] h-[1.1vw] text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by company, contact name, or IML name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-[2.5vw] pr-[1vw] py-[0.65vw] border border-gray-300 rounded-[0.5vw] text-[0.9vw] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-[0.5vw]">
              <label className="text-[0.9vw] font-medium text-black">
                Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-[1vw] py-[0.65vw] border border-gray-300 rounded-[0.5vw] text-[0.9vw] outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-[0.85vw] text-gray-600 font-medium whitespace-nowrap">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[1vw] text-center h-[50vh] overflow-auto">
              <svg
                className="w-[6vw] h-[6vw] text-gray-300 mb-[1vw]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-[1.2vw] font-semibold text-black mb-[0.5vw]">
                No orders found
              </h3>
              <p className="text-[0.9vw] text-gray-800 mb-[1.5vw]">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first order"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button
                  onClick={handleNewOrder}
                  className="px-[1.5vw] py-[0.75vw] bg-blue-600 text-white rounded-[0.5vw] text-[0.9vw] font-semibold cursor-pointer hover:bg-blue-700 transition-all"
                >
                  Create New Order
                </button>
              )}
            </div>
          ) : (
            <div className="pt-[1vw] px-[1.25vw] pb-[1vw] overflow-hidden">
              {/* Table Container with consistent scrollbar space */}
              <div className="border-2 border-gray-300 rounded-[0.5vw] overflow-hidden">
                {/* Fixed Table Header */}
                <div className="overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 pr-[.95%]">
                  <table className="w-full table-fixed border-collapse">
                    <thead>
                      <tr>
                        <th
                          className="text-left px-[1vw] py-[1vw] text-[0.85vw] border-r border-gray-300 font-semibold text-black"
                          style={{ width: "15%" }}
                        >
                          Company
                        </th>
                        <th
                          className="text-left px-[1vw] py-[1vw] text-[0.85vw] border-r border-gray-300 font-semibold text-black"
                          style={{ width: "15%" }}
                        >
                          Contact
                        </th>
                        <th
                          className="text-left px-[1vw] py-[1vw] text-[0.85vw] border-r border-gray-300 font-semibold text-black"
                          style={{ width: "12%" }}
                        >
                          IML Name
                        </th>
                        <th
                          className="text-center px-[1vw] py-[1vw] text-[0.85vw] border-r border-gray-300 font-semibold text-black"
                          style={{ width: "10%" }}
                        >
                          Products
                        </th>
                        <th
                          className="text-center px-[1vw] py-[1vw] text-[0.85vw] border-r border-gray-300 font-semibold text-black"
                          style={{ width: "10%" }}
                        >
                          Status
                        </th>
                        <th
                          className="text-right px-[1vw] py-[1vw] text-[0.85vw] border-r border-gray-300 font-semibold text-black"
                          style={{ width: "11%" }}
                        >
                          Total Budget
                        </th>
                        <th
                          className="text-center px-[1vw] py-[1vw] text-[0.85vw] border-r border-gray-300 font-semibold text-black"
                          style={{ width: "10%" }}
                        >
                          Created
                        </th>
                        <th
                          className="text-center px-[1vw] py-[1vw] text-[0.85vw] font-semibold text-black"
                          style={{ width: "17%" }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Table Body */}
                <div className="overflow-y-auto overflow-x-hidden max-h-[40vh] border-t border-gray-300">
                  <table className="w-full table-fixed border-collapse">
                    <tbody>
                      {filteredOrders.map((order, index) => (
                        <OrderRow
                          key={order.id}
                          order={order}
                          index={index}
                          onEdit={() => handleEditOrder(order)}
                          onDelete={() => handleDeleteOrder(order.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, color, icon }) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700",
    green: "from-green-50 to-green-100 border-green-200 text-green-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border-2 rounded-[0.6vw] p-[.9vw] transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-[0.25vw]">
        <p className="text-[0.8vw] font-medium opacity-80">{title}</p>
        <div className="w-[1.5vw] h-[1.5vw] opacity-60">{icon}</div>
      </div>
      <p className="text-[1.5vw] font-bold">{value}</p>
    </div>
  );
}

// Order Row Component
function OrderRow({ order, index, onEdit, onDelete }) {
  const statusColors = {
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
  };

  const totalBudget = order.products?.reduce(
    (sum, product) => sum + (parseFloat(product.budget) || 0),
    0
  );

  return (
    <tr
      className={`border-b border-gray-300 last:border-b-0 hover:bg-blue-50 transition-colors ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      }`}
    >
      <td className="px-[1vw] py-[1vw] border-r border-gray-300" style={{ width: "15%" }}>
        <p className="text-[0.85vw] font-semibold text-black truncate">
          {order.contact.company}
        </p>
      </td>
      <td className="px-[1vw] py-[1vw] border-r border-gray-300" style={{ width: "15%" }}>
        <p className="text-[0.85vw] text-black truncate">
          {order.contact.contactName}
        </p>
        <p className="text-[0.75vw] text-gray-800 truncate">( {order.contact.phone} )</p>
      </td>
      <td className="px-[1vw] py-[1vw] border-r border-gray-300" style={{ width: "12%" }}>
        <p className="text-[0.85vw] text-black truncate">{order.contact.imlName}</p>
      </td>
      <td className="text-center px-[1vw] py-[1vw] border-r border-gray-300" style={{ width: "10%" }}>
        <span className="inline-block bg-gray-200 text-black px-[0.75vw] py-[0.3vw] rounded-full text-[0.8vw] font-medium">
          {order.products?.length || 0}
        </span>
      </td>
      <td className="text-center px-[1vw] py-[1vw] border-r border-gray-300" style={{ width: "10%" }}>
        <span
          className={`inline-block border px-[0.75vw] py-[0.3vw] rounded-[0.4vw] text-[0.75vw] font-semibold ${
            statusColors[order.status || "pending"]
          }`}
        >
          {(order.status || "pending").replace("-", " ").toUpperCase()}
        </span>
      </td>
      <td className="text-right px-[1vw] py-[1vw] border-r border-gray-300" style={{ width: "11%" }}>
        <p className="text-[0.9vw] font-bold text-black">
          ₹{totalBudget?.toFixed(2) || "0.00"}
        </p>
      </td>
      <td className="text-center px-[1vw] py-[1vw] border-r border-gray-300" style={{ width: "10%" }}>
        <p className="text-[0.8vw] text-gray-600">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </td>
      <td className="text-center px-[1vw] py-[1vw]" style={{ width: "17%" }}>
        <div className="flex items-center justify-center gap-[0.5vw]">
          <button
            onClick={onEdit}
            className="px-[0.75vw] py-[0.4vw] bg-blue-600 text-white rounded-[0.4vw] text-[0.75vw] font-medium cursor-pointer hover:bg-blue-700 transition-all flex items-center gap-[0.3vw]"
            title="View/Edit"
          >
            <svg
              className="w-[0.9vw] h-[0.9vw]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </button>
          <button
            onClick={onDelete}
            className="px-[0.75vw] py-[0.4vw] bg-red-500 text-white rounded-[0.4vw] text-[0.75vw] font-medium cursor-pointer hover:bg-red-600 transition-all"
            title="Delete"
          >
            <svg
              className="w-[0.9vw] h-[0.9vw]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

