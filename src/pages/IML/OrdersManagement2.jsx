import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewOrder from "./NewOrder";

const STORAGE_KEY = "iml_orders";

const PRODUCT_SIZE_OPTIONS = {
  Round: ["120ml", "250ml", "300ml", "500ml", "1000ml"],
  "Round Square": ["450ml", "500ml"],
  Rectangle: ["500ml", "650ml", "750ml"],
  "Sweet Box": ["250gms", "500gms"],
  "Sweet Box TE": ["TE 250gms", "TE 500gms"],
};

export default function OrdersManagement3() {
  const [view, setView] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Three-level collapsible states
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [expandedCycles, setExpandedCycles] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedOrders = JSON.parse(stored);
      setOrders(parsedOrders);
      if (parsedOrders.length === 0) {
        initializeDummyData();
      }
    } else {
      initializeDummyData();
    }
  }, []);

  const initializeDummyData = () => {
    const dummyOrders = [
      {
        id: "ORD-10134",
        contact: {
          company: "ABC Industries",
          contactName: "John Smith",
          phone: "9876543210",
          imlName: "Premium IML Labels",
          priority: "high",
        },
        orderDetails: {
          estimatedQuantity: 2600,
          estimatedValue: 25000,
          paymentStatus: "PAID",
          remarks: "Advance received",
        },
        products: [
          {
            productId: 1,
            productName: "Round",
            size: "300ml",
            imlType: "LID",
            colors: {
              lidColor: "red",
              tubColor: null,
            },
            orderedQty: 1000,
            cycles: [
              {
                cycleNo: 1,
                editable: false,
                quantities: {
                  planned: 600,
                  produced: 600,
                  stock: 0,
                },
                workflowStatus: {
                  production: "DONE",
                  inventory: "DONE",
                  billing: "DONE",
                  dispatch: "DONE",
                },
              },
              {
                cycleNo: 2,
                editable: true,
                quantities: {
                  planned: 400,
                  produced: 0,
                  stock: 0,
                },
                workflowStatus: {
                  production: "PENDING",
                  inventory: "PENDING",
                  billing: "PENDING",
                  dispatch: "PENDING",
                },
              },
            ],
          },
          {
            productId: 2,
            productName: "Round Square",
            size: "500ml",
            imlType: "TUB",
            colors: {
              lidColor: null,
              tubColor: "blue",
            },
            orderedQty: 1500,
            cycles: [
              {
                cycleNo: 1,
                editable: false,
                quantities: {
                  planned: 1200,
                  produced: 1200,
                  stock: 0,
                },
                workflowStatus: {
                  production: "DONE",
                  inventory: "DONE",
                  billing: "DONE",
                  dispatch: "DONE",
                },
              },
              {
                cycleNo: 2,
                editable: true,
                quantities: {
                  planned: 300,
                  produced: 0,
                  stock: 0,
                },
                workflowStatus: {
                  production: "PENDING",
                  inventory: "PENDING",
                  billing: "PENDING",
                  dispatch: "PENDING",
                },
              },
            ],
          },
        ],
        payment: [
          {
            totalEstimated: "25000",
            remarks: "Advance received",
          },
          {
            paymentRecords: [
              {
                timestamp: "2025-12-10T10:30:00.000Z",
                paymentType: "advance",
                method: "Cash",
                amount: 10000,
                remarks: "Advance payment",
                createdAt: "2025-12-10T10:30:00.000Z",
              },
              {
                timestamp: "2025-12-12T09:00:00.000Z",
                paymentType: "full",
                method: "UPI",
                amount: 15000,
                remarks: "Final payment",
                createdAt: "2025-12-12T09:00:00.000Z",
              },
            ],
            status: "ACTIVE",
          },
        ],
      },
      {
        id: "ORD-10135",
        contact: {
          company: "XYZ Corporation",
          contactName: "Jane Doe",
          phone: "9123456780",
          imlName: "Quality IML Solutions",
          priority: "medium",
        },
        orderDetails: {
          estimatedQuantity: 1500,
          estimatedValue: 35000,
          paymentStatus: "UNPAID",
          remarks: "",
        },
        products: [
          {
            productId: 3,
            productName: "Sweet Box",
            size: "250g",
            imlType: "TUB",
            colors: {
              lidColor: null,
              tubColor: "yellow",
            },
            orderedQty: 1500,
            cycles: [
              {
                cycleNo: 1,
                editable: false,
                quantities: {
                  planned: 1000,
                  produced: 1000,
                  stock: 0,
                },
                workflowStatus: {
                  production: "DONE",
                  inventory: "DONE",
                  billing: "DONE",
                  dispatch: "DONE",
                },
              },
              {
                cycleNo: 2,
                editable: true,
                quantities: {
                  planned: 500,
                  produced: 200,
                  stock: 300,
                },
                workflowStatus: {
                  production: "IN_PROGRESS",
                  inventory: "PENDING",
                  billing: "PENDING",
                  dispatch: "PENDING",
                },
              },
            ],
          },
        ],
        payment: [
          {
            totalEstimated: "35000",
            remarks: "",
          },
          {
            paymentRecords: [],
            status: "ACTIVE",
          },
        ],
      },
      {
        id: "ORD-10136",
        contact: {
          company: "ABC Industries",
          contactName: "John Smith",
          phone: "9876543210",
          imlName: "Economy IML Series",
          priority: "low",
        },
        orderDetails: {
          estimatedQuantity: 800,
          estimatedValue: 18000,
          paymentStatus: "PAID",
          remarks: "Full payment received",
        },
        products: [
          {
            productId: 4,
            productName: "Rectangle",
            size: "750ml",
            imlType: "LID",
            colors: {
              lidColor: "green",
              tubColor: null,
            },
            orderedQty: 800,
            cycles: [
              {
                cycleNo: 1,
                editable: false,
                quantities: {
                  planned: 800,
                  produced: 800,
                  stock: 0,
                },
                workflowStatus: {
                  production: "DONE",
                  inventory: "DONE",
                  billing: "DONE",
                  dispatch: "DONE",
                },
              },
            ],
          },
        ],
        payment: [
          {
            totalEstimated: "18000",
            remarks: "Full payment received",
          },
          {
            paymentRecords: [
              {
                timestamp: "2025-12-12T11:15:00.000Z",
                paymentType: "full",
                method: "Bank Transfer",
                amount: 18000,
                remarks: "Complete payment",
                createdAt: "2025-12-12T11:15:00.000Z",
              },
            ],
            status: "COMPLETED",
          },
        ],
      },
    ];

    setOrders(dummyOrders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyOrders));
  };

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (orders.length > 0) {
      const groupedByCompany = groupOrdersByCompany();
      const firstCompany = Object.keys(groupedByCompany)[0];
      if (firstCompany) {
        setExpandedCompanies({ [firstCompany]: true });
      }
    }
  }, [orders.length]);

  const groupOrdersByCompany = () => {
    const grouped = {};
    orders.forEach((order) => {
      const companyName = order.contact.company || "Unknown Company";
      if (!grouped[companyName]) {
        grouped[companyName] = [];
      }
      grouped[companyName].push(order);
    });
    return grouped;
  };

  const toggleCompany = (companyName) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleCycle = (cycleKey) => {
    setExpandedCycles((prev) => ({
      ...prev,
      [cycleKey]: !prev[cycleKey],
    }));
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    setView("form");
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setView("form");
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter((order) => order.id !== orderId));
    }
  };

  const handleOrderSubmit = (orderData) => {
    if (editingOrder) {
      const updatedOrders = orders.map((order) =>
        order.id === editingOrder.id
          ? { ...orderData, id: editingOrder.id, createdAt: order.createdAt }
          : order
      );
      setOrders(updatedOrders);
    } else {
      const newOrder = {
        ...orderData,
        id: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setOrders([...orders, newOrder]);
    }
    setView("dashboard");
    setEditingOrder(null);
  };

  const handleCancel = () => {
    setView("dashboard");
    setEditingOrder(null);
  };

  const filterOrders = (ordersList) => {
    return ordersList.filter((order) => {
      const matchesSearch =
        order.contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contact.imlName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());

      const artworkStatus = getArtworkStatusForOrder(order);
      const matchesStatus = filterStatus === "all" || artworkStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  const getArtworkStatusForOrder = (order) => {
    if (!order.products || order.products.length === 0) return "pending";
    const statuses = order.products.map((p) =>
      (p.designStatus || "pending").toLowerCase()
    );
    if (statuses.includes("in-progress")) return "in-progress";
    if (statuses.includes("approved")) return "approved";
    return "pending";
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    artworkPending: orders.filter(
      (order) => getArtworkStatusForOrder(order) === "pending"
    ).length,
    artworkInProgress: orders.filter(
      (order) => getArtworkStatusForOrder(order) === "in-progress"
    ).length,
    artworkApproved: orders.filter(
      (order) => getArtworkStatusForOrder(order) === "approved"
    ).length,
  };

  if (view === "form") {
    return (
      <NewOrder
        onSubmit={handleOrderSubmit}
        onCancel={handleCancel}
        editingOrder={editingOrder}
      />
    );
  }

  const groupedByCompany = groupOrdersByCompany();
  const filteredGroupedOrders = {};

  Object.entries(groupedByCompany).forEach(([companyName, ordersList]) => {
    const filtered = filterOrders(ordersList);
    if (filtered.length > 0) {
      filteredGroupedOrders[companyName] = filtered;
    }
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #eff6ff, #eef2ff, #faf5ff)",
      padding: "1.5vw"
    }}>
      <div style={{ maxWidth: "90vw", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: "white",
          borderRadius: "1vw",
          boxShadow: "0 0.5vw 2vw rgba(0,0,0,0.1)",
          padding: "1.5vw",
          marginBottom: "1.5vw"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            
          }}>
            <div>
              <h1 style={{
                fontSize: "2vw",
                fontWeight: "bold",
                background: "linear-gradient(to right, #2563eb, #9333ea)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.3vw"
              }}>
                Orders Management
              </h1>
              <p style={{ color: "#6b7280", fontSize: "0.9vw" }}>
                Manage your orders, products, and cycles
              </p>
            </div>
            <button
              onClick={handleNewOrder}
              style={{
                background: "linear-gradient(to right, #2563eb, #9333ea)",
                color: "white",
                padding: "0.8vw 1.5vw",
                borderRadius: "0.6vw",
                fontWeight: "500",
                fontSize: "0.9vw",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5vw",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0.5vw 1.5vw rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: "1.2vw" }}>+</span>
              New Order
            </button>
          </div>

         
        </div>

        {/* Filters */}
        <div style={{
          background: "white",
          borderRadius: "1vw",
          boxShadow: "0 0.5vw 2vw rgba(0,0,0,0.1)",
          padding: "1.5vw",
          marginBottom: "1.5vw"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1vw"
          }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "0.85vw",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5vw"
              }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by company, contact, IML name, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7vw 1vw",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5vw",
                  fontSize: "0.85vw",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                fontSize: "0.85vw",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5vw"
              }}>
                Artwork Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7vw 1vw",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5vw",
                  fontSize: "0.85vw",
                  outline: "none"
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List - Three Level Collapsible */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1vw", maxHeight: "50vh" }}>
          {Object.keys(filteredGroupedOrders).length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "1vw",
              boxShadow: "0 0.5vw 2vw rgba(0,0,0,0.1)",
              padding: "3vw",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "4vw", marginBottom: "1vw" }}>📦</div>
              <h3 style={{
                fontSize: "1.3vw",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5vw"
              }}>
                No orders found
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.9vw" }}>
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first order"}
              </p>
            </div>
          ) : (
            Object.entries(filteredGroupedOrders).map(([companyName, ordersList]) => (
              <div key={companyName} style={{
                background: "white",
                borderRadius: "1vw",
                boxShadow: "0 0.5vw 2vw rgba(0,0,0,0.1)",
                overflow: "hidden"
              }}>
                {/* Level 1: Company Name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.2vw",
                    cursor: "pointer",
                    background: "linear-gradient(to right, #4f46e5, #7c3aed)",
                    color: "white",
                    transition: "all 0.3s"
                  }}
                  onClick={() => toggleCompany(companyName)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "linear-gradient(to right, #4338ca, #6d28d9)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "linear-gradient(to right, #4f46e5, #7c3aed)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                    <span style={{ fontSize: "1.5vw" }}>
                      {expandedCompanies[companyName] ? "▼" : "▶"}
                    </span>
                    <div>
                      <h3 style={{ fontSize: "1.3vw", fontWeight: "bold", marginBottom: "0.2vw" }}>
                        {companyName}
                      </h3>
                      <p style={{ fontSize: "0.75vw", opacity: 0.9 }}>
                        {ordersList.length} Order{ordersList.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
                    <span style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "0.4vw 0.8vw",
                      borderRadius: "1vw",
                      fontSize: "0.75vw"
                    }}>
                      Total Orders: {ordersList.length}
                    </span>
                  </div>
                </div>

                {/* Level 2: Orders (Order ID / IML) */}
                {expandedCompanies[companyName] && (
                  <div style={{ background: "#f9fafb" }}>
                    {ordersList.map((order, orderIndex) => (
                      <div key={order.id} style={{
                        borderBottom: orderIndex < ordersList.length - 1 ? "1px solid #e5e7eb" : "none"
                      }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1vw",
                            cursor: "pointer",
                            transition: "background 0.2s"
                          }}
                          onClick={() => toggleOrder(order.id)}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#f3f4f6";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                            <span style={{ fontSize: "1.2vw", color: "#6b7280" }}>
                              {expandedOrders[order.id] ? "▼" : "▶"}
                            </span>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "0.3vw" }}>
                                <span style={{ fontWeight: "600", color: "#1f2937", fontSize: "0.95vw" }}>
                                  {order.id}
                                </span>
                                <span style={{ color: "#9ca3af", fontSize: "0.9vw" }}>|</span>
                                <span style={{ color: "#374151", fontSize: "0.9vw" }}>{order.contact.imlName}</span>
                              </div>
                              <div style={{ fontSize: "0.75vw", color: "#6b7280" }}>
                                Contact: {order.contact.contactName} • {order.contact.phone}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                            <span style={{
                              padding: "0.4vw 0.8vw",
                              borderRadius: "1vw",
                              fontSize: "0.7vw",
                              fontWeight: "500",
                              background: order.orderDetails.paymentStatus === "PAID" ? "#dcfce7" : "#fee2e2",
                              color: order.orderDetails.paymentStatus === "PAID" ? "#166534" : "#991b1b"
                            }}>
                              {order.orderDetails.paymentStatus}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOrder(order);
                              }}
                              style={{
                                padding: "0.5vw",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1vw",
                                borderRadius: "0.5vw",
                                transition: "background 0.2s"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "#dbeafe";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order.id);
                              }}
                              style={{
                                padding: "0.5vw",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1vw",
                                borderRadius: "0.5vw",
                                transition: "background 0.2s"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "#fee2e2";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Level 3: Cycles with Product Details */}
                        {expandedOrders[order.id] && (
                          <div style={{ background: "white", padding: "1vw" }}>
                            {order.products && order.products.length > 0 ? (
                              order.products.map((product) => (
                                <div key={product.productId} style={{ marginBottom: "1vw" }}>
                                  {product.cycles && product.cycles.map((cycle) => {
                                    const cycleKey = `${order.id}-${product.productId}-${cycle.cycleNo}`;
                                    return (
                                      <div
                                        key={cycleKey}
                                        style={{
                                          border: "1px solid #e5e7eb",
                                          borderRadius: "0.6vw",
                                          overflow: "hidden",
                                          marginBottom: "0.8vw"
                                        }}
                                      >
                                        {/* Cycle Header */}
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "0.8vw",
                                            background: "linear-gradient(to right, #f9fafb, #f3f4f6)",
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                          }}
                                          onClick={() => toggleCycle(cycleKey)}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(to right, #f3f4f6, #e5e7eb)";
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(to right, #f9fafb, #f3f4f6)";
                                          }}
                                        >
                                          <div style={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
                                            <span style={{ fontSize: "0.9vw", color: "#6b7280" }}>
                                              {expandedCycles[cycleKey] ? "▼" : "▶"}
                                            </span>
                                            <span style={{ fontWeight: "600", color: "#1f2937", fontSize: "0.9vw" }}>
                                              Cycle {cycle.cycleNo}
                                            </span>
                                          </div>
                                          <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", flexWrap: "wrap" }}>
                                            {Object.entries(cycle.workflowStatus).map(([key, status]) => (
                                              <span
                                                key={key}
                                                style={{
                                                  padding: "0.3vw 0.6vw",
                                                  borderRadius: "0.4vw",
                                                  fontSize: "0.65vw",
                                                  fontWeight: "500",
                                                  background:
                                                    status === "DONE"
                                                      ? "#dcfce7"
                                                      : status === "IN_PROGRESS"
                                                      ? "#fef3c7"
                                                      : "#f3f4f6",
                                                  color:
                                                    status === "DONE"
                                                      ? "#166534"
                                                      : status === "IN_PROGRESS"
                                                      ? "#92400e"
                                                      : "#4b5563"
                                                }}
                                              >
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                              </span>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Product Details */}
                                        {expandedCycles[cycleKey] && (
                                          <div style={{ padding: "1vw", background: "white" }}>
                                            {/* Product Information */}
                                            <div style={{
                                              background: "#f9fafb",
                                              padding: "0.8vw",
                                              borderRadius: "0.5vw",
                                              marginBottom: "1vw",
                                              border: "1px solid #e5e7eb"
                                            }}>
                                              <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "0.6vw"
                                              }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6vw", flexWrap: "wrap" }}>
                                                  <span style={{ fontWeight: "600", color: "#1f2937", fontSize: "0.9vw" }}>
                                                    {product.productName}
                                                  </span>
                                                  <span style={{ color: "#9ca3af", fontSize: "0.8vw" }}>•</span>
                                                  <span style={{ color: "#6b7280", fontSize: "0.8vw" }}>{product.size}</span>
                                                  <span style={{ color: "#9ca3af", fontSize: "0.8vw" }}>•</span>
                                                  <span style={{
                                                    padding: "0.3vw 0.6vw",
                                                    borderRadius: "0.4vw",
                                                    fontSize: "0.7vw",
                                                    fontWeight: "500",
                                                    background: product.imlType === "LID" ? "#dbeafe" : "#e9d5ff",
                                                    color: product.imlType === "LID" ? "#1e40af" : "#6b21a8"
                                                  }}>
                                                    {product.imlType}
                                                  </span>
                                                  <span style={{ color: "#9ca3af", fontSize: "0.8vw" }}>•</span>
                                                  <span style={{ fontSize: "0.8vw", color: "#6b7280" }}>
                                                    Ordered: {product.orderedQty}
                                                  </span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.4vw" }}>
                                                  {product.colors.lidColor && (
                                                    <div
                                                      style={{
                                                        width: "1.5vw",
                                                        height: "1.5vw",
                                                        borderRadius: "0.3vw",
                                                        border: "1px solid #d1d5db",
                                                        background: product.colors.lidColor
                                                      }}
                                                      title={`Lid: ${product.colors.lidColor}`}
                                                    />
                                                  )}
                                                  {product.colors.tubColor && (
                                                    <div
                                                      style={{
                                                        width: "1.5vw",
                                                        height: "1.5vw",
                                                        borderRadius: "0.3vw",
                                                        border: "1px solid #d1d5db",
                                                        background: product.colors.tubColor
                                                      }}
                                                      title={`Tub: ${product.colors.tubColor}`}
                                                    />
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Cycle Quantities */}
                                            <div style={{
                                              display: "grid",
                                              gridTemplateColumns: "repeat(3, 1fr)",
                                              gap: "0.8vw",
                                              marginBottom: "1vw"
                                            }}>
                                              <div style={{
                                                background: "#dbeafe",
                                                padding: "0.8vw",
                                                borderRadius: "0.5vw"
                                              }}>
                                                <div style={{ fontSize: "0.7vw", color: "#6b7280", marginBottom: "0.3vw" }}>
                                                  Planned
                                                </div>
                                                <div style={{ fontSize: "1.5vw", fontWeight: "bold", color: "#1e40af" }}>
                                                  {cycle.quantities.planned}
                                                </div>
                                              </div>
                                              <div style={{
                                                background: "#dcfce7",
                                                padding: "0.8vw",
                                                borderRadius: "0.5vw"
                                              }}>
                                                <div style={{ fontSize: "0.7vw", color: "#6b7280", marginBottom: "0.3vw" }}>
                                                  Produced
                                                </div>
                                                <div style={{ fontSize: "1.5vw", fontWeight: "bold", color: "#166534" }}>
                                                  {cycle.quantities.produced}
                                                </div>
                                              </div>
                                              <div style={{
                                                background: "#e9d5ff",
                                                padding: "0.8vw",
                                                borderRadius: "0.5vw"
                                              }}>
                                                <div style={{ fontSize: "0.7vw", color: "#6b7280", marginBottom: "0.3vw" }}>
                                                  Stock
                                                </div>
                                                <div style={{ fontSize: "1.5vw", fontWeight: "bold", color: "#6b21a8" }}>
                                                  {cycle.quantities.stock}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Workflow Status Details */}
                                            <div style={{
                                              borderTop: "1px solid #e5e7eb",
                                              paddingTop: "0.8vw"
                                            }}>
                                              <div style={{
                                                fontSize: "0.8vw",
                                                fontWeight: "500",
                                                color: "#374151",
                                                marginBottom: "0.6vw"
                                              }}>
                                                Workflow Status
                                              </div>
                                              <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(4, 1fr)",
                                                gap: "0.5vw"
                                              }}>
                                                {Object.entries(cycle.workflowStatus).map(([key, status]) => (
                                                  <div
                                                    key={key}
                                                    style={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "space-between",
                                                      padding: "0.5vw",
                                                      background: "#f9fafb",
                                                      borderRadius: "0.4vw"
                                                    }}
                                                  >
                                                    <span style={{ fontSize: "0.7vw", color: "#6b7280" }}>
                                                      {key.charAt(0).toUpperCase() + key.slice(1)}
                                                    </span>
                                                    <span style={{
                                                      fontSize: "0.7vw",
                                                      fontWeight: "500",
                                                      color:
                                                        status === "DONE"
                                                          ? "#166534"
                                                          : status === "IN_PROGRESS"
                                                          ? "#92400e"
                                                          : "#6b7280"
                                                    }}>
                                                      {status}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            {cycle.editable && (
                                              <div style={{
                                                background: "#fef3c7",
                                                border: "1px solid #fde68a",
                                                borderRadius: "0.4vw",
                                                padding: "0.5vw",
                                                fontSize: "0.7vw",
                                                color: "#92400e",
                                                marginTop: "0.8vw"
                                              }}>
                                                ℹ️ This cycle is editable
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))
                            ) : (
                              <div style={{
                                textAlign: "center",
                                padding: "2vw",
                                color: "#6b7280",
                                fontSize: "0.9vw"
                              }}>
                                No products found for this order
                              </div>
                            )}

                            {/* Order Summary */}
                            <div style={{
                              borderTop: "1px solid #e5e7eb",
                              paddingTop: "0.8vw",
                              marginTop: "0.8vw"
                            }}>
                              <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "0.8vw",
                                fontSize: "0.8vw"
                              }}>
                                <div>
                                  <span style={{ color: "#6b7280" }}>Estimated Qty:</span>
                                  <span style={{ marginLeft: "0.5vw", fontWeight: "500" }}>
                                    {order.orderDetails.estimatedQuantity}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: "#6b7280" }}>Estimated Value:</span>
                                  <span style={{ marginLeft: "0.5vw", fontWeight: "500" }}>
                                    ₹{order.orderDetails.estimatedValue}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: "#6b7280" }}>Priority:</span>
                                  <span style={{
                                    marginLeft: "0.5vw",
                                    padding: "0.3vw 0.6vw",
                                    borderRadius: "0.4vw",
                                    fontSize: "0.7vw",
                                    fontWeight: "500",
                                    background:
                                      order.contact.priority === "high"
                                        ? "#fee2e2"
                                        : order.contact.priority === "medium"
                                        ? "#fef3c7"
                                        : "#dbeafe",
                                    color:
                                      order.contact.priority === "high"
                                        ? "#991b1b"
                                        : order.contact.priority === "medium"
                                        ? "#92400e"
                                        : "#1e40af"
                                  }}>
                                    {order.contact.priority.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              {order.orderDetails.remarks && (
                                <div style={{ marginTop: "0.6vw", fontSize: "0.8vw" }}>
                                  <span style={{ color: "#6b7280" }}>Remarks:</span>
                                  <span style={{ marginLeft: "0.5vw", color: "#1f2937" }}>
                                    {order.orderDetails.remarks}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}