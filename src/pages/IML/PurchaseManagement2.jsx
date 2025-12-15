// PurchaseManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY_PURCHASE = "iml_purchase_entries";

const dummyPurchaseEntries = [
  {
    id: 1,
    date: "25/11/2025",
    company: "Terra Tech Packs",
    contact: "John Doe",
    product: "Round",
    size: "250ml",
    qty: "26,500",
    supplier: "Global Suppliers Inc.",
    comments: "Urgent delivery",
  },
  {
    id: 2,
    date: "24/11/2025",
    company: "ABC Industries",
    contact: "Emily Smith",
    product: "Rectangle",
    size: "500ml",
    qty: "15,000",
    supplier: "Prime Materials Ltd.",
    comments: "Standard order",
  },
  {
    id: 3,
    date: "23/11/2025",
    company: "Terra Tech Packs",
    contact: "John Doe",
    product: "Sweet Box",
    size: "250gms",
    qty: "10,000",
    supplier: "Quality Distributors",
    comments: "Festival special",
  },
  {
    id: 4,
    date: "22/11/2025",
    company: "XYZ Corp",
    contact: "Sarah Johnson",
    product: "Round",
    size: "500ml",
    qty: "8,500",
    supplier: "Global Suppliers Inc.",
    comments: "Regular shipment",
  },
];

// Chevron Down SVG Component
const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

// Chevron Up SVG Component
const ChevronUpIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 15.75 7.5-7.5 7.5 7.5"
    />
  </svg>
);

