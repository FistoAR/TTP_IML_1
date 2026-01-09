// PurchaseManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const STORAGE_KEY_PURCHASE = "iml_purchase_entries";
const STORAGE_KEY_ORDERS = "iml_orders";
const STORAGE_KEY_TRACKING = "iml_tracking_followups"; // NEW
const STORAGE_KEY_LABEL = "iml_label_followups"; // NEW - for label sheet
const STORAGE_KEY_METADATA = "iml_purchase_metadata"; // NEW

const dummyPurchaseEntries = [
  {
    id: 1,
    date: "2025-12-20",
    company: "Terra Tech Packs",
    imlName: "Bakery",
    contact: "John Doe",
    product: "Round",
    size: "250ml",
    qty: "26,500",
    supplier: "Global Suppliers Inc.",
    comments: "Urgent delivery",
  },
  {
    id: 2,
    date: "2025-12-22",
    company: "ABC Industries",
    imlName: "Sweets",
    contact: "Emily Smith",
    product: "Rectangle",
    size: "500ml",
    qty: "15,000",
    supplier: "Prime Materials Ltd.",
    comments: "Standard order",
  },
  {
    id: 3,
    date: "2025-12-24",
    company: "Terra Tech Packs",
    imlName: "Biryani",
    contact: "John Doe",
    product: "Sweet Box",
    size: "250gms",
    qty: "10,000",
    supplier: "Quality Distributors",
    comments: "Festival special",
  },
  {
    id: 4,
    date: "2025-12-26",
    company: "XYZ Corp",
    imlName: "Halwa",
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

const convertOrdersToPurchaseEntries = (orders) => {
  const entries = [];

  orders.forEach((order) => {
    if (order.products && order.products.length > 0) {
      order.products.forEach((product) => {
        if (product.moveToPurchase === true) {
          const entry = {
            id: `order-${order.id}-prod-${product.id}`,
            orderId: order.id,
            productId: product.id,
            date: new Date(order.createdAt).toLocaleDateString("en-GB"),
            company: order.contact.company,
            imlName: "",
            contact: order.contact.contactName,
            product: product.productName,
            size: product.size,
            qty:
              product.imlType === "LID"
                ? product.lidLabelQty
                : product.tubLabelQty,
            supplier: "",
            comments: "",
            labelType: "",
            lidColor: product.lidColor,
            tubColor: product.tubColor,
          };
          entries.push(entry);
        }
      });
    }
  });

  return entries;
};

// Helper function to get latest followup data based on sheet type
const getLatestFollowupData = (entryId, sheetType) => {
  const storageKey =
    sheetType === "tracking" ? STORAGE_KEY_TRACKING : STORAGE_KEY_LABEL; // Use label key for label sheet

  const storedData = localStorage.getItem(storageKey);
  const allData = storedData ? JSON.parse(storedData) : {};
  const followups = allData[entryId] || [];

  if (followups.length === 0) {
    return { date: null, comment: null };
  }

  // Get the last followup entry
  const latestFollowup = followups[followups.length - 1];
  return {
    date: latestFollowup.date || null,
    comment: latestFollowup.comment || null,
  };
};

// Helper function to get metadata (supplier, labelType)
const getMetadata = (entryId) => {
  const storedMetadata = localStorage.getItem(STORAGE_KEY_METADATA);
  const allMetadata = storedMetadata ? JSON.parse(storedMetadata) : {};
  return allMetadata[entryId] || { supplier: "", labelType: "" };
};

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
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false); // NEW
  const [filteredSuppliers, setFilteredSuppliers] = useState([]); // NEW
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const location = useLocation();

  // Add this useEffect to restore active sheet when returning from details
  useEffect(() => {
    if (location.state?.returnedFromSheet) {
      const sheetType = location.state.returnedFromSheet;
      setActiveSheet(sheetType); // Will be either "tracking" or "label"

      // Optional: Clear the state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Initialize dummy data only when no data in localStorage
  const initializeDummyDataPurchase = () => {
    setPurchaseEntries(dummyPurchaseEntries);
    localStorage.setItem(
      STORAGE_KEY_PURCHASE,
      JSON.stringify(dummyPurchaseEntries)
    );
  };

  const formatDate = (date) => {
    const split = date.split('-');
    return (`${split[2]}-${split[1]}-${split[0]}`)
  }

  useEffect(() => {
    console.log("=== PurchaseManagement Loading Data ===");

    initializeDummyDataPurchase();
    console.log("==== Dummy data initialised ======");
    
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

  useEffect(() => {
    if (purchaseEntries.length > 0) {
      const hasOrderDerivedEntries = purchaseEntries.some((e) => e.orderId);
      if (!hasOrderDerivedEntries) {
        localStorage.setItem(
          STORAGE_KEY_PURCHASE,
          JSON.stringify(purchaseEntries)
        );
      }
    }
  }, [purchaseEntries]);

  // Close supplier suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const supplierInput = event.target.closest(".relative");
      if (!supplierInput) {
        setShowSupplierSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDetails = (entry, mode) => {
    navigate("/iml/purchase-details", {
      state: {
        entry: {
          ...entry,
          quantity: entry.qty,
        },
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

  // Unique suppliers for supplier filter (including from metadata)
  const uniqueSuppliers = useMemo(() => {
    const set = new Set();

    // Get suppliers from entries
    purchaseEntries.forEach((e) => {
      if (e.supplier) {
        set.add(e.supplier);
      }

      // Also check metadata for this entry
      const metadata = getMetadata(e.id);
      if (metadata.supplier) {
        set.add(metadata.supplier);
      }
    });

    return Array.from(set)
      .filter((s) => s.trim() !== "")
      .sort();
  }, [purchaseEntries]);

  // Filter entries
  // Filter entries
  const filteredEntries = useMemo(() => {
    const companyTerm = searchCompany.trim().toLowerCase();
    return purchaseEntries.filter((entry) => {
      const matchesCompany =
        (!companyTerm || entry.company.toLowerCase().includes(companyTerm)) || (!companyTerm || entry.imlName.toLowerCase().includes(companyTerm));
      const matchesProduct =
        !selectedProduct || entry.product === selectedProduct;
      const matchesSize = !selectedSize || entry.size === selectedSize;

      // Check supplier from both entry and metadata
      const metadata = getMetadata(entry.id);
      const entrySupplier = (
        metadata.supplier ||
        entry.supplier ||
        ""
      ).toLowerCase();

       // Date filter based on last update date
    let matchesDate = true;
     if (startDate || endDate) {
      // Parse the entry date (YYYY-MM-DD format)
      const entryDate = new Date(entry.date);
      
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
    }
    

      const matchesSupplier =
        !selectedSupplier ||
        entrySupplier.includes(selectedSupplier.toLowerCase());

        
      // return matchesCompany && matchesProduct && matchesSize && matchesSupplier;
      return matchesCompany && matchesProduct && matchesSize && matchesSupplier && matchesDate;

    });
  }, [
    purchaseEntries,
    searchCompany,
    selectedProduct,
    selectedSize,
    selectedSupplier,
    startDate,
    endDate,
    activeSheet,
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

  // Handle supplier input change
  const handleSupplierInputChange = (value) => {
    setSelectedSupplier(value);

    if (value.trim() === "") {
      setFilteredSuppliers([]);
      setShowSupplierSuggestions(false);
      return;
    }

    // Filter suppliers based on input
    const filtered = uniqueSuppliers.filter((supplier) =>
      supplier.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredSuppliers(filtered);
    setShowSupplierSuggestions(filtered.length > 0);
  };

  // Handle supplier selection from suggestions
  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierSuggestions(false);
    setFilteredSuppliers([]);
  };

  // Auto-expand categories and sizes when filters are applied
  useEffect(() => {
    if (searchCompany || selectedProduct || selectedSize || selectedSupplier) {
      const newExpandedProducts = {};
      const newExpandedSizes = {};

      // Expand all products and sizes that have filtered results
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
  }, [
    searchCompany,
    selectedProduct,
    selectedSize,
    selectedSupplier,
    groupedEntries,
  ]);

  return (
    <div className="p-[1vw] font-sans bg-gray-50 min-h-screen">
      {/* Header Section */}

      <div className="flex justify-between items-center mb-[1vw]">
        <h1 className="text-[1.6vw] text-gray-800 font-bold m-0">
          Purchase Management{" "}
          <span className="text-[1.35vw]">
            ({activeSheet === "tracking" ? "Tracking Sheet" : "Label Quantity"})
          </span>
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
<div className="bg-white px-[1.5vw] py-[1.2vw] rounded-lg shadow-sm border border-gray-200 mb-[1.25vw]">
  <div className="flex gap-[1vw] items-end">
    {/* Search by company */}
    <div className="flex-1 min-w-[12vw]">
      <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
        Search Purchases
      </label>
      <input
        type="text"
        placeholder="Company name, IML name or contact..."
        value={searchCompany}
        onChange={(e) => setSearchCompany(e.target.value)}
        className="w-full px-[0.7vw] py-[0.7vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
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
        className="w-full px-[0.7vw] py-[0.7vw] text-[0.8vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
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
        className="w-full px-[0.7vw] py-[0.7vw] text-[0.8vw] border border-gray-300 rounded-md outline-none bg-white cursor-pointer"
      >
        <option value="">All Sizes</option>
        {uniqueSizes.map((sz) => (
          <option key={sz} value={sz}>
            {sz}
          </option>
        ))}
      </select>
    </div>

    {/* Filter by Supplier (only for Tracking Sheet) - Autocomplete */}
    {activeSheet === "tracking" && (
      <div className="flex-1 min-w-[10vw] relative">
        <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
          Filter by Supplier
        </label>
        <input
          type="text"
          placeholder="Search supplier..."
          value={selectedSupplier}
          onChange={(e) => handleSupplierInputChange(e.target.value)}
          onFocus={() => {
            if (
              selectedSupplier.trim() !== "" &&
              filteredSuppliers.length > 0
            ) {
              setShowSupplierSuggestions(true);
            }
          }}
          className="w-full px-[0.7vw] py-[0.7vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
        />

        {/* Supplier Suggestions Dropdown */}
        {showSupplierSuggestions && filteredSuppliers.length > 0 && (
          <div className="absolute z-10 w-full mt-[0.3vw] bg-white border border-gray-300 rounded-md shadow-lg max-h-[15vw] overflow-y-auto">
            {filteredSuppliers.map((supplier, index) => (
              <div
                key={index}
                onClick={() => handleSupplierSelect(supplier)}
                className="px-[0.7vw] py-[0.6vw] text-[0.8vw] cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {supplier}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Start Date */}
    <div className="flex-none w-[10vw]">
      <label className="block mb-[0.5vw] text-[0.85vw] font-medium text-gray-700">
        Start Date
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full px-[0.7vw] py-[0.7vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
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
        className="w-full px-[0.7vw] py-[0.7vw] text-[0.8vw] border border-gray-300 rounded-md outline-none focus:border-indigo-600 transition-colors"
      />
    </div>

    {/* Clear Filters Button */}
    <div className="flex-none">
      <button
        onClick={() => {
          setSearchCompany("");
          setSelectedProduct("");
          setSelectedSize("");
          setSelectedSupplier("");
          setShowSupplierSuggestions(false);
          setFilteredSuppliers([]);
          setStartDate("");
          setEndDate("");
        }}
        className="px-[1.2vw] py-[0.7vw] text-[0.8vw] bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
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
            {searchCompany ||
            selectedProduct ||
            selectedSize ||
            selectedSupplier
              ? "No entries found matching your filters."
              : "Create purchase entries to see them listed here."}
          </p>
        </div>
      ) : (
        <div className="max-h-[55vh] overflow-y-auto">
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
                      <div className="w-[2.6vw] h-[2.6vw] bg-[#3d64bb] rounded-[0.5vw] flex items-center justify-center ">
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
                                className="px-[.95vw] py-[0.5vw] bg-gray-200 text-gray-900 text-[1vw] font-medium cursor-pointer flex justify-between items-center border border-gray-300 hover:bg-gray-200 transition-colors"
                              >
                                <div className="flex items-center gap-[0.6vw] text-[0.95vw]">
                                  <div className="w-[2.2vw] h-[2.2vw] bg-[#333333] rounded-[0.45vw] flex items-center justify-center ">
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
                                      <tr className="bg-gray-100">
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
                                          IML Name
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
                                      {entries.map((entry, idx) => {
                                        // Calculate followup data and metadata for each entry
                                        const followupData =
                                          getLatestFollowupData(
                                            entry.id,
                                            activeSheet
                                          ); // Pass activeSheet
                                        const metadata = getMetadata(entry.id);

                                        // Use latest followup date if available, otherwise use entry date
                                        const displayDate =
                                          followupData.date ||
                                          "-";
                                        const displayComment =
                                          followupData.comment ||
                                          entry.comments ||
                                          "-";
                                        const displaySupplier =
                                          metadata.supplier ||
                                          entry.supplier ||
                                          "-";

                                        return (
                                          <tr
                                            key={entry.id}
                                            className="bg-white"
                                          >
                                            <td className="px-4 py-3 whitespace-nowrap text-[.85vw] text-gray-900">
                                              {idx + 1}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-[.85vw] text-gray-900">
                                              {formatDate(entry.date)}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.9vw] text-[.85vw] border-b border-gray-100 text-gray-900 font-medium">
                                              {entry.company}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.9vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                              {entry.contact}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.9vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                              {entry.imlName}
                                            </td>

                                            <td className="px-[0.9vw] py-[0.9vw] text-[.85vw] border-b border-gray-100 text-gray-900 font-medium">
                                              {entry.qty}
                                            </td>

                                            {activeSheet === "tracking" && (
                                              <td className="px-[0.9vw] py-[0.9vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                                {displaySupplier}
                                              </td>
                                            )}

                                            <td className="px-[0.9vw] py-[0.9vw] text-[.85vw] border-b border-gray-100 text-gray-900">
                                              {displayComment}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                              <button
                                                onClick={() =>
                                                  openDetails(
                                                    entry,
                                                    activeSheet
                                                  )
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

export default PurchaseManagement;
