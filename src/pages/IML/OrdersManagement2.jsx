import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewOrder from "./NewOrder";

// Mock data storage (In production, this would be an API/Database)
const STORAGE_KEY = "iml_orders";

// Product size options for initial expansion
const PRODUCT_SIZE_OPTIONS = {
  Round: ["120ml", "250ml", "300ml", "500ml", "1000ml"],
  "Round Square": ["450ml", "500ml"],
  Rectangle: ["500ml", "650ml", "750ml"],
  "Sweet Box": ["250gms", "500gms"],
  "Sweet Box TE": ["TE 250gms", "TE 500gms"],
};

export default function OrdersManagement2() {
  console.log("OrdersManagement2 component rendered");

  const [view, setView] = useState("dashboard"); // 'dashboard' or 'form'
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});
  const navigate = useNavigate();

  // Initialize with dummy data if no orders exist
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedOrders = JSON.parse(stored);
      setOrders(parsedOrders);

      // If no orders exist, initialize with dummy data
      if (parsedOrders.length === 0) {
        initializeDummyData();
      }
    } else {
      initializeDummyData();
    }
  }, []);

  // Initialize dummy data
  const initializeDummyData = () => {
    const dummyOrders = [
      {
        id: 1702456789001,
        contact: {
          company: "ABC Industries",
          contactName: "John Smith",
          phone: "9876543210",
          imlName: "Premium IML Labels",
          priority: "high",
        },
        products: [
          {
            id: 1,
            orderNumber: "ORD-1702456789001-123",
            productName: "Round",
            size: "500ml",
            lidColor: { r: 255, g: 100, b: 100, a: 1 },
            tubColor: { r: 100, g: 150, b: 255, a: 1 },
            imlType: "LID",
            lidLabelQty: "10000",
            lidProductionQty: "9500",
            lidStock: 500,
            tubLabelQty: "",
            tubProductionQty: "",
            tubStock: 0,
            budget: 25000,
            approvedDate: "2025-12-10",
            designSharedMail: true,
            designStatus: "approved",
          },
        ],
        payment: {
          totalEstimated: "25000",
          remarks: "First payment received",
        },
        paymentRecords: [
          {
            timestamp: "2025-12-10T10:30:00.000Z",
            paymentType: "advance",
            method: "UPI",
            amount: "10000",
            remarks: "Advance payment",
            productIds: [1],
          },
        ],
        status: "pending",
        createdAt: "2025-12-10T08:00:00.000Z",
      },
      {
        id: 1702456789002,
        contact: {
          company: "XYZ Corporation",
          contactName: "Jane Doe",
          phone: "9123456780",
          imlName: "Quality IML Solutions",
          priority: "medium",
        },
        products: [
          {
            id: 1,
            orderNumber: "ORD-1702456789002-456",
            productName: "Rectangle",
            size: "750ml",
            lidColor: { r: 100, g: 255, b: 100, a: 1 },
            tubColor: { r: 255, g: 200, b: 50, a: 1 },
            imlType: "TUB",
            lidLabelQty: "",
            lidProductionQty: "",
            lidStock: 0,
            tubLabelQty: "15000",
            tubProductionQty: "14500",
            tubStock: 500,
            budget: 35000,
            approvedDate: "2025-12-11",
            designSharedMail: true,
            designStatus: "pending",
          },
        ],
        payment: {
          totalEstimated: "35000",
          remarks: "",
        },
        paymentRecords: [],
        status: "pending",
        createdAt: "2025-12-11T09:30:00.000Z",
      },
    ];

    setOrders(dummyOrders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyOrders));
  };

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  // Initialize expanded categories - expand all categories and first size on load
  // Initialize expanded categories - expand all categories and first size on load
  useEffect(() => {
    if (orders.length > 0) {
      const groupedOrders = groupOrdersByProductAndSize();
      const newExpandedCategories = {};
      const newExpandedSizes = {};

      // Expand all categories that exist in actual orders
      Object.entries(groupedOrders).forEach(([productName, sizes]) => {
        // Expand the category
        newExpandedCategories[productName] = true;

        // Expand the first size for this category
        const sizeKeys = Object.keys(sizes);
        if (sizeKeys.length > 0) {
          const firstSize = sizeKeys[0];
          newExpandedSizes[`${productName}-${firstSize}`] = true;
        }
      });

      setExpandedCategories(newExpandedCategories);
      setExpandedSizes(newExpandedSizes);
    }
  }, [orders.length]);

  // Auto-expand categories and sizes when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const newExpandedCategories = {};
      const newExpandedSizes = {};
      const groupedOrders = groupOrdersByProductAndSize();

      Object.entries(groupedOrders).forEach(([productName, sizes]) => {
        let hasMatch = false;
        Object.entries(sizes).forEach(([size, ordersList]) => {
          const hasCompanyMatch = ordersList.some(
            (order) =>
              order.contact.company
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              order.contact.contactName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              order.contact.imlName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );

          if (hasCompanyMatch) {
            hasMatch = true;
            newExpandedSizes[`${productName}-${size}`] = true;
          }
        });

        if (hasMatch) {
          newExpandedCategories[productName] = true;
        }
      });

      setExpandedCategories(newExpandedCategories);
      setExpandedSizes(newExpandedSizes);
    }
  }, [searchTerm, orders]);

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

  // Handle move to purchase
  const handleMoveToPurchase = (order) => {
    // Check if any products in this order
    if (!order.products || order.products.length === 0) {
      alert("This order has no products to move.");
      return;
    }

    // Check if already moved
    const alreadyMoved = order.products.some((p) => p.moveToPurchase === true);

    if (alreadyMoved) {
      alert("This order has already been moved to Purchase Management.");
      return;
    }

    const confirmMessage = `Are you sure you want to move this order to Purchase Management?\n\nCompany: ${order.contact.company}\nProducts: ${order.products.length}`;

    if (window.confirm(confirmMessage)) {
      const updatedOrders = orders.map((o) => {
        if (o.id === order.id) {
          return {
            ...o,
            products: o.products.map((p) => ({
              ...p,
              moveToPurchase: true,
            })),
          };
        }
        return o;
      });

      setOrders(updatedOrders);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
      alert("Order successfully moved to Purchase Management!");
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
  
  // Handle cancel from form
  const handleBack = () => {
    setView("dashboard");
    setEditingOrder(null);
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle size expansion
  const toggleSize = (category, size) => {
    const key = `${category}-${size}`;
    setExpandedSizes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Group orders by product category and size
  const groupOrdersByProductAndSize = () => {
    const grouped = {};

    orders.forEach((order) => {
      if (order.products && order.products.length > 0) {
        order.products.forEach((product) => {
          const productName = product.productName || "Uncategorized";
          const size = product.size || "No Size";

          if (!grouped[productName]) {
            grouped[productName] = {};
          }

          if (!grouped[productName][size]) {
            grouped[productName][size] = [];
          }

          grouped[productName][size].push(order);
        });
      } else {
        // Handle orders without products
        if (!grouped["Uncategorized"]) {
          grouped["Uncategorized"] = {};
        }

        if (!grouped["Uncategorized"]["No Products"]) {
          grouped["Uncategorized"]["No Products"] = [];
        }

        grouped["Uncategorized"]["No Products"].push(order);
      }
    });

    return grouped;
  };

  // Get unique product names from all orders
  const getUniqueProducts = () => {
    const products = new Set();
    orders.forEach((order) => {
      if (order.products && order.products.length > 0) {
        order.products.forEach((product) => {
          products.add(product.productName || "Uncategorized");
        });
      }
    });
    return Array.from(products).sort();
  };

  // Get unique sizes for a specific product
  const getUniqueSizesForProduct = (productName) => {
    const sizes = new Set();
    orders.forEach((order) => {
      if (order.products && order.products.length > 0) {
        order.products.forEach((product) => {
          if (product.productName === productName) {
            sizes.add(product.size || "No Size");
          }
        });
      }
    });
    return Array.from(sizes).sort();
  };

  // Filter orders based on search, status, product, and size
  const filterOrders = (ordersList) => {
    return ordersList.filter((order) => {
      const matchesSearch =
        order.contact.company
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.contact.contactName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.contact.imlName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || order.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  // Get filtered grouped orders
  const getFilteredGroupedOrders = () => {
    const allGrouped = groupOrdersByProductAndSize();
    const filtered = {};

    Object.entries(allGrouped).forEach(([productName, sizes]) => {
      // Filter by selected product
      if (selectedProduct && productName !== selectedProduct) {
        return;
      }

      Object.entries(sizes).forEach(([size, ordersList]) => {
        // Filter by selected size
        if (selectedSize && size !== selectedSize) {
          return;
        }

        const filteredOrders = filterOrders(ordersList);
        if (filteredOrders.length > 0) {
          if (!filtered[productName]) {
            filtered[productName] = {};
          }

          filtered[productName][size] = filteredOrders;
        }
      });
    });

    return filtered;
  };

  const getArtworkStatusForOrder = (order) => {
    if (!order.products || order.products.length === 0) return "pending";

    // you can change the rule here if needed (e.g., prioritize in-progress over pending)
    const statuses = order.products.map((p) =>
      (p.designStatus || "pending").toLowerCase()
    );

    if (statuses.includes("in-progress")) return "in-progress";
    if (statuses.includes("approved")) return "approved";
    return "pending";
  };

  // Calculate statistics

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,

    movedToPurchase: orders.reduce((count, order) => {
      if (!order.products) return count;
      const moved = order.products.some((p) => p.moveToPurchase === true);
      return moved ? count + 1 : count;
    }, 0),

    // Artwork status counts (per ORDER, using normalized status)
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

  // Reset size filter when product changes
  useEffect(() => {
    setSelectedSize("");
  }, [selectedProduct]);

  if (view === "form") {
    return (
      <div className="min-h-screen bg-gray-50 p-[1vw]">
        <NewOrder
          existingOrder={editingOrder}
          onSubmit={handleOrderSubmit}
          onCancel={handleCancel}
          onBack={handleBack}
        />
      </div>
    );
  }

  const filteredGroupedOrders = getFilteredGroupedOrders();
  const hasOrders = Object.keys(filteredGroupedOrders).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-[1vw]">
      {/* Header */}

      <div className="mb-[1.25vw]">
        <div className="flex justify-between items-center mb-[.25vw]">
          <h1 className="text-[1.6vw] font-bold text-gray-900">
            Orders Management (IML)
          </h1>

          <button
            onClick={handleNewOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-[.85vw] py-[0.45vw] rounded-[0.6vw] font-medium shadow-md hover:shadow-lg transition-all text-[0.9vw] cursor-pointer"
          >
            + New Order
          </button>
        </div>

        <p className="text-gray-600 text-[.9vw]">
          Manage all your orders, designs, and client information
        </p>
      </div>

      {/* Dashboard Stats Cards with SVG Icons */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-[1vw]">
        {/* Total Orders Card */}

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-[0.75vw] border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium text-[.9vw]">
              Total Orders
            </span>

            <div className="w-[2vw] h-[2vw] bg-[#3d64bb] rounded-[0.5vw] flex items-center justify-center">
              <svg
                className="w-[1.2vw] h-[1.2vw] text-white"
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
            </div>
          </div>

          <div className="text-[1.25vw] font-bold text-blue-900">
            {stats.total}
          </div>
        </div>

        {/* Pending Card */}

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-[0.75vw] border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-orange-700 font-medium text-[.9vw]">
              Artwork Pending
            </span>

            <div className="w-[2vw] h-[2vw] bg-orange-500 rounded-[0.5vw] flex items-center justify-center">
              <svg
                className="w-[1.2vw] h-[1.2vw] text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="text-[1.25vw] font-bold text-orange-900">
            {stats.artworkPending}
          </div>
        </div>

        {/* Completed Card */}

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-[0.75vw] border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-green-700 font-medium text-[.9vw]">
              Artwork Approved
            </span>

            <div className="w-[2vw] h-[2vw] bg-green-500 rounded-[0.5vw] flex items-center justify-center">
              <svg
                className="w-[1.2vw] h-[1.2vw] text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="text-[1.25vw] font-bold text-green-900">
            {stats.artworkApproved}
          </div>
        </div>

        {/* In Progress Card */}

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-[0.75vw] border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-yellow-700 font-medium text-[.9vw]">
              Moved to Purchase
            </span>

            <div className="w-[2vw] h-[2vw] bg-yellow-500 rounded-[0.5vw] flex items-center justify-center">
              <svg
                className="w-[1.2vw] h-[1.2vw] text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          <div className="text-[1.25vw] font-bold text-yellow-900">
            {stats.movedToPurchase}
          </div>
        </div>
      </div>

      {/* Filters - UPDATED with proper width for size dropdown */}

      <div className="bg-white rounded-xl shadow-sm p-[1vw] mb-[1vw] border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}

          <div>
            <label className="block text-[.8vw] font-medium text-gray-700 mb-2">
              Search Company
            </label>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name..."
                className="w-full border border-gray-300 rounded-lg px-[.85vw] py-[0.6vw] focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[.8vw]"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-[0.9vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}

          <div>
            <label className="block text-[.8vw] font-medium text-gray-700 mb-2">
              Artwork Status
            </label>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-[.85vw] py-[0.6vw] focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-[.8vw]"
            >
              <option value="all">All Status</option>

              <option value="pending">Pending</option>

              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Product Filter */}

          <div>
            <label className="block text-[.8vw] font-medium text-gray-700 mb-2">
              Filter by Product
            </label>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-[.85vw] py-[0.6vw] focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-[.8vw]"
            >
              <option value="">All Products</option>

              {getUniqueProducts().map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          {/* Size Filter - UPDATED with max-width */}

          <div>
            <label className="block text-[.8vw] font-medium text-gray-700 mb-2">
              Filter by Size
            </label>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              disabled={!selectedProduct}
              className="w-full border border-gray-300 rounded-lg px-[.85vw] py-[0.6vw] focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-[.8vw]"
              style={{ maxWidth: "100%" }}
            >
              <option value="">All Sizes</option>

              {selectedProduct &&
                getUniqueSizesForProduct(selectedProduct).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Display */}

      {!hasOrders ? (
        <div className="bg-white rounded-xl shadow-sm p-[2vw] text-center border border-gray-200">
          <div className="w-[4vw] h-[4vw] bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-[0.8vw]">
            <svg
              className="w-[2vw] h-[2vw] text-gray-400"
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
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Orders Found
          </h3>

          <p className="text-gray-600 mb-6">
            {searchTerm ||
              filterStatus !== "all" ||
              selectedProduct ||
              selectedSize
              ? `No orders found matching your filters`
              : "Get started by creating your first order"}
          </p>

          {!searchTerm &&
            filterStatus === "all" &&
            !selectedProduct &&
            !selectedSize && (
              <button
                onClick={handleNewOrder}
                className="bg-[#388ce3] hover:bg-[#2f74c9] text-white px-[1vw] py-[0.6vw] rounded-[0.6vw] font-medium text-[0.9vw]"
              >
                Create New Order
              </button>
            )}
        </div>
      ) : (
        <div className="space-y-[1.5vw] max-h-[41vh] overflow-y-auto">
          {Object.keys(PRODUCT_SIZE_OPTIONS)
            .filter((productName) => filteredGroupedOrders[productName])
            .map((productName) => {
              const sizes = filteredGroupedOrders[productName];
              return (
                <div
                  key={productName}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Product Category Header */}

                  <button
                    onClick={() => toggleCategory(productName)}
                    className="w-full bg-[#3d64bb] text-white px-[0.75vw] py-[0.35vw] flex items-center justify-between transition-colors border-b border-[#3555a0] cursor-pointer"
                  >
                    <div className="flex items-center gap-[0.8vw]">
                      <div className="w-[2.6vw] h-[2.6vw] bg-[#3d64bb] rounded-[0.5vw] flex items-center justify-center">
                        <svg
                          className="w-[1.5vw] h-[1.5vw] text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>

                      <span className="font-bold text-[1vw]">
                        {productName}
                      </span>

                      <span className="bg-[#cfe0ff] text-[#3d64bb] px-[0.6vw] py-[0.35vw] rounded-full text-[0.8vw] font-medium">
                        {Object.keys(sizes).length}

                        {Object.keys(sizes).length === 1 ? " Size" : " Sizes"}
                      </span>
                    </div>

                    <svg
                      className={`w-[1.2vw] h-[1.2vw] text-white transition-transform ${expandedCategories[productName] ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Sizes */}

                  {expandedCategories[productName] && (
                    <div className="divide-y divide-gray-100">
                      {PRODUCT_SIZE_OPTIONS[productName]
                        .filter((size) => sizes[size])
                        .map((size) => {
                          const ordersList = sizes[size];
                          return (
                            <div
                              key={`${productName}-${size}`}
                              className="bg-gray-50"
                            >
                              {/* Size Header */}

                              <button
                                onClick={() => toggleSize(productName, size)}
                                className="w-[98.5%] m-[.5vw] px-[.75vw] py-[0.6vw] flex items-center justify-between bg-[#e7e7e7] border border-[0.05px] border-gray-400 transition-colors rounded-xl cursor-pointer"
                              >
                                <div className="flex items-center gap-[0.7vw]">
                                  <div className="w-[2.2vw] h-[2.2vw] bg-[#333333] rounded-[0.45vw] flex items-center justify-center">
                                    <svg
                                      className="w-[1vw] h-[1vw] text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                  </div>

                                  <span className="font-semibold text-[0.95vw] text-[#333333]">
                                    {size}
                                  </span>

                                  <span className="bg-[#ffffff] text-[#333333] px-[0.6vw] py-[0.35vw] rounded-full text-[0.8vw] font-medium">
                                    {ordersList.length}

                                    {ordersList.length === 1
                                      ? " Order"
                                      : " Orders"}
                                  </span>
                                </div>

                                <svg
                                  className={`w-[1vw] h-[1vw] text-[#333333] transition-transform ${expandedSizes[`${productName}-${size}`]
                                    ? "rotate-180"
                                    : ""
                                    }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>

                              {/* Orders Table */}

                              {expandedSizes[`${productName}-${size}`] && (
                                <div className="px-[0.8vw] pb-[0.8vw]">
                                  <div className="overflow-x-auto rounded-[0.5vw] border border-gray-300">
                                    <table className="w-full text-[0.9vw]">
                                      <thead className="bg-gray-100 border-b border-gray-300">
                                        <tr>
                                          <th className="px-[0.8vw] py-[0.7vw] text-left font-semibold text-gray-700">
                                            Company
                                          </th>

                                          <th className="px-[0.8vw] py-[0.7vw] text-left font-semibold text-gray-700">
                                            Contact
                                          </th>

                                          <th className="px-[0.8vw] py-[0.7vw] text-left font-semibold text-gray-700">
                                            IML Name
                                          </th>

                                          <th className="px-[0.8vw] py-[0.7vw] text-left font-semibold text-gray-700">
                                            Artwork Status
                                          </th>

                                          <th className="px-[0.8vw] py-[0.7vw] text-left font-semibold text-gray-700">
                                            Total Budget
                                          </th>

                                          <th className="px-[0.8vw] py-[0.7vw] text-left font-semibold text-gray-700">
                                            Created
                                          </th>

                                          <th className="px-[0.8vw] py-[0.7vw] text-center font-semibold text-gray-700">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-gray-100 bg-white">
                                        {filterOrders(ordersList).map(
                                          (order) => {
                                            const totalBudget =
                                              order.products?.reduce(
                                                (sum, p) =>
                                                  sum +
                                                  (parseFloat(p.budget) || 0),
                                                0
                                              );

                                            return (
                                              <tr
                                                key={order.id}
                                                className="hover:bg-gray-50 transition-colors"
                                              >
                                                <td className="px-[0.8vw] py-[0.65vw] font-medium text-gray-900">
                                                  {order.contact.company}
                                                </td>

                                                <td className="px-[0.8vw] py-[0.65vw]">
                                                  <div className="text-gray-900">
                                                    {order.contact.contactName}
                                                  </div>

                                                  <div className="text-gray-500 text-[0.85vw]">
                                                    {order.contact.phone}
                                                  </div>
                                                </td>

                                                <td className="px-[0.8vw] py-[0.65vw] text-gray-700">
                                                  {order.contact.imlName}
                                                </td>

                                                <td className="px-[0.8vw] py-[0.65vw]">
                                                  {order.products &&
                                                    order.products.length > 0 ? (
                                                    (() => {
                                                      const artworkStatus =
                                                        getArtworkStatusForOrder(
                                                          order
                                                        );
                                                      const colorClasses =
                                                        artworkStatus ===
                                                          "approved"
                                                          ? "bg-green-100 text-green-700"
                                                          : artworkStatus ===
                                                            "in-progress"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-orange-100 text-orange-700";

                                                      const label =
                                                        artworkStatus ===
                                                          "in-progress"
                                                          ? "In Progress"
                                                          : artworkStatus
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                          artworkStatus.slice(
                                                            1
                                                          );

                                                      return (
                                                        <span
                                                          className={`px-[0.7vw] py-[0.35vw] rounded-full text-[0.8vw] font-medium ${colorClasses}`}
                                                        >
                                                          {label}
                                                        </span>
                                                      );
                                                    })()
                                                  ) : (
                                                    <span className="px-[0.7vw] py-[0.35vw] rounded-full text-[0.8vw] font-medium bg-gray-100 text-gray-500">
                                                      N/A
                                                    </span>
                                                  )}
                                                </td>

                                                <td className="px-[0.8vw] py-[0.65vw] font-semibold text-gray-900">
                                                  ₹
                                                  {totalBudget?.toFixed(2) ||
                                                    "0.00"}
                                                </td>

                                                <td className="px-[0.8vw] py-[0.65vw] text-gray-600">
                                                  {new Date(
                                                    order.createdAt
                                                  ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                    }
                                                  )}
                                                </td>

                                                <td className="px-[0.8vw] py-[0.65vw]">
                                                  <div className="flex items-center justify-center gap-2">
                                                    <button
                                                      onClick={() =>
                                                        handleEditOrder(order)
                                                      }
                                                      className="bg-[#3d64bb] hover:bg-[#3350a9] text-white px-[0.6vw] py-[0.4vw] rounded-[0.5vw] text-[0.85vw] font-medium transition-colors cursor-pointer"
                                                    >
                                                      Edit
                                                    </button>

                                                    <button
                                                      onClick={() =>
                                                        handleDeleteOrder(
                                                          order.id
                                                        )
                                                      }
                                                      className="bg-red-500 hover:bg-red-600 text-white px-[0.6vw] py-[0.4vw] rounded-[0.5vw] text-[0.85vw] font-medium transition-colors cursor-pointer"
                                                    >
                                                      Delete
                                                    </button>

                                                    <button
                                                      onClick={() => handleMoveToPurchase(order)}
                                                      className={`font-medium ${order.products?.some((p) => p.moveToPurchase === true)
                                                          ? "text-green-600 cursor-not-allowed"
                                                          : "text-purple-600 hover:text-purple-800 cursor-pointer"
                                                        } `}
                                                      disabled={order.products?.some((p) => p.moveToPurchase === true)}
                                                    >
                                                      {order.products?.some((p) => p.moveToPurchase === true)
                                                        ? "Purchase ✓"
                                                        : "Move to Purchase"}
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
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

      {/* Search Results Info */}

      {searchTerm && !hasOrders && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            No company found matching{" "}
            <span className="font-semibold">"{searchTerm}"</span>
          </p>
        </div>
      )}
    </div>
  );
}
