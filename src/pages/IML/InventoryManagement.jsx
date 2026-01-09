// InventoryManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY_INVENTORY = "iml_inventory_entries";

// Dummy data (can be removed when you wire from real source)
const dummyInventoryEntries = [
  {
    id: 1,
    date: "15/12/2025",
    company: "Terra Tech Packs",
    imlName: "Parrot",
    product: "Round",
    size: "250ml",
    qty: "26,500",
    comments: "Ready for dispatch",
  },
  {
    id: 2,
    date: "15/12/2025",
    company: "ABC Industries",
    imlName: "Moon",
    product: "Rectangle",
    size: "500ml",
    qty: "15,000",
    comments: "Hold for QC",
  },
  {
    id: 3,
    date: "14/12/2025",
    company: "Terra Tech Packs",
    imlName: "Sun",
    product: "Sweet Box",
    size: "250gms",
    qty: "10,000",
    comments: "Festival stock",
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

const InventoryManagement = () => {
  const navigate = useNavigate();

  const [inventoryEntries, setInventoryEntries] = useState([]);
  const [searchCompany, setSearchCompany] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});

  // Initialize data from localStorage or dummy
  useEffect(() => {
    
    setInventoryEntries(dummyInventoryEntries);

  }, []);

  // Expand all products and first size by default
  useEffect(() => {
    if (inventoryEntries.length === 0) return;

    const newExpandedProducts = {};
    const newExpandedSizes = {};
    const productGroups = {};

    inventoryEntries.forEach((entry) => {
      const product = entry.product || "Uncategorized";
      if (!productGroups[product]) {
        productGroups[product] = new Set();
      }
      productGroups[product].add(entry.size || "No Size");
    });

    Object.keys(productGroups).forEach((product) => {
      newExpandedProducts[product] = true;
      const sizes = Array.from(productGroups[product]).sort();
      if (sizes.length > 0) {
        const firstSize = sizes[0];
        newExpandedSizes[`${product}-${firstSize}`] = true;
      }
    });

    setExpandedProducts(newExpandedProducts);
    setExpandedSizes(newExpandedSizes);
  }, [inventoryEntries]);

  // Persist entries if changed (and not dummy from elsewhere)
  useEffect(() => {
    if (inventoryEntries.length === 0) return;
    localStorage.setItem(
      STORAGE_KEY_INVENTORY,
      JSON.stringify(inventoryEntries)
    );
  }, [inventoryEntries]);

  const openDetails = (entry) => {
    navigate("/iml/inventory-details", {
      state: { entry },
    });
  };

  // Unique filters
  const uniqueProducts = useMemo(() => {
    const set = new Set();
    inventoryEntries.forEach((e) => set.add(e.product || "Uncategorized"));
    return Array.from(set).sort();
  }, [inventoryEntries]);

  const uniqueSizes = useMemo(() => {
    const set = new Set();
    inventoryEntries.forEach((e) => {
      if (!selectedProduct || e.product === selectedProduct) {
        set.add(e.size || "No Size");
      }
    });
    return Array.from(set).sort();
  }, [inventoryEntries, selectedProduct]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    const companyTerm = searchCompany.trim().toLowerCase();

    return inventoryEntries.filter((entry) => {
      const matchesCompany =
        !companyTerm ||
        ((entry.company || "").toLowerCase().includes(companyTerm)) || ((entry.imlName || "").toLowerCase().includes(companyTerm));
      const matchesProduct =
        !selectedProduct || entry.product === selectedProduct;
      const matchesSize = !selectedSize || entry.size === selectedSize;

      return matchesCompany && matchesProduct && matchesSize;
    });
  }, [inventoryEntries, searchCompany, selectedProduct, selectedSize]);

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

  
   // Auto-expand products & sizes when filters/search are applied
  useEffect(() => {
    const hasFilter =
      searchCompany.trim() ||
      selectedProduct ||
      selectedSize;
        
    if (!hasFilter) return;
  
    const newExpandedProducts = {};
    const newExpandedSizes = {};
  
    Object.entries(groupedEntries).forEach(([product, sizeMap]) => {
      newExpandedProducts[product] = true;
  
      Object.keys(sizeMap).forEach((size) => {
        const sizeKey = `${product}-${size}`;
        newExpandedSizes[sizeKey] = true;
      });
    });
  
    setExpandedProducts(newExpandedProducts);
    setExpandedSizes(newExpandedSizes);
  }, [
    searchCompany,
    selectedProduct,
    selectedSize,
    groupedEntries,
  ]);

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

  const clearFilters = () => {
    setSearchCompany("");
    setSelectedProduct("");
    setSelectedSize("");
  };

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] text-gray-800 font-bold m-0">
          Inventory Management
        </h1>
        <span className="text-[.8vw] text-gray-600">
          Final quantity for Billing & Dispatch
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-[1.2vw] mb-[1.25vw] flex-wrap bg-white px-[1vw] py-[1vw] rounded-lg shadow-sm border border-gray-200">
        {/* Search by company */}
        <div className="flex-1 min-w-[15vw]">
          <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
            Search Inventory
          </label>
          <input
            type="text"
            placeholder="Enter Company name, IML Name.."
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
            className="w-full px-[0.65vw] py-[0.5vw] text-[0.9vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
          />
        </div>

        {/* Filter by product */}
        <div className="flex-1 min-w-[12vw]">
          <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
            Filter by Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedSize("");
            }}
            className="w-full px-[0.65vw] py-[0.5vw] text-[0.9vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
          >
            <option value="">All Products</option>
            {uniqueProducts.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by size */}
        <div className="flex-1 min-w-[12vw]">
          <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
            Filter by Size
          </label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full px-[0.65vw] py-[0.5vw] text-[0.9vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
          >
            <option value="">All Sizes</option>
            {uniqueSizes.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters */}
        <div className="flex-none self-end">
          <button
            onClick={clearFilters}
            className="px-[1vw] py-[0.55vw] text-[0.9vw] bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Grouped Entries */}
      {!hasEntries ? (
        <div className="bg-white p-[3vw] rounded-lg shadow-sm text-center">
          <p className="text-[1.1vw] text-gray-500 m-0">
            No inventory entries found. Once inventory is counted, entries will
            appear here.
          </p>
        </div>
      ) : (
        <div className="max-h-[57vh] overflow-y-auto">
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
                  {/* Product header */}
                  <div
                    onClick={() => toggleProduct(product)}
                    className="px-[.85vw] py-[0.35vw] bg-[#3d64bb] text-white text-[1.15vw] font-semibold cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div className="flex items-center gap-[0.3vw]">
                      <div className="w-[2.6vw] h-[2.6vw] flex items-center justify-center">
                        <svg
                          className="w-[1.5vw] h-[1.5vw] text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="text-[0.9vw]">{product}</span>
                      <span className="bg-white/20 px-[0.8vw] py-[0.2vw] rounded text-[0.8vw] font-medium ml-[0.15vw]">
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

                  {/* Size groups */}
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
                              className="mb-[0.8vw] mx-[0.75vw] my-[0.25vw] border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                            >
                              {/* Size header */}
                              <div
                                onClick={() => toggleSize(product, size)}
                                className="px-[.95vw] py-[0.45vw] bg-gray-200 text-gray-900 text-[1vw] font-medium cursor-pointer flex justify-between items-center border border-gray-300 hover:bg-gray-200 transition-colors"
                              >
                                <div className="flex items-center gap-[0.6vw] text-[0.95vw]">
                                  <div className="w-[2.2vw] h-[2.2vw] bg-[#333333] rounded-[0.45vw] flex items-center justify-center">
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
                                  <span className="bg-white text-gray-900 px-[0.7vw] py-[0.25vw] rounded text-[0.75vw] font-medium">
                                    {entries.length} Entry
                                    {entries.length > 1 ? "ies" : ""}
                                  </span>
                                </div>
                                {isSizeExpanded ? (
                                  <ChevronUpIcon className="w-[1.1vw] h-[1.1vw] text-gray-600" />
                                ) : (
                                  <ChevronDownIcon className="w-[1.1vw] h-[1.1vw] text-gray-600" />
                                )}
                              </div>

                              {/* Entries table */}
                              {isSizeExpanded && (
                                <div className="p-[0.25vw]">
                                  <table className="w-full border-collapse text-[0.85vw]">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="px-[0.8vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          S. No.
                                        </th>
                                        <th className="px-[0.8vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Date
                                        </th>
                                        <th className="px-[0.8vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Company
                                        </th>
                                        <th className="px-[0.8vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          IML Name
                                        </th>
                                        <th className="px-[0.8vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Quantity
                                        </th>
                                        <th className="px-[0.8vw] py-[0.6vw] text-left border-b border-gray-200 text-gray-700 font-semibold">
                                          Comments
                                        </th>
                                        <th className="px-[0.8vw] py-[0.6vw] text-center border-b border-gray-200 text-gray-700 font-semibold">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {entries.map((entry, idx) => (
                                        <tr
                                          key={entry.id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-[0.8vw] py-[0.6vw] border-b border-gray-100 text-gray-900">
                                            {idx + 1}
                                          </td>
                                          <td className="px-[0.8vw] py-[0.6vw] border-b border-gray-100 text-gray-900">
                                            {entry.date || "-"}
                                          </td>
                                          <td className="px-[0.8vw] py-[0.6vw] border-b border-gray-100 text-gray-900">
                                            {entry.company || "-"}
                                          </td>
                                          <td className="px-[0.8vw] py-[0.6vw] border-b border-gray-100 text-gray-900">
                                            {entry.imlName || "-"}
                                          </td>
                                          <td className="px-[0.8vw] py-[0.6vw] border-b border-gray-100 text-gray-900 font-medium">
                                            {entry.qty || "-"}
                                          </td>
                                          <td className="px-[0.8vw] py-[0.6vw] border-b border-gray-100 text-gray-900">
                                            {entry.comments || "-"}
                                          </td>
                                          <td className="px-[0.8vw] py-[0.6vw] border-b border-gray-100 text-center">
                                            <button
                                              onClick={() => openDetails(entry)}
                                              className="px-[1.2vw] py-[0.45vw] text-[0.8vw] border border-blue-600 text-blue-600 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                                            >
                                              Verify & Send
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

export default InventoryManagement;
