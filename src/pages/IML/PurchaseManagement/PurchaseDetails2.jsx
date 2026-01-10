// PurchaseManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

// Storage keys
const DATA_VERSION = "2.0";
const VERSION_KEY = "iml_purchase_version";
const STORAGE_KEY_ORDERS = "imlorders";
const STORAGE_KEY_TRACKING = "iml_tracking_followups";
const STORAGE_KEY_LABEL = "iml_label_followups";
const STORAGE_KEY_METADATA = "iml_purchase_metadata";

const PurchaseManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeSheet, setActiveSheet] = useState("po");
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  
  // NEW: Expanded state for label quantity sheet
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});

  // Load orders that have been moved to purchase
  const loadPurchaseOrders = () => {
    console.log("🔄 loadPurchaseOrders called");
    
    const storedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    
    if (!storedOrders) {
      console.warn("⚠️ No orders in localStorage");
      setPurchaseOrders([]);
      return;
    }

    try {
      const allOrders = JSON.parse(storedOrders);
      console.log("📦 Total orders found:", allOrders.length);
      
      const purchaseOrders = allOrders.filter((order) => {
        if (!order.products || !Array.isArray(order.products)) {
          return false;
        }
        
        return order.products.some((product) => product.moveToPurchase === true);
      });

      console.log("✅ Purchase orders found:", purchaseOrders.length);
      setPurchaseOrders(purchaseOrders);
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      setPurchaseOrders([]);
    }
  };

  // Initial load
  useEffect(() => {
    console.log("🚀 PurchaseManagement mounted");
    
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== DATA_VERSION) {
      console.log("📦 Version update detected");
      localStorage.removeItem(STORAGE_KEY_TRACKING);
      localStorage.removeItem(STORAGE_KEY_LABEL);
      localStorage.removeItem(STORAGE_KEY_METADATA);
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
    }

    loadPurchaseOrders();
  }, []);

  // Listen for custom event
  useEffect(() => {
    const handleOrdersUpdate = () => {
      console.log("📢 ordersUpdated event received");
      loadPurchaseOrders();
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdate);
    return () => window.removeEventListener('ordersUpdated', handleOrdersUpdate);
  }, []);

  // Reload when location state changes
  useEffect(() => {
    if (location.state?.refreshOrders) {
      console.log("🔃 Refresh flag detected");
      loadPurchaseOrders();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-expand for PO sheet
  useEffect(() => {
    if (activeSheet === "po" && purchaseOrders.length > 0) {
      const grouped = groupOrdersByCompany();
      const newExpandedCompanies = {};
      const newExpandedOrders = {};

      Object.entries(grouped).forEach(([companyName, orders]) => {
        newExpandedCompanies[companyName] = true;
        const orderKeys = Object.keys(orders);
        if (orderKeys.length > 0) {
          newExpandedOrders[`${companyName}-${orderKeys[0]}`] = true;
        }
      });

      setExpandedCompanies(newExpandedCompanies);
      setExpandedOrders(newExpandedOrders);
    }
  }, [purchaseOrders, activeSheet]);

  // Auto-expand for Label sheet
  useEffect(() => {
    if (activeSheet === "label" && purchaseOrders.length > 0) {
      const grouped = groupByProductCategory();
      const newExpandedCategories = {};
      const newExpandedSizes = {};

      Object.entries(grouped).forEach(([category, sizes]) => {
        newExpandedCategories[category] = true;
        Object.keys(sizes).forEach(size => {
          newExpandedSizes[`${category}-${size}`] = true;
        });
      });

      setExpandedCategories(newExpandedCategories);
      setExpandedSizes(newExpandedSizes);
    }
  }, [purchaseOrders, activeSheet]);

  useEffect(() => {
  if (location.state?.activeSheet) {
    setActiveSheet(location.state.activeSheet);
    // Clear the state
    window.history.replaceState({}, document.title);
  }
}, [location.state]);

  // Group orders by company (for PO sheet)
  const groupOrdersByCompany = () => {
    const grouped = {};

    purchaseOrders.forEach((order) => {
      const companyName = order.contact?.company || "Unknown Company";
      const orderNumber = order.orderNumber || "N/A";

      if (!grouped[companyName]) {
        grouped[companyName] = {};
      }

      grouped[companyName][orderNumber] = order;
    });

    return grouped;
  };

  // NEW: Group by product category → size → company (for Label sheet)
  const groupByProductCategory = () => {
    const grouped = {};

    purchaseOrders.forEach((order) => {
      const companyName = order.contact?.company || "Unknown Company";
      
      order.products?.filter(p => p.moveToPurchase).forEach((product) => {
        const category = product.productName; // Rectangle, Round, etc.
        const size = product.size;

        if (!grouped[category]) {
          grouped[category] = {};
        }
        if (!grouped[category][size]) {
          grouped[category][size] = [];
        }

        // Check if company already exists for this category-size
        const existingCompany = grouped[category][size].find(
          item => item.companyName === companyName
        );

        if (!existingCompany) {
          grouped[category][size].push({
            companyName: companyName,
            productCategory: category,
            size: size,
            orders: []
          });
        }

        // Add order to company
        const companyIndex = grouped[category][size].findIndex(
          item => item.companyName === companyName
        );
        
        grouped[category][size][companyIndex].orders.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          product: product
        });
      });
    });

    return grouped;
  };

  // Get unique products
  const getUniqueProducts = useMemo(() => {
    const products = new Set();
    purchaseOrders.forEach((order) => {
      if (order.products) {
        order.products.forEach((product) => {
          if (product.moveToPurchase) {
            products.add(product.productName);
          }
        });
      }
    });
    return Array.from(products).sort();
  }, [purchaseOrders]);

  // Get unique sizes for selected product
  const getUniqueSizesForProduct = useMemo(() => {
    const sizes = new Set();
    purchaseOrders.forEach((order) => {
      if (order.products) {
        order.products.forEach((product) => {
          if (
            product.moveToPurchase &&
            (!selectedProduct || product.productName === selectedProduct)
          ) {
            sizes.add(product.size);
          }
        });
      }
    });
    return Array.from(sizes).sort();
  }, [purchaseOrders, selectedProduct]);

  // Filter orders for PO sheet
  const getFilteredGroupedOrders = () => {
    const allGrouped = groupOrdersByCompany();
    const filtered = {};

    Object.entries(allGrouped).forEach(([companyName, orders]) => {
      Object.entries(orders).forEach(([orderKey, order]) => {
        let matchesSearch = true;
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          matchesSearch =
            companyName.toLowerCase().includes(searchLower) ||
            order.contact.contactName.toLowerCase().includes(searchLower) ||
            order.contact.phone.toLowerCase().includes(searchLower) ||
            order.products?.some((product) =>
              product.imlName?.toLowerCase().includes(searchLower)
            );
        }

        let matchesProduct = true;
        if (selectedProduct) {
          matchesProduct = order.products?.some(
            (product) =>
              product.moveToPurchase &&
              product.productName === selectedProduct
          );
        }

        let matchesSize = true;
        if (selectedSize && selectedProduct) {
          matchesSize = order.products?.some(
            (product) =>
              product.moveToPurchase &&
              product.productName === selectedProduct &&
              product.size === selectedSize
          );
        }

        if (matchesSearch && matchesProduct && matchesSize) {
          if (!filtered[companyName]) {
            filtered[companyName] = {};
          }
          filtered[companyName][orderKey] = order;
        }
      });
    });

    return filtered;
  };

  // NEW: Filter for Label sheet
  const getFilteredCategoryGroups = () => {
    const allGrouped = groupByProductCategory();
    const filtered = {};

    Object.entries(allGrouped).forEach(([category, sizes]) => {
      // Apply product filter
      if (selectedProduct && category !== selectedProduct) {
        return;
      }

      Object.entries(sizes).forEach(([size, companies]) => {
        // Apply size filter
        if (selectedSize && size !== selectedSize) {
          return;
        }

        // Apply search filter
        const filteredCompanies = companies.filter(company => {
          if (!searchTerm) return true;
          
          const searchLower = searchTerm.toLowerCase();
          return company.companyName.toLowerCase().includes(searchLower);
        });

        if (filteredCompanies.length > 0) {
          if (!filtered[category]) {
            filtered[category] = {};
          }
          filtered[category][size] = filteredCompanies;
        }
      });
    });

    return filtered;
  };

  // Toggle functions
  const toggleCompany = (companyName) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const toggleOrder = (companyName, orderKey) => {
    const key = `${companyName}-${orderKey}`;
    setExpandedOrders((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // NEW: Toggle functions for label sheet
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleSize = (category, size) => {
    const key = `${category}-${size}`;
    setExpandedSizes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Open PO modal
  const handleOpenPOModal = (order) => {
    navigate("/iml/purchase/po-details", {
      state: {
        orderId: order.id,
        returnSheet: activeSheet,
      },
    });
  };

  // Open label quantity sheet
  const handleOpenLabelQuantitySheet = (companyName, category, size) => {
    navigate("/iml/purchase/label-quantity-sheet", {
      state: {
        companyName: companyName,
        productCategory: category,
        size: size
      }
    });
  };

  // Render based on active sheet
  const renderContent = () => {
    if (activeSheet === "po") {
      return renderPOSheet();
    } else {
      return renderLabelSheet();
    }
  };

  // PO Sheet Rendering (Original)
  const renderPOSheet = () => {
    const filteredGroupedOrders = getFilteredGroupedOrders();
    const hasOrders = Object.keys(filteredGroupedOrders).length > 0;

    if (!hasOrders) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-[2vw] text-center border border-gray-200">
          <div className="w-[4vw] h-[4vw] bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-[0.8vw]">
            <svg className="w-[2vw] h-[2vw] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Purchase Orders Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedProduct || selectedSize
              ? "No orders match your filters"
              : "Move orders from Orders Management to see them here"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-[1.5vw] max-h-[59vh] overflow-y-auto">
        {Object.entries(filteredGroupedOrders).map(([companyName, orders]) => (
          <div key={companyName} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Company Header */}
            <div
              onClick={() => toggleCompany(companyName)}
              className="bg-[#3d64bb] text-white px-[1.5vw] py-[.85vw] cursor-pointer hover:bg-[#2d54ab] transition-all flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <svg
                  className={`w-[1.2vw] h-[1.2vw] transition-transform duration-200 ${
                    expandedCompanies[companyName] ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div>
                  <h3 className="text-[1.15vw] font-bold">{companyName}</h3>
                  <p className="text-[.9vw] text-blue-100">{Object.keys(orders).length} Orders</p>
                </div>
              </div>
            </div>

            {/* Orders within Company */}
            {expandedCompanies[companyName] && (
              <div className="space-y-[1.25vw] p-[1vw]">
                {Object.entries(orders).map(([orderKey, order]) => {
                  const isOrderExpanded = expandedOrders[`${companyName}-${orderKey}`];
                  const purchaseProducts = order.products?.filter((p) => p.moveToPurchase) || [];

                  return (
                    <div key={orderKey} className="bg-gray-50 border border-gray-400 rounded-lg overflow-hidden">
                      {/* Order Header */}
                      <div
                        onClick={() => toggleOrder(companyName, orderKey)}
                        className="bg-gray-200 px-[1.5vw] py-[.85vw] cursor-pointer hover:bg-gray-300 transition-all flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <svg
                            className={`w-[1.2vw] h-[1.2vw] transition-transform duration-200 text-gray-600 ${
                              isOrderExpanded ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="text-[1.05vw] font-semibold text-gray-800">{orderKey}</h4>
                            <div className="flex gap-6 mt-2 text-[.9vw] text-gray-600">
                              <span><strong>Contact:</strong> {order.contact.contactName}</span>
                              <span><strong>Phone:</strong> {order.contact.phone}</span>
                              <span><strong>Products:</strong> {purchaseProducts.length}</span>
                            </div>
                          </div>
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenPOModal(order)}
                            className="px-[1vw] py-[.35vw] bg-purple-600 text-white rounded hover:bg-purple-700 text-[.85vw] font-medium cursor-pointer"
                          >
                            📋 PO
                          </button>
                        </div>
                      </div>

                      {/* Products Table */}
                      {isOrderExpanded && (
                        <div className="p-[1.5vw] bg-white">
                          {purchaseProducts.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-200">
                                    <th className="border border-gray-300 px-[1.25vw] py-[.75vw] text-left text-[.85vw] font-semibold">S.No</th>
                                    <th className="border border-gray-300 px-[1.25vw] py-[.75vw] text-left text-[.85vw] font-semibold">Product</th>
                                    <th className="border border-gray-300 px-[1.25vw] py-[.75vw] text-left text-[.85vw] font-semibold">Size</th>
                                    <th className="border border-gray-300 px-[1.25vw] py-[.75vw] text-left text-[.85vw] font-semibold">IML Name</th>
                                    <th className="border border-gray-300 px-[1.25vw] py-[.75vw] text-left text-[.85vw] font-semibold">Type</th>
                                    <th className="border border-gray-300 px-[1.25vw] py-[.75vw] text-left text-[.85vw] font-semibold">Qty</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {purchaseProducts.map((product, idx) => {
                                    const quantity = product.imlType.includes("LID") ? product.lidLabelQty : product.tubLabelQty;

                                    return (
                                      <tr key={product.id || idx} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-[1.25vw] py-[.75vw] text-[.85vw]">{idx + 1}</td>
                                        <td className="border border-gray-300 px-[1.25vw] py-[.75vw] text-[.85vw] font-medium">{product.productName || "N/A"}</td>
                                        <td className="border border-gray-300 px-[1.25vw] py-[.75vw] text-[.85vw]">{product.size || "N/A"}</td>
                                        <td className="border border-gray-300 px-[1.25vw] py-[.75vw] text-[.85vw]">
                                            {product.imlName || "N/A"}                                          
                                        </td>
                                        <td className="border border-gray-300 px-[1.25vw] py-[.75vw] text-[.85vw]">
                                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                            {product.imlType || "N/A"}
                                          </span>
                                        </td>
                                        <td className="border border-gray-300 px-[1.25vw] py-[.75vw] text-[.85vw] font-semibold">{quantity || "0"}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-[2vw]">No products moved to purchase</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // NEW: Label Sheet Rendering
  const renderLabelSheet = () => {
    const filteredCategoryGroups = getFilteredCategoryGroups();
    const hasData = Object.keys(filteredCategoryGroups).length > 0;

    if (!hasData) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-[2vw] text-center border border-gray-200">
          <div className="w-[4vw] h-[4vw] bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-[0.8vw]">
            <svg className="w-[2vw] h-[2vw] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedProduct || selectedSize
              ? "No products match your filters"
              : "No products in purchase"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-[1.5vw] max-h-[59vh] overflow-y-auto">
        {Object.entries(filteredCategoryGroups).map(([category, sizes]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border-2 border-purple-300 overflow-hidden">
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(category)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 px-[1.5vw] py-[.85vw] cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-4"
            >
              <svg
                className={`w-[1.2vw] h-[1.2vw] text-white transition-transform duration-200 ${
                  expandedCategories[category] ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <h3 className="text-[1.15vw] font-bold text-white flex items-center gap-2">
                  <span className="text-[1.3vw]">🔷</span> {category}
                </h3>
                <p className="text-[.85vw] text-purple-100">{Object.keys(sizes).length} Size{Object.keys(sizes).length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Sizes */}
            {expandedCategories[category] && (
              <div className="p-[1vw] space-y-[1vw]">
                {Object.entries(sizes).map(([size, companies]) => {
                  const sizeKey = `${category}-${size}`;
                  const isSizeExpanded = expandedSizes[sizeKey];

                  return (
                    <div key={size} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[0.6vw] border border-blue-200 overflow-hidden">
                      {/* Size Header */}
                      <div
                        onClick={() => toggleSize(category, size)}
                        className="px-[1vw] py-[.75vw] cursor-pointer hover:bg-blue-100 transition-all flex items-center gap-3"
                      >
                        <svg
                          className={`w-[1vw] h-[1vw] text-blue-700 transition-transform duration-200 ${
                            isSizeExpanded ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <h4 className="text-[1vw] font-semibold text-blue-900 flex items-center gap-2">
                          <span className="text-[1.1vw]">📏</span> {size}
                        </h4>
                        <span className="text-[.8vw] text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">
                          {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}
                        </span>
                      </div>

                      {/* Companies Table */}
                      {isSizeExpanded && (
                        <div className="px-[1vw] pb-[1vw]">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-[1vw] py-[.6vw] text-left text-[.85vw] font-semibold">S.No</th>
                                <th className="border border-gray-300 px-[1vw] py-[.6vw] text-left text-[.85vw] font-semibold">Company Name</th>
                                <th className="border border-gray-300 px-[1vw] py-[.6vw] text-center text-[.85vw] font-semibold">Orders</th>
                                <th className="border border-gray-300 px-[1vw] py-[.6vw] text-center text-[.85vw] font-semibold">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {companies.map((company, idx) => (
                                <tr key={idx} className="hover:bg-white transition-colors">
                                  <td className="border border-gray-300 px-[1vw] py-[.6vw] text-[.85vw]">{idx + 1}</td>
                                  <td className="border border-gray-300 px-[1vw] py-[.6vw] text-[.85vw] font-semibold text-gray-800">
                                    {company.companyName}
                                  </td>
                                  <td className="border border-gray-300 px-[1vw] py-[.6vw] text-center">
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-[.75vw] font-semibold">
                                      {company.orders.length}
                                    </span>
                                  </td>
                                  <td className="border border-gray-300 px-[1vw] py-[.6vw] text-center">
                                    <button
                                      onClick={() => handleOpenLabelQuantitySheet(company.companyName, category, size)}
                                      className="px-[1vw] py-[.4vw] bg-indigo-600 text-white rounded-[0.4vw] text-[.85vw] font-medium hover:bg-indigo-700 cursor-pointer transition-all inline-flex items-center gap-[0.5vw]"
                                    >
                                      <span>👁️</span> View
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
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-[1vw]">
      {/* Header */}
      <div className="mb-[1vw]">
        <div className="flex justify-between items-center mb-[.5vw] relative">
          <div className="flex items-center gap-[.75vw] ">
            <h1 className="text-[1.6vw] font-bold text-gray-900">
              Purchase Management
            </h1>

            <button
              onClick={() => {
                console.log("🔄 Manual refresh clicked");
                loadPurchaseOrders();
              }}
              className="px-[.75vw] py-[.4vw] bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[.75vw] font-medium transition-all flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-[1vw] h-[1vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <span className="text-[.75vw] bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {purchaseOrders.length} orders loaded
            </span>

          </div>
             {/* Sheet Toggle Buttons */}
              <div className="flex gap-[1vw] absolute right-[2%] mt-[-.5%]">
                <button
                  onClick={() => setActiveSheet("po")}
                  className={`flex-1 px-[1vw] py-[.65vw] rounded-lg font-semibold text-[.9vw] transition-all duration-200 cursor-pointer border-2 ${
                    activeSheet === "po"
                      ? "bg-blue-600 text-white border-blue-700 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-[1.2vw] h-[1.2vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>PO Sheet</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSheet("label")}
                  className={`flex-1 px-[1vw] py-[.65vw] rounded-lg font-semibold text-[.9vw] transition-all duration-200 cursor-pointer border-2 min-w-[13vw] ${
                    activeSheet === "label"
                      ? "bg-green-600 text-white border-green-700 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-[1.2vw] h-[1.2vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Label Quantity Sheet</span>
                  </div>
                </button>
              </div>

          
        </div>

       

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-[1vw] mb-[1vw] border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[.8vw] font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company, contact..."
                  className="w-full border border-gray-300 rounded-lg px-[.85vw] py-[0.6vw] focus:ring-2 focus:ring-blue-500 text-[.8vw]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-[0.9vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[.8vw] font-medium text-gray-700 mb-2">Filter by Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setSelectedSize("");
                }}
                className="w-full border border-gray-300 rounded-lg px-[.85vw] py-[0.6vw] focus:ring-2 focus:ring-blue-500 bg-white text-[.8vw]"
              >
                <option value="">All Products</option>
                {getUniqueProducts.map((product) => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[.8vw] font-medium text-gray-700 mb-2">Filter by Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={!selectedProduct}
                className="w-full border border-gray-300 rounded-lg px-[.85vw] py-[0.6vw] focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 text-[.8vw]"
              >
                <option value="">All Sizes</option>
                {getUniqueSizesForProduct.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedProduct("");
                  setSelectedSize("");
                }}
                className="w-full px-[.85vw] py-[0.6vw] bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-[.8vw] cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content Based on Active Sheet */}
      {renderContent()}
    </div>
  );
};

export default PurchaseManagement;
