import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScreenPrintingJobWorkDetails from "./ScreenPrintingJobWorkDetails";

// Mock data storage
const STORAGE_KEY = "screen_printing_jobwork";

// Product size options for initial expansion
const PRODUCT_SIZE_OPTIONS = {
  Round: ["120ml", "250ml", "300ml", "500ml", "1000ml"],
  "Round Square": ["450ml", "500ml"],
  Rectangle: ["500ml", "650ml", "750ml"],
  "Sweet Box": ["250gms", "500gms"],
  "Sweet Box TE": ["TE 250gms", "TE 500gms"],
};

export default function ScreenPrintingJobWork() {
  console.log("ScreenPrintingJobWork component rendered");

  const [view, setView] = useState("dashboard");
  const [jobWorks, setJobWorks] = useState([]);
  const [editingJobWork, setEditingJobWork] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});

  const navigate = useNavigate();

  // Initialize with dummy data if no job works exist
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedJobWorks = JSON.parse(stored);
      setJobWorks(parsedJobWorks);

      if (parsedJobWorks.length === 0) {
        initializeDummyData();
      }
    } else {
      initializeDummyData();
    }
  }, []);

  // Initialize dummy data
  const initializeDummyData = () => {
    const dummyJobWorks = [
      {
        id: 1702456789001,
        contact: {
          company: "ABC Industries",
          contactName: "John Smith",
          phone: "9876543210",
          priority: "high",
        },
        products: [
          {
            id: 1,
            jobWorkNumber: "JW-1702456789001-123",
            productName: "Round",
            size: "500ml",
            printerName: "Printer A",
            qtySent: "10000",
            qtyReceived: "5000",
            status: "In Printing",
            remarks: "Urgent order",
          },
        ],
        status: "In Printing",
        createdAt: "2025-12-10T08:00:00.000Z",
      },
      {
        id: 1702456789002,
        contact: {
          company: "XYZ Corporation",
          contactName: "Jane Doe",
          phone: "9123456780",
          priority: "medium",
        },
        products: [
          {
            id: 1,
            jobWorkNumber: "JW-1702456789002-456",
            productName: "Sweet Box",
            size: "250gms",
            printerName: "Printer B",
            qtySent: "15000",
            qtyReceived: "0",
            status: "Pending",
            remarks: "",
          },
        ],
        status: "Pending",
        createdAt: "2025-12-11T09:30:00.000Z",
      },
    ];

    setJobWorks(dummyJobWorks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyJobWorks));
  };

  // Save job works to localStorage whenever they change
  useEffect(() => {
    if (jobWorks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobWorks));
    }
  }, [jobWorks]);

  // Initialize expanded categories
  useEffect(() => {
    if (jobWorks.length > 0) {
      const groupedJobWorks = groupJobWorksByProductAndSize();
      const newExpandedCategories = {};
      const newExpandedSizes = {};

      Object.entries(groupedJobWorks).forEach(([productName, sizes]) => {
        newExpandedCategories[productName] = true;

        const sizeKeys = Object.keys(sizes);
        if (sizeKeys.length > 0) {
          const firstSize = sizeKeys[0];
          newExpandedSizes[`${productName}-${firstSize}`] = true;
        }
      });

      setExpandedCategories(newExpandedCategories);
      setExpandedSizes(newExpandedSizes);
    }
  }, [jobWorks.length]);

  // Auto-expand categories and sizes when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const newExpandedCategories = {};
      const newExpandedSizes = {};
      const groupedJobWorks = groupJobWorksByProductAndSize();

      Object.entries(groupedJobWorks).forEach(([productName, sizes]) => {
        let hasMatch = false;

        Object.entries(sizes).forEach(([size, jobWorksList]) => {
          const hasCompanyMatch = jobWorksList.some(
            (jobWork) =>
              jobWork.contact.company
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              jobWork.contact.contactName
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
  }, [searchTerm, jobWorks]);

  // Handle create new job work
  const handleNewJobWork = () => {
    setEditingJobWork(null);
    setView("form");
  };

  // Handle edit job work
  const handleEditJobWork = (jobWork) => {
    setEditingJobWork(jobWork);
    setView("form");
  };

  // Handle delete job work
  const handleDeleteJobWork = (jobWorkId) => {
    if (window.confirm("Are you sure you want to delete this job work?")) {
      setJobWorks(jobWorks.filter((jobWork) => jobWork.id !== jobWorkId));
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(jobWorks.filter((jobWork) => jobWork.id !== jobWorkId))
      );
    }
  };

  // Handle form submission
  const handleJobWorkSubmit = (jobWorkData) => {
    if (editingJobWork) {
      const updatedJobWorks = jobWorks.map((jobWork) =>
        jobWork.id === editingJobWork.id
          ? { ...jobWorkData, id: editingJobWork.id }
          : jobWork
      );
      setJobWorks(updatedJobWorks);
    } else {
      const newJobWork = {
        ...jobWorkData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setJobWorks([...jobWorks, newJobWork]);
    }

    setView("dashboard");
    setEditingJobWork(null);
  };

  // Handle cancel from form
  const handleCancel = () => {
    setView("dashboard");
    setEditingJobWork(null);
  };

  // Handle back from form
  const handleBack = () => {
    setView("dashboard");
    setEditingJobWork(null);
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

  // Group job works by product category and size
  const groupJobWorksByProductAndSize = () => {
    const grouped = {};

    jobWorks.forEach((jobWork) => {
      if (jobWork.products && jobWork.products.length > 0) {
        jobWork.products.forEach((product) => {
          const productName = product.productName || "Uncategorized";
          const size = product.size || "No Size";

          if (!grouped[productName]) {
            grouped[productName] = {};
          }

          if (!grouped[productName][size]) {
            grouped[productName][size] = [];
          }

          grouped[productName][size].push(jobWork);
        });
      } else {
        if (!grouped["Uncategorized"]) {
          grouped["Uncategorized"] = {};
        }
        if (!grouped["Uncategorized"]["No Products"]) {
          grouped["Uncategorized"]["No Products"] = [];
        }
        grouped["Uncategorized"]["No Products"].push(jobWork);
      }
    });

    return grouped;
  };

  // Get unique product names
  const getUniqueProducts = () => {
    const products = new Set();
    jobWorks.forEach((jobWork) => {
      if (jobWork.products && jobWork.products.length > 0) {
        jobWork.products.forEach((product) => {
          products.add(product.productName || "Uncategorized");
        });
      }
    });
    return Array.from(products).sort();
  };

  // Get unique sizes for a specific product
  const getUniqueSizesForProduct = (productName) => {
    const sizes = new Set();
    jobWorks.forEach((jobWork) => {
      if (jobWork.products && jobWork.products.length > 0) {
        jobWork.products.forEach((product) => {
          if (product.productName === productName) {
            sizes.add(product.size || "No Size");
          }
        });
      }
    });
    return Array.from(sizes).sort();
  };

  // Filter job works based on search, status, product, and size
  const filterJobWorks = (jobWorksList) => {
    return jobWorksList.filter((jobWork) => {
      const matchesSearch =
        jobWork.contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobWork.contact.contactName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || jobWork.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  // Get filtered grouped job works
  const getFilteredGroupedJobWorks = () => {
    const allGrouped = groupJobWorksByProductAndSize();
    const filtered = {};

    Object.entries(allGrouped).forEach(([productName, sizes]) => {
      if (selectedProduct && productName !== selectedProduct) {
        return;
      }

      Object.entries(sizes).forEach(([size, jobWorksList]) => {
        if (selectedSize && size !== selectedSize) {
          return;
        }

        const filteredJobWorks = filterJobWorks(jobWorksList);
        if (filteredJobWorks.length > 0) {
          if (!filtered[productName]) {
            filtered[productName] = {};
          }
          filtered[productName][size] = filteredJobWorks;
        }
      });
    });

    return filtered;
  };

  const getJobWorkStatusForJobWork = (jobWork) => {
    if (!jobWork.products || jobWork.products.length === 0) return "Pending";

    const statuses = jobWork.products.map((p) => p.status || "Pending");

    if (statuses.includes("In Printing")) return "In Printing";
    if (statuses.includes("Completed")) return "Completed";
    return "Pending";
  };

  // Calculate statistics
  const stats = {
    total: jobWorks.length,
    pending: jobWorks.filter((j) => j.status === "Pending").length,
    inPrinting: jobWorks.filter((j) => j.status === "In Printing").length,
    completed: jobWorks.filter((j) => j.status === "Completed").length,
  };

  // Reset size filter when product changes
  useEffect(() => {
    setSelectedSize("");
  }, [selectedProduct]);

  if (view === "form") {
    return (
      <ScreenPrintingJobWorkDetails
        existingJobWork={editingJobWork}
        onSubmit={handleJobWorkSubmit}
        onCancel={handleCancel}
        onBack={handleBack}
      />
    );
  }

  const filteredGroupedJobWorks = getFilteredGroupedJobWorks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md mb-[1vw]" style={{ padding: "1vw" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontSize: "1.6vw" }}>
              Screen Printing Job Work
            </h1>
            <p className="text-gray-600 mt-1" style={{ fontSize: "0.9vw" }}>
              Manage all your job work records and printer information
            </p>
          </div>

          <button
            onClick={handleNewJobWork}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            style={{ fontSize: "0.9vw", padding: "0.6vw 1vw" }}
          >
            <span style={{ fontSize: "1.2vw" }}>+</span> New Job Work
          </button>
        </div>
      </div>

      <div className="p-[.75vw]">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-[1vw]" style={{ gap: "1vw" }}>
        <div className="bg-white rounded-lg shadow-md" style={{ padding: ".75vw 1.25vw" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600" style={{ fontSize: "0.85vw" }}>
                Total Job Works
              </p>
              <p className="font-bold text-blue-600 " style={{ fontSize: "2vw" }}>
                {stats.total}
              </p>
            </div>
            <div
              className="bg-blue-100 p-3 rounded-full"
              style={{ padding: "0.8vw" }}
            >
              <svg
                className="w-8 h-8 text-blue-600"
                style={{ width: "2vw", height: "2vw" }}
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
        </div>

        <div className="bg-white rounded-lg shadow-md" style={{ padding: ".75vw 1.25vw" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 " style={{ fontSize: "0.85vw" }}>
                Pending
              </p>
              <p className="font-bold text-orange-600" style={{ fontSize: "2vw" }}>
                {stats.pending}
              </p>
            </div>
            <div
              className="bg-orange-100 p-3 rounded-full"
              style={{ padding: "0.8vw" }}
            >
              <svg
                className="w-8 h-8 text-orange-600"
                style={{ width: "2vw", height: "2vw" }}
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
        </div>

        <div className="bg-white rounded-lg shadow-md" style={{ padding: ".75vw 1.25vw" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600" style={{ fontSize: "0.85vw" }}>
                In Printing
              </p>
              <p className="font-bold text-yellow-600" style={{ fontSize: "2vw" }}>
                {stats.inPrinting}
              </p>
            </div>
            <div
              className="bg-yellow-100 p-3 rounded-full"
              style={{ padding: "0.8vw" }}
            >
              <svg
                className="w-8 h-8 text-yellow-600"
                style={{ width: "2vw", height: "2vw" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md" style={{ padding: ".75vw 1.25vw" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600" style={{ fontSize: "0.85vw" }}>
                Completed
              </p>
              <p className="font-bold text-green-600" style={{ fontSize: "2vw" }}>
                {stats.completed}
              </p>
            </div>
            <div
              className="bg-green-100 p-3 rounded-full"
              style={{ padding: "0.8vw" }}
            >
              <svg
                className="w-8 h-8 text-green-600"
                style={{ width: "2vw", height: "2vw" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md mb-[1vw]" style={{ padding: "1vw" }}>
        <div className="grid grid-cols-4 gap-4" style={{ gap: "1vw" }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Search Company
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company or contact..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Printing">In Printing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
            >
              <option value="">All Products</option>
              {getUniqueProducts().map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
              disabled={!selectedProduct}
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

      {/* Job Works List */}
      <div className="bg-white rounded-lg shadow-md" style={{ padding: "1vw" }}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800" style={{ fontSize: "1.3vw" }}>
          Job Works by Product & Size
        </h2>

        {Object.keys(filteredGroupedJobWorks).length === 0 ? (
          <div className="text-center py-12">
            <div
              className="text-gray-400 mb-4"
              style={{ fontSize: "3vw" }}
            >
              📦
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2" style={{ fontSize: "1.2vw" }}>
              {searchTerm || filterStatus !== "all" || selectedProduct || selectedSize
                ? `No job works found matching your filters`
                : "Get started by creating your first job work"}
            </h3>
            {!searchTerm && filterStatus === "all" && !selectedProduct && !selectedSize && (
              <button
                onClick={handleNewJobWork}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                style={{ fontSize: "0.9vw", padding: "0.7vw 1.5vw" }}
              >
                Create Job Work
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-[.5vw] max-h-[30vh] overflow-y-auto">
            {Object.entries(filteredGroupedJobWorks).map(([productName, sizes]) => (
              <div
                key={productName}
                className="border border-gray-200 rounded-lg overflow-hidden"
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
                        {Object.values(sizes).reduce(
                        (total, jobWorks) => total + jobWorks.length,
                        0
                      )}{" "}
                      job works
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
                  <div className="bg-gray-50 m-[1vw]">
                    {Object.entries(sizes).map(([size, jobWorksList]) => (
                      <div key={`${productName}-${size}`} className="border-t border-gray-200">
                        {/* Size Header */}
                      

                        <button
                              onClick={() => toggleSize(productName, size)}
                              className="w-full px-[.75vw] py-[0.6vw] flex items-center justify-between bg-[#e7e7e7] border border-[0.05px] border-gray-400 transition-colors rounded-xl cursor-pointer"
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
                                  Size: {size}
                                </span>

                                <span className="bg-[#ffffff] text-[#333333] px-[0.6vw] py-[0.35vw] rounded-full text-[0.8vw] font-medium">
                                  {jobWorksList.length} job works
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

                        {/* Job Works Table */}
                        {expandedSizes[`${productName}-${size}`] && (
                          <div className="overflow-x-auto rounded rounded-lg">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th
                                    className="text-left p-3 text-sm font-semibold text-gray-700"
                                    style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                  >
                                    Company
                                  </th>
                                  <th
                                    className="text-left p-3 text-sm font-semibold text-gray-700"
                                    style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                  >
                                    Contact
                                  </th>
                                  <th
                                    className="text-left p-3 text-sm font-semibold text-gray-700"
                                    style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                  >
                                    Printer
                                  </th>
                                  <th
                                    className="text-left p-3 text-sm font-semibold text-gray-700"
                                    style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                  >
                                    Qty Sent / Received
                                  </th>
                                  <th
                                    className="text-left p-3 text-sm font-semibold text-gray-700"
                                    style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                  >
                                    Status
                                  </th>
                                  <th
                                    className="text-left p-3 text-sm font-semibold text-gray-700"
                                    style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                  >
                                    Created
                                  </th>
                                  <th
                                    className="text-left p-3 text-sm font-semibold text-gray-700"
                                    style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {jobWorksList.map((jobWork) => {
                                  const product = jobWork.products?.[0] || {};

                                  return (
                                    <tr
                                      key={jobWork.id}
                                      className="border-b bg-white border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                      <td
                                        className="p-3"
                                        style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                      >
                                        <div className="font-medium text-gray-800">
                                          {jobWork.contact.company}
                                        </div>
                                      </td>
                                      <td
                                        className="p-3"
                                        style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                      >
                                        <div className="text-gray-700">
                                          {jobWork.contact.contactName}
                                        </div>
                                        <div className="text-sm text-gray-500" style={{ fontSize: "0.75vw" }}>
                                          {jobWork.contact.phone}
                                        </div>
                                      </td>
                                      <td
                                        className="p-3"
                                        style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                      >
                                        {product.printerName || "-"}
                                      </td>
                                      <td
                                        className="p-3"
                                        style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                      >
                                        {product.qtySent || "0"} / {product.qtyReceived || "0"}
                                      </td>
                                      <td
                                        className="p-3"
                                        style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                      >
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            jobWork.status === "Completed"
                                              ? "bg-green-100 text-green-700"
                                              : jobWork.status === "In Printing"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-orange-100 text-orange-700"
                                          }`}
                                          style={{ fontSize: "0.75vw", padding: "0.4vw 0.8vw" }}
                                        >
                                          {jobWork.status}
                                        </span>
                                      </td>
                                      <td
                                        className="p-3 text-gray-600"
                                        style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                      >
                                        {new Date(jobWork.createdAt).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </td>
                                      <td
                                        className="p-3"
                                        style={{ fontSize: "0.85vw", padding: "0.7vw" }}
                                      >
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleEditJobWork(jobWork)}
                                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                            style={{ fontSize: "0.85vw" }}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteJobWork(jobWork.id)}
                                            className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                                            style={{ fontSize: "0.85vw" }}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
        </div> 
      
    </div>
  );
}