const PurchaseManagement = () => {
  const navigate = useNavigate();
  const [purchaseEntries, setPurchaseEntries] = useState([]);
  const [searchCompany, setSearchCompany] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});
  const [activeSheet, setActiveSheet] = useState("tracking"); // "tracking" or "label"

  // Initialize dummy data only when no data in localStorage
  const initializeDummyDataPurchase = () => {
    setPurchaseEntries(dummyPurchaseEntries);
    localStorage.setItem(
      STORAGE_KEY_PURCHASE,
      JSON.stringify(dummyPurchaseEntries)
    );
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PURCHASE);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPurchaseEntries(parsed);
      } else {
        initializeDummyDataPurchase();
      }
    } else {
      initializeDummyDataPurchase();
    }
  }, []);

  // Initialize all product categories as expanded and first size of each product as expanded
  useEffect(() => {
    if (purchaseEntries.length > 0) {
      const newExpandedProducts = {};
      const newExpandedSizes = {};

      // Group entries by product
      const productGroups = {};
      purchaseEntries.forEach((entry) => {
        const product = entry.product || "Uncategorized";
        if (!productGroups[product]) {
          productGroups[product] = new Set();
        }
        productGroups[product].add(entry.size || "No Size");
      });

      // Expand all products
      Object.keys(productGroups).forEach((product) => {
        newExpandedProducts[product] = true;

        // Expand first size of each product
        const sizes = Array.from(productGroups[product]).sort();
        if (sizes.length > 0) {
          const firstSize = sizes[0];
          newExpandedSizes[`${product}-${firstSize}`] = true;
        }
      });

      setExpandedProducts(newExpandedProducts);
      setExpandedSizes(newExpandedSizes);
    }
  }, [purchaseEntries]);

  // (optional) save back when entries change
  useEffect(() => {
    if (purchaseEntries.length > 0) {
      localStorage.setItem(
        STORAGE_KEY_PURCHASE,
        JSON.stringify(purchaseEntries)
      );
    }
  }, [purchaseEntries]);

  const openDetails = (entry, mode) => {
    navigate("/iml/purchase-details", {
      state: {
        entry,
        mode, // "tracking" or "label"
      },
    });
  };

  // Unique products for category filter
  const uniqueProducts = useMemo(() => {
    const set = new Set();
    purchaseEntries.forEach((e) => set.add(e.product));
    return Array.from(set).sort();
  }, [purchaseEntries]);

  // Unique sizes for size filter, optionally narrowed by selectedProduct
  const uniqueSizes = useMemo(() => {
    const set = new Set();
    purchaseEntries.forEach((e) => {
      if (!selectedProduct || e.product === selectedProduct) {
        set.add(e.size);
      }
    });
    return Array.from(set).sort();
  }, [purchaseEntries, selectedProduct]);

  // Unique suppliers for supplier filter
  const uniqueSuppliers = useMemo(() => {
    const set = new Set();
    purchaseEntries.forEach((e) => {
      if (e.supplier) {
        set.add(e.supplier);
      }
    });
    return Array.from(set).sort();
  }, [purchaseEntries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    const companyTerm = searchCompany.trim().toLowerCase();
    return purchaseEntries.filter((entry) => {
      const matchesCompany =
        !companyTerm || entry.company.toLowerCase().includes(companyTerm);
      const matchesProduct =
        !selectedProduct || entry.product === selectedProduct;
      const matchesSize = !selectedSize || entry.size === selectedSize;
      const matchesSupplier =
        !selectedSupplier || entry.supplier === selectedSupplier;
      return matchesCompany && matchesProduct && matchesSize && matchesSupplier;
    });
  }, [
    purchaseEntries,
    searchCompany,
    selectedProduct,
    selectedSize,
    selectedSupplier,
  ]);

  // Group by product -> size
  const groupedEntries = useMemo(() => {
    const grouped = {};
    filteredEntries.forEach((entry) => {
      const product = entry.product || "Uncategorized";
      const size = entry.size || "No Size";
      if (!grouped[product]) grouped[product] = {};
      if (!grouped[product][size]) grouped[product][size] = [];
      grouped[product][size].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  const hasEntries = Object.keys(groupedEntries).length > 0;

  const toggleProduct = (product) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [product]: !prev[product],
    }));
  };

  const toggleSize = (product, size) => {
    const key = `${product}-${size}`;
    setExpandedSizes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.75vw] text-gray-800 font-semibold m-0">
          Purchase Management
        </h1>

        {/* Sheet Toggle Buttons */}
        <div className="flex gap-[0.8vw] bg-white p-[0.5vw] rounded-full shadow-sm">
          <button
            onClick={() => setActiveSheet("tracking")}
            className={`px-[1.5vw] py-[0.7vw] text-[0.95vw] rounded-full font-medium transition-all cursor-pointer border border-[2px] duration-300 ${
              activeSheet === "tracking"
                ? "border-transparent bg-blue-600 text-white"
                : "border-blue-600 bg-transparent text-blue-600"
            }`}
          >
            Tracking Sheet
          </button>
          <button
            onClick={() => setActiveSheet("label")}
            className={`px-[1.5vw] py-[0.7vw] text-[0.95vw] rounded-full font-medium transition-all cursor-pointer border border-[2px] duration-300 ${
              activeSheet === "label"
                ? "border-transparent bg-blue-600 text-white"
                : "border-blue-600 bg-transparent text-blue-600"
            }`}
          >
            Label Quantity Sheet
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex gap-[1.2vw] mb-[1.25vw] flex-wrap bg-white p-[1.5vw] rounded-lg shadow-sm border border-gray-200">
        {/* Search by company */}
        <div className="flex-[1_1_18vw] min-w-[15vw]">
          <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
            Search by Company
          </label>
          <input
            type="text"
            placeholder="Enter company name..."
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
            className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
          />
        </div>

        {/* Filter by Product */}
        <div className="flex-[1_1_15vw] min-w-[12vw]">
          <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
            Filter by Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedSize("");
            }}
            className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
          >
            <option value="">All Products</option>
            {uniqueProducts.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Size */}
        <div className="flex-[1_1_15vw] min-w-[12vw]">
          <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
            Filter by Size
          </label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
          >
            <option value="">All Sizes</option>
            {uniqueSizes.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Supplier (only for Tracking Sheet) */}
        {activeSheet === "tracking" && (
          <div className="flex-[1_1_15vw] min-w-[12vw]">
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Filter by Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-[0.7vw] py-[0.7vw] text-[0.9vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
            >
              <option value="">All Suppliers</option>
              {uniqueSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Filters */}
        <div className="flex-[0_0_auto] self-end">
          <button
            onClick={() => {
              setSearchCompany("");
              setSelectedProduct("");
              setSelectedSize("");
              setSelectedSupplier("");
            }}
            className="px-[1.5vw] py-[0.7vw] text-[0.9vw] bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Grouped Entries */}
      {!hasEntries ? (
        <div className="bg-white p-[3vw] rounded-lg shadow-sm text-center">
          <p className="text-[1.1vw] text-gray-500 m-0">
            {searchCompany ||
            selectedProduct ||
            selectedSize ||
            selectedSupplier
              ? "No entries found matching your filters."
              : "Create purchase entries to see them listed here."}
          </p>
        </div>
      ) : (
        <div className="max-h-[50vh] overflow-y-auto">
          {Object.keys(groupedEntries)
            .sort()
            .map((product) => {
              const sizeMap = groupedEntries[product];
              const isProductExpanded = expandedProducts[product];

              return (
                <div
                  key={product}
                  className="mb-[1.5vw] rounded-lg overflow-hidden bg-white shadow-sm border border-gray-300"
                >
                  {/* Product Header */}
                  <div
                    onClick={() => toggleProduct(product)}
                    className="px-[1vw] py-[0.5vw] bg-[#3d64bb] text-white text-[1.15vw] font-semibold cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div className="flex items-center gap-[0.1vw]">
                      <div class="w-[2.6vw] h-[2.6vw] bg-[#3d64bb] rounded-[0.5vw] flex items-center justify-center"><svg class="w-[1.5vw] h-[1.5vw] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>
                      <span>{product}</span>
                      <span className="bg-white/20 px-[0.8vw] py-[0.3vw] rounded text-[0.85vw] font-medium ml-[.5vw]">
                        {Object.keys(sizeMap).length} Size
                        {Object.keys(sizeMap).length > 1 ? "s" : ""}
                      </span>
                    </div>
                    {isProductExpanded ? (
                      <ChevronUpIcon className="w-[1.3vw] h-[1.3vw]" />
                    ) : (
                      <ChevronDownIcon className="w-[1.3vw] h-[1.3vw]" />
                    )}
                  </div>

                  {/* Size Groups */}
                  {isProductExpanded && (
                    <div className="p-[0.5vw]">
                      {Object.keys(sizeMap)
                        .sort()
                        .map((size) => {
                          const entries = sizeMap[size];
                          const sizeKey = `${product}-${size}`;
                          const isSizeExpanded = expandedSizes[sizeKey];

                          return (
                            <div
                              key={sizeKey}
                              className="mb-[0.8vw] mx-[.5vw] my-[.25vw] border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                            >
                              {/* Size Header */}
                              <div
                                onClick={() => toggleSize(product, size)}
                                className="px-[1.2vw] py-[0.8vw] bg-gray-200 text-gray-900 text-[1vw] font-medium cursor-pointer flex justify-between items-center border border-gray-300 hover:bg-gray-200 transition-colors"
                              >
                                <div className="flex items-center gap-[0.6vw]">
                                  <div class="w-[2.2vw] h-[2.2vw] bg-[#333333] rounded-[0.45vw] flex items-center justify-center"><svg class="w-[1vw] h-[1vw] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg></div>
                                  
                                  <span>{size}</span>
                                  <span className="bg-white text-gray-900 px-[0.7vw] py-[0.25vw] rounded text-[0.8vw] font-medium">
                                    {entries.length} Order
                                    {entries.length > 1 ? "s" : ""}
                                  </span>
                                </div>
                                {isSizeExpanded ? (
                                  <ChevronUpIcon className="w-[1.1vw] h-[1.1vw] text-gray-600" />
                                ) : (
                                  <ChevronDownIcon className="w-[1.1vw] h-[1.1vw] text-gray-600" />
                                )}
                              </div>

                              {/* Entries Table */}
                              {isSizeExpanded && (
                                <div className="p-0">
                                  <table className="w-full border-collapse text-[0.85vw]">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="px-[0.9vw] py-[0.9vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          S. No.
                                        </th>
                                        <th className="px-[0.9vw] py-[0.9vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Last Update Date
                                        </th>
                                        <th className="px-[0.9vw] py-[0.9vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Company Name
                                        </th>
                                        <th className="px-[0.9vw] py-[0.9vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Contact Name
                                        </th>
                                        <th className="px-[0.9vw] py-[0.9vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Quantity
                                        </th>
                                        {activeSheet === "tracking" && (
                                          <th className="px-[0.9vw] py-[0.9vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                            Supplier Name
                                          </th>
                                        )}
                                        <th className="px-[0.9vw] py-[0.9vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Comments
                                        </th>
                                        <th className="px-[0.9vw] py-[0.9vw] text-center border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {entries.map((entry, idx) => (
                                        <tr
                                          key={entry.id}
                                          className="bg-white hover:bg-gray-50 transition-colors"
                                        >
                                          <td className="px-[0.9vw] py-[0.9vw] border-b border-gray-100 text-gray-900">
                                            {idx + 1}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.9vw] border-b border-gray-100 text-gray-900">
                                            {entry.date}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.9vw] border-b border-gray-100 text-gray-900 font-medium">
                                            {entry.company}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.9vw] border-b border-gray-100 text-gray-900">
                                            {entry.contact}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.9vw] border-b border-gray-100 text-gray-900 font-medium">
                                            {entry.qty}
                                          </td>
                                          {activeSheet === "tracking" && (
                                            <td className="px-[0.9vw] py-[0.9vw] border-b border-gray-100 text-gray-900">
                                              {entry.supplier || "-"}
                                            </td>
                                          )}
                                          <td className="px-[0.9vw] py-[0.9vw] border-b border-gray-100 text-gray-900">
                                            {entry.comments || "-"}
                                          </td>
                                          <td className="px-[0.9vw] py-[0.9vw] text-center border-b border-gray-100">
                                            <button
                                              onClick={() =>
                                                openDetails(entry, activeSheet)
                                              }
                                              className="px-[1.2vw] py-[0.45vw] text-[0.8vw] border border-blue-600 text-blue-600 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                                            >
                                              View
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

export default PurchaseManagement;
