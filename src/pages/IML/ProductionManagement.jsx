// ProductionManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY_PRODUCTION = "iml_production_entries";

const dummyProductionEntries = [
  {
    id: 1,
    date: "2025-12-15",
    company: "Murugan Industries",
    imlName: "Halwa",
    product: "Round",
    size: "750 ML Round",
    noOfLabels: "50,000",
    machineNumber: "02",
    receivedBy: "Murali",
    containerColor: "Blue",
  },
  {
    id: 2,
    date: "2025-12-18",
    company: "ABC Corp",
    imlName: "Crackers",
    product: "Rectangle",
    size: "500ml",
    noOfLabels: "30,000",
    machineNumber: "01",
    receivedBy: "Praveen",
    containerColor: "Red",
  },
  {
    id: 3,
    date: "2025-12-22",
    company: "Murugan Industries",
    product: "Sweet Box",
    imlName: "Bread",
    size: "250gms",
    noOfLabels: "25,000",
    machineNumber: "03",
    receivedBy: "Murali",
    containerColor: "Green",
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

// Helper function to get latest production data
const getLatestProductionData = (entryId) => {
  const STORAGE_KEY_PRODUCTION_ENTRIES = "iml_production_followups";
  const storedData = localStorage.getItem(STORAGE_KEY_PRODUCTION_ENTRIES);
  const allData = storedData ? JSON.parse(storedData) : {};
  const entries = allData[entryId] || [];

  if (entries.length === 0) {
    return { date: null };
  }

  const latestEntry = entries[entries.length - 1];
  return {
    date: latestEntry.date || null,
  };
};

// Helper: parse number safely
const toNumber = (value) => {
  if (!value && value !== 0) return 0;
  return Number(String(value).replace(/,/g, "")) || 0;
};

// Helper: compute remaining labels from followups
const getRemainingLabels = (entry) => {
  const STORAGE_KEY_PRODUCTION_ENTRIES = "iml_production_followups";
  const storedData = localStorage.getItem(STORAGE_KEY_PRODUCTION_ENTRIES);
  const allData = storedData ? JSON.parse(storedData) : {};
  const followups = allData[entry.id] || [];

  const totalLabels = toNumber(entry.noOfLabels);

  const usedLabels = followups.reduce((sum, f) => {
    const accepted = toNumber(f.acceptedComponents);
    const rejected = toNumber(f.rejectedComponents);
    const wastage = toNumber(f.labelWastage);
    return sum + accepted + rejected + wastage;
  }, 0);

  const remaining = totalLabels - usedLabels;
  return remaining > 0 ? remaining : 0;
};


const ProductionManagement = () => {
  const navigate = useNavigate();
  const [productionEntries, setProductionEntries] = useState([]);
  const [searchCompany, setSearchCompany] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Initialize dummy data
  const initializeDummyDataProduction = () => {
    setProductionEntries(dummyProductionEntries);
    localStorage.setItem(
      STORAGE_KEY_PRODUCTION,
      JSON.stringify(dummyProductionEntries)
    );
  };

  useEffect(() => {
    // const stored = localStorage.getItem(STORAGE_KEY_PRODUCTION);
    // if (stored) {
    //   const parsed = JSON.parse(stored);
    //   if (Array.isArray(parsed) && parsed.length > 0) {
    //     setProductionEntries(parsed);
    //   } else {
    //     initializeDummyDataProduction();
    //   }
    // } else {
    // }
    initializeDummyDataProduction();
  }, []);

  // Initialize all product categories as expanded
  useEffect(() => {
    if (productionEntries.length > 0) {
      const newExpandedProducts = {};
      const newExpandedSizes = {};

      const productGroups = {};
      productionEntries.forEach((entry) => {
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
    }
  }, [productionEntries]);

  const openDetails = (entry) => {
    navigate("/iml/production-details", {
      state: {
        entry,
      },
    });
  };

  const formatDate = (dateV) => {
    const split = dateV.split('-');
    return (`${split[2]}-${split[1]}-${split[0]}`);
  }

  // Unique products for category filter
  const uniqueProducts = useMemo(() => {
    const set = new Set();
    productionEntries.forEach((e) => set.add(e.product));
    return Array.from(set).sort();
  }, [productionEntries]);

  // Unique sizes for size filter
  const uniqueSizes = useMemo(() => {
    const set = new Set();
    productionEntries.forEach((e) => {
      if (!selectedProduct || e.product === selectedProduct) {
        set.add(e.size);
      }
    });
    return Array.from(set).sort();
  }, [productionEntries, selectedProduct]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    const companyTerm = searchCompany.trim().toLowerCase();
    return productionEntries.filter((entry) => {
      const matchesCompany =
        (!companyTerm || entry.company.toLowerCase().includes(companyTerm)) || (!companyTerm || entry.imlName.toLowerCase().includes(companyTerm)) ;
      const matchesProduct =
        !selectedProduct || entry.product === selectedProduct;
      const matchesSize = !selectedSize || entry.size === selectedSize;

      // Date filter based on last update date
      let matchesDate = true;
      if (startDate || endDate) {
        const latestData = getLatestProductionData(entry.id);
        if (latestData.date) {
          const [day, month, year] = latestData.date.split("/");
          const entryDate = new Date(year, month - 1, day);

          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            matchesDate = matchesDate && entryDate >= start;
          }

          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && entryDate <= end;
          }
        } else {
          matchesDate = false;
        }
      }

      return matchesCompany && matchesProduct && matchesSize && matchesDate;
    });
  }, [
    productionEntries,
    searchCompany,
    selectedProduct,
    selectedSize,
    startDate,
    endDate,
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

  // Auto-expand categories when filters applied
  useEffect(() => {
    if (searchCompany || selectedProduct || selectedSize) {
      const newExpandedProducts = {};
      const newExpandedSizes = {};

      Object.entries(groupedEntries).forEach(([product, sizes]) => {
        newExpandedProducts[product] = true;

        Object.keys(sizes).forEach((size) => {
          const sizeKey = `${product}-${size}`;
          newExpandedSizes[sizeKey] = true;
        });
      });

      setExpandedProducts(newExpandedProducts);
      setExpandedSizes(newExpandedSizes);
    }
  }, [searchCompany, selectedProduct, selectedSize, groupedEntries]);

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-[0.5vw]">
        <h1 className="text-[1.6vw] text-gray-800 font-bold m-0">
          Production Management
        </h1>
      </div>

      {/* Filters Section */}
      <div className="bg-white px-[1.25vw] py-[1.1vw] rounded-lg shadow-sm border border-gray-200 mb-[1.25vw]">
        <div className="flex gap-[1vw] items-end">
          {/* Search by company */}
          <div className="flex-1 min-w-[12vw]">
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Search Production
            </label>
            <input
              type="text"
              placeholder="Search by Company name, IML Name.."
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              className="w-full px-[0.7vw] py-[0.65vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
            />
          </div>

          {/* Filter by Product */}
          <div className="flex-1 min-w-[10vw]">
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Filter by Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setSelectedSize("");
              }}
              className="w-full px-[0.7vw] py-[0.65vw] text-[0.8vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
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
          <div className="flex-1 min-w-[8vw]">
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Filter by Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-[0.7vw] py-[0.65vw] text-[0.8vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
            >
              <option value="">All Sizes</option>
              {uniqueSizes.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="flex-none w-[10vw]">
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-[0.7vw] py-[0.65vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
            />
          </div>

          {/* End Date */}
          <div className="flex-none w-[10vw]">
            <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-[0.7vw] py-[0.65vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex-none">
            <button
              onClick={() => {
                setSearchCompany("");
                setSelectedProduct("");
                setSelectedSize("");
                setStartDate("");
                setEndDate("");
              }}
              className="px-[1.2vw] py-[0.65vw] text-[0.8vw] bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Entries */}
      {!hasEntries ? (
        <div className="bg-white p-[3vw] rounded-lg shadow-sm text-center">
          <p className="text-[1.1vw] text-gray-500 m-0">
            {searchCompany || selectedProduct || selectedSize
              ? "No entries found matching your filters."
              : "Create production entries to see them listed here."}
          </p>
        </div>
      ) : (
        <div className="max-h-[60.5vh] overflow-y-auto">
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
                    className="px-[.85vw] py-[0.35vw] bg-[#3d64bb] text-white text-[1.15vw] font-semibold cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div className="flex items-center gap-[0.1vw] text-[1vw]">
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
                            strokeWidth="2"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          ></path>
                        </svg>
                      </div>

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
                                className="px-[.95vw] py-[0.5vw] bg-gray-200 text-gray-900 font-medium cursor-pointer flex justify-between items-center border border-gray-300 hover:bg-gray-200 transition-colors"
                              >
                                <div className="flex items-center gap-[0.6vw] text-[0.95vw]">
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
                                        strokeWidth="2"
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      ></path>
                                    </svg>
                                  </div>

                                  <span>{size}</span>

                                  <span className="bg-white text-gray-900 px-[0.7vw] py-[0.25vw] rounded text-[0.8vw] font-medium">
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

                              {/* Entries Table */}
                              {isSizeExpanded && (
                                <div className="p-0">
                                  <table className="w-full border-collapse text-[0.85vw]">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="px-[0.9vw] py-[0.75vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          S. No.
                                        </th>
                                        <th className="px-[0.9vw] py-[0.75vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Last Update Date
                                        </th>
                                        <th className="px-[0.9vw] py-[0.75vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Company Name
                                        </th>
                                        <th className="px-[0.9vw] py-[0.75vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          IML Name
                                        </th>
                                        <th className="px-[0.9vw] py-[0.75vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          No. of Labels
                                        </th>
                                        <th className="px-[0.9vw] py-[0.75vw] text-left border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Remaining Labels
                                        </th>
                                        <th className="px-[0.9vw] py-[0.75vw] text-center border-b border-gray-200 text-gray-700 font-semibold text-[0.85vw]">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {entries.map((entry, idx) => {
                                        const latestData =
                                          getLatestProductionData(entry.id);
                                        const displayDate =
                                          latestData.date || "-";

                                        const remainingLabels = getRemainingLabels(entry);


                                        return (
                                          <tr
                                            key={entry.id}
                                            className="bg-white"
                                          >
                                            <td className="px-[0.9vw] py-[0.75vw] whitespace-nowrap text-[.85vw] text-gray-900">
                                              {idx + 1}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.75vw] whitespace-nowrap text-[.85vw] text-gray-900">
                                              {formatDate(entry.date)}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.75vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                              {entry.company}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.75vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                              {entry.imlName}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.75vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                              {entry.noOfLabels}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.75vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                              {remainingLabels.toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.75vw] whitespace-nowrap text-sm">
                                              <button
                                                onClick={() =>
                                                  openDetails(entry)
                                                }
                                                className="px-[1.2vw] py-[0.45vw] text-[0.8vw] border border-blue-600 text-blue-600 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer block mx-auto"
                                              >
                                                View
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
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

export default ProductionManagement;
