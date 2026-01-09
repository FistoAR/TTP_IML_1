import { useState, useRef, useEffect } from "react";

// Dummy company data
const DUMMY_COMPANIES = [
  { company: "ABC Industries", contactName: "John Smith", phone: "9876543210" },
  { company: "XYZ Corporation", contactName: "Jane Doe", phone: "9123456780" },
  { company: "Tech Solutions Ltd", contactName: "Robert Brown", phone: "9988776655" },
  { company: "Global Packaging", contactName: "Emily Davis", phone: "9765432100" },
  { company: "Prime Manufacturing", contactName: "Michael Wilson", phone: "9456789012" },
];

export default function ScreenPrintingJobWorkDetails({ existingJobWork, onSubmit, onCancel, onBack }) {
  const [contact, setContact] = useState({
    company: "",
    contactName: "",
    phone: "",
    priority: "medium",
  });

  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFromSuggestion, setIsFromSuggestion] = useState(false);
  const autocompleteRef = useRef(null);

  // Product size options mapping
  const PRODUCT_SIZE_OPTIONS = {
    Round: ["120ml", "250ml", "300ml", "500ml", "1000ml"],
    "Round Square": ["450ml", "500ml"],
    Rectangle: ["500ml", "650ml", "750ml"],
    "Sweet Box": ["250gms", "500gms"],
    "Sweet Box TE": ["TE 250gms", "TE 500gms"],
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  function generateJobWorkNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `JW-${timestamp}-${random}`;
  }

  const [products, setProducts] = useState([
    {
      id: 1,
      jobWorkNumber: generateJobWorkNumber(),
      productName: "",
      size: "",
      printerName: "",
      qtySent: "",
      qtyReceived: "",
      status: "Pending",
      remarks: "",
      isCollapsed: false,
    },
  ]);

  // Initialize with existing job work data if editing
  useEffect(() => {
    if (existingJobWork) {
      setContact(existingJobWork.contact);
      setProducts(existingJobWork.products);
    }
  }, [existingJobWork]);

  // Handle company name input - clear fields when empty
  const handleCompanyInput = (value) => {
    setContact({ ...contact, company: value });

    if (value.trim() === "") {
      setContact({
        company: "",
        contactName: "",
        phone: "",
        priority: contact.priority,
      });
      setIsFromSuggestion(false);
      setFilteredCompanies([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = DUMMY_COMPANIES.filter((company) =>
      company.company.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (company) => {
    setContact({
      ...contact,
      company: company.company,
      contactName: company.contactName,
      phone: company.phone,
    });
    setIsFromSuggestion(true);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (contact.company.trim() === "" && contact.contactName.trim() === "") {
      setIsFromSuggestion(false);
    }
  }, [contact.company, contact.contactName]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update product field
  const updateProduct = (id, field, value) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Add new product with collapse feature
  const addProduct = () => {
    setProducts(products.map(p => ({ ...p, isCollapsed: true })));

    const newProduct = {
      id: products.length + 1,
      jobWorkNumber: generateJobWorkNumber(),
      productName: "",
      size: "",
      printerName: "",
      qtySent: "",
      qtyReceived: "",
      status: "Pending",
      remarks: "",
      isCollapsed: false,
    };
    setProducts([...products, newProduct]);
  };

  // Remove product
  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // Toggle collapse state
  const toggleCollapse = (id) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, isCollapsed: !p.isCollapsed } : p
      )
    );
  };

  const submitForm = () => {
    const jobWorkData = {
      contact,
      products,
      status: existingJobWork?.status || products[0]?.status || "Pending",
    };

    if (onSubmit) {
      onSubmit(jobWorkData);
    } else {
      console.log(jobWorkData);
      alert("Form submitted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ padding: "0.5vw" }}>
      {/* Header */}

      <div className="bg-white rounded-lg shadow-md mb-[1vw]" style={{ padding: "1.5vw" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[1vw]">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              style={{ fontSize: "1vw" }}
            >
              <svg
                className="w-5 h-5"
                style={{ width: "1.2vw", height: "1.2vw" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-800" style={{ fontSize: "1.8vw" }}>
                {existingJobWork ? "Edit Job Work" : "New Job Work"}
              </h1>
             
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ fontSize: "0.9vw", padding: "0.6vw 1.2vw" }}
            >
              Cancel
            </button>

            <button
              onClick={submitForm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              style={{ fontSize: "0.9vw", padding: "0.6vw 1.2vw" }}
            >
              {existingJobWork ? "Update Job Work" : "Create Job Work"}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Information */}

      <div className="bg-white rounded-lg shadow-md mb-[1vw]" style={{ padding: "1.5vw" }}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800" style={{ fontSize: "1.3vw" }}>
          Contact Information
        </h2>

        <div className="grid grid-cols-4 gap-4" style={{ gap: "1vw" }}>
          {/* Company Name with Autocomplete */}

          <div className="relative" ref={autocompleteRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Company Name *
            </label>

            <input
              type="text"
              value={contact.company}
              onChange={(e) => handleCompanyInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
              placeholder="Enter company name"
              required
            />

            {/* Autocomplete Suggestions */}

            {showSuggestions && filteredCompanies.length > 0 && (
              <div
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                style={{ fontSize: "0.85vw" }}
              >
                {filteredCompanies.map((company, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(company)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    style={{ padding: "0.8vw" }}
                  >
                    <div className="font-semibold text-gray-800">
                      {company.company}
                    </div>

                    <div className="text-sm text-gray-600" style={{ fontSize: "0.75vw" }}>
                      {company.contactName} • 
{company.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Name */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Contact Name *
            </label>

            <input
              type="text"
              value={contact.contactName}
              onChange={(e) =>
                !isFromSuggestion &&
                setContact({ ...contact, contactName: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
              placeholder="Enter contact name"
              disabled={isFromSuggestion}
              required
            />
          </div>

          {/* Phone */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Phone Number *
            </label>

            <input
              type="tel"
              value={contact.phone}
              onChange={(e) =>
                !isFromSuggestion &&
                setContact({ ...contact, phone: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
              placeholder="Enter phone number"
              disabled={isFromSuggestion}
              required
            />
          </div>

          {/* Priority */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
              Priority
            </label>

            <select
              value={contact.priority}
              onChange={(e) =>
                setContact({ ...contact, priority: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: "0.9vw", padding: "0.6vw" }}
            >
              <option value="low">Low</option>

              <option value="medium">Medium</option>

              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Section */}

      <div className="bg-white rounded-lg shadow-md mb-[1vw]" style={{ padding: "1vw" }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800" style={{ fontSize: "1.3vw" }}>
            Job Work Details
          </h2>

          <button
            onClick={addProduct}
            className="flex items-center gap-2 px-[1vw] py-[.5vw] bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            style={{ fontSize: "0.9vw", padding: "0.6vw 1.2vw" }}
          >
            <span style={{ fontSize: "1.2vw" }}>+</span> Add Product
          </button>
        </div>

        <div className="overflow-y-auto max-h-[34vh]">

          {products.map((product, index) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg mb-4"
              style={{ padding: "1vw" }}
            >
              {/* Product Header */}

              <div className="flex justify-between items-center mb-[.25vw]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCollapse(product.id)}
                    className="text-gray-600 hover:text-gray-800"
                    style={{ fontSize: "1.2vw" }}
                  >
{product.isCollapsed ? (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
) : (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)}

                  </button>

                  <h3 className="font-semibold text-gray-800" style={{ fontSize: "1.1vw" }}>
                    Product #{index + 1} - 
{product.jobWorkNumber}
                  </h3>

                  {product.productName && product.size && (
                    <span
                      className="text-gray-600"
                      style={{ fontSize: "0.9vw" }}
                    >
                      ({product.productName} - 
{product.size})
                    </span>
                  )}
                </div>

                {products.length > 1 && (
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-red-600 hover:text-red-800"
                    style={{ fontSize: "0.9vw" }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Product Details (Collapsible) */}

              {!product.isCollapsed && (
                <div className="space-y-4" style={{ gap: "1vw" }}>
                  {/* Product Name and Size */}

                  <div className="grid grid-cols-2 gap-4" style={{ gap: "1vw" }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
                        Product Name *
                      </label>

                      <select
                        value={product.productName}
                        onChange={(e) => {
                          updateProduct(product.id, "productName", e.target.value);
                          updateProduct(product.id, "size", "");
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontSize: "0.9vw", padding: "0.6vw" }}
                        required
                      >
                        <option value="">Select Product</option>

                        {Object.keys(PRODUCT_SIZE_OPTIONS).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
                        Size *
                      </label>

                      <select
                        value={product.size}
                        onChange={(e) =>
                          updateProduct(product.id, "size", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontSize: "0.9vw", padding: "0.6vw" }}
                        disabled={!product.productName}
                        required
                      >
                        <option value="">Select Size</option>

                        {product.productName &&
                          PRODUCT_SIZE_OPTIONS[product.productName]?.map(
                            (size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            )
                          )}
                      </select>
                    </div>
                  </div>

                  {/* Printer Name */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
                      Printer Name *
                    </label>

                    <input
                      type="text"
                      value={product.printerName}
                      onChange={(e) =>
                        updateProduct(product.id, "printerName", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontSize: "0.9vw", padding: "0.6vw" }}
                      placeholder="Enter printer name"
                      required
                    />
                  </div>

                  {/* Quantities */}

                  <div className="grid grid-cols-2 gap-4" style={{ gap: "1vw" }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
                        Quantity Sent *
                      </label>

                      <input
                        type="number"
                        value={product.qtySent}
                        onChange={(e) =>
                          updateProduct(product.id, "qtySent", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontSize: "0.9vw", padding: "0.6vw" }}
                        placeholder="Enter quantity sent"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
                        Quantity Received
                      </label>

                      <input
                        type="number"
                        value={product.qtyReceived}
                        onChange={(e) =>
                          updateProduct(product.id, "qtyReceived", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontSize: "0.9vw", padding: "0.6vw" }}
                        placeholder="Enter quantity received"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Status */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
                      Status
                    </label>

                    <select
                      value={product.status}
                      onChange={(e) =>
                        updateProduct(product.id, "status", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontSize: "0.9vw", padding: "0.6vw" }}
                    >
                      <option value="Pending">Pending</option>

                      <option value="In Printing">In Printing</option>

                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Remarks */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "0.85vw" }}>
                      Remarks
                    </label>

                    <textarea
                      value={product.remarks}
                      onChange={(e) =>
                        updateProduct(product.id, "remarks", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontSize: "0.9vw", padding: "0.6vw" }}
                      rows="3"
                      placeholder="Add any remarks"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
