import { useState, useRef, useEffect } from "react";
import { RgbaColorPicker } from "react-colorful";

export default function NewOrder() {
  const [contact, setContact] = useState({
    company: "",
    contactName: "",
    phone: "",
    imlName: "",
  });

  // Product size options mapping
  const PRODUCT_SIZE_OPTIONS = {
    Round: ["120ml", "250ml", "300ml", "500ml", "1000ml"],
    "Round Square": ["450ml", "500ml"],
    Rectangle: ["500ml", "650ml", "750ml"],
    "Sweet Box": ["250gms", "500gms"],
    "Sweet Box TE": ["TE 250gms", "TE 500gms"],
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [products, setProducts] = useState([
    {
      id: 1,
      orderNumber: generateOrderNumber(),
      productName: "",
      size: "",
      lidColor: { r: 255, g: 255, b: 255, a: 1 },
      tubColor: { r: 255, g: 255, b: 255, a: 1 },
      imlType: "LID",
      labelQty: "",
      productionQty: "",
      stock: 0,
      designFile: null,
      selectedOldDesign: null,
      approvedDate: getTodayDate(),
      designSharedMail: false,
      designStatus: "pending",
      showLidColorPicker: false,
      showTubColorPicker: false,
      designType: "new",
      isCollapsed: false,
    },
  ]);

  const [payment, setPayment] = useState({
    paymentType: "advance", // 'advance' or 'po'
    method: "",
    totalEstimated: "",
    advance: "",
    remarks: "",
  });

  // Generate unique order number
  function generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  // Update product field
  const updateProduct = (id, field, value) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Update quantity with stock calculation
  const updateQuantity = (id, field, value) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          const calculatedStock =
            (parseInt(updated.labelQty) || 0) -
            (parseInt(updated.productionQty) || 0);
          updated.stock = Math.max(calculatedStock, 0);
          return updated;
        }
        return p;
      })
    );
  };

  // Add new product
  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      orderNumber: generateOrderNumber(),
      productName: "",
      size: "",
      lidColor: { r: 255, g: 255, b: 255, a: 1 },
      tubColor: { r: 255, g: 255, b: 255, a: 1 },
      imlType: "LID",
      labelQty: "",
      productionQty: "",
      stock: 0,
      designFile: null,
      selectedOldDesign: null,
      approvedDate: getTodayDate(),
      designSharedMail: false,
      designStatus: "pending",
      showLidColorPicker: false,
      showTubColorPicker: false,
      designType: "new",
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
    console.log({
      contact,
      products,
      payment,
    });
    alert("Form submitted successfully!");
  };

  // Convert RGBA to CSS string
  const rgbaToString = (rgba) => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      <div className="max-w-[90vw] mx-auto bg-white rounded-[0.8vw] shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-[1.5vw_2vw] border-b border-gray-200">
          <h1 className="text-[1.5vw] font-semibold text-gray-800 m-0">
            Orders/IML Details
          </h1>
          <div className="flex gap-[0.5vw] p-[0.25vw] bg-blue-600 rounded-full">
            <button className="px-[1.5vw] py-[0.6vw] border-2 border-blue-600 text-blue-600 bg-white rounded-full text-[0.9vw] font-medium cursor-pointer transition-all duration-200 hover:bg-blue-50">
              Existing Customer
            </button>
            <button className="px-[1.5vw] py-[0.6vw] bg-blue-600 text-white border-none rounded-full text-[0.9vw] font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700">
              New Customer
            </button>
          </div>
        </div>

        <div className="p-[2vw]">
          {/* Contact Details */}
          <Section title="Contact Details">
            <div className="grid grid-cols-4 gap-[1.5vw]">
              <Input
                label="Company Name"
                required
                placeholder="Enter Company Name"
                value={contact.company}
                onChange={(e) =>
                  setContact({ ...contact, company: e.target.value })
                }
              />
              <Input
                label="Contact Name"
                required
                placeholder="Enter Contact Name"
                value={contact.contactName}
                onChange={(e) =>
                  setContact({ ...contact, contactName: e.target.value })
                }
              />
              <Input
                label="Contact Number"
                required
                placeholder="Enter Contact Number"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
              />
              <Input
                label="IML Name"
                required
                placeholder="Enter IML Name"
                value={contact.imlName}
                onChange={(e) =>
                  setContact({ ...contact, imlName: e.target.value })
                }
              />
            </div>
          </Section>

          {/* Products List */}
          {products.map((product, index) => (
            <div key={product.id} className="mt-[1.5vw]">
              {/* Combined Order & Design Details */}
              <Section
                title={
                  <div className="flex justify-between items-center w-full">
                    <span>
                      {product.isCollapsed &&
                      product.productName &&
                      product.size
                        ? `Order ${index + 1}: ${product.productName} - ${
                            product.size
                          }`
                        : `Order & Design Details ${index + 1}`}
                    </span>
                    <svg
                      className={`w-[1.2vw] h-[1.2vw] transition-transform duration-200 ${
                        product.isCollapsed ? "rotate-180" : ""
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
                  </div>
                }
                onClick={() => toggleCollapse(product.id)}
                isCollapsed={product.isCollapsed}
              >
                {!product.isCollapsed && (
                  <>
                    {/* Order Number Display */}
                    <div className="mb-[1.5vw] p-[1vw] bg-blue-50 border border-blue-200 rounded-[0.5vw]">
                      <span className="text-[0.9vw] font-semibold text-blue-900">
                        Order Number: {product.orderNumber}
                      </span>
                    </div>

                    {/* Product Basic Details Section */}
                    <div className="bg-white rounded-[0.6vw] border-2 border-blue-200 p-[1.5vw] mb-[1.5vw]">
                      <h3 className="text-[1vw] font-semibold text-blue-900 mb-[1vw]">
                        Product Basic Details
                      </h3>

                      {/* Product Details */}
                      <div className="grid grid-cols-4 gap-[1.5vw]">
                        <Select
                          label="Product Name"
                          required
                          placeholder="Select Product"
                          options={[
                            "Round",
                            "Round Square",
                            "Rectangle",
                            "Sweet Box",
                            "Sweet Box TE",
                          ]}
                          value={product.productName}
                          onChange={(e) => {
                            setProducts(
                              products.map((p) =>
                                p.id === product.id
                                  ? {
                                      ...p,
                                      productName: e.target.value,
                                      size: "",
                                    }
                                  : p
                              )
                            );
                          }}
                        />

                        <Select
                          label="Size"
                          required
                          placeholder="Select Size"
                          options={
                            product.productName
                              ? PRODUCT_SIZE_OPTIONS[product.productName] || []
                              : []
                          }
                          value={product.size}
                          onChange={(e) =>
                            updateProduct(product.id, "size", e.target.value)
                          }
                          disabled={!product.productName}
                        />

                       
                        <Select
                          label="IML Type"
                          required
                          placeholder="Select Type"
                          options={["LID", "TUB", "LID & TUB"]}
                          value={product.imlType}
                          onChange={(e) => {
                            setProducts(
                              products.map((p) =>
                                p.id === product.id
                                  ? {
                                      ...p,
                                      imlType: e.target.value,
                                      showLidColorPicker: false,
                                      showTubColorPicker: false,
                                    }
                                  : p
                              )
                            );
                          }}
                        />
                      </div>

                      {/* Color Picker Section */}
                      <div className="grid grid-cols-4 gap-[1.5vw] mt-[1vw]">
                        {(product.imlType === "LID" ||
                          product.imlType === "LID & TUB") && (
                          <RgbaColorPickerInput
                            label="LID Color"
                            value={product.lidColor}
                            onChange={(color) =>
                              updateProduct(product.id, "lidColor", color)
                            }
                            showPicker={product.showLidColorPicker}
                            setShowPicker={(show) =>
                              updateProduct(
                                product.id,
                                "showLidColorPicker",
                                show
                              )
                            }
                          />
                        )}
                        {(product.imlType === "TUB" ||
                          product.imlType === "LID & TUB") && (
                          <RgbaColorPickerInput
                            label="TUB Color"
                            value={product.tubColor}
                            onChange={(color) =>
                              updateProduct(product.id, "tubColor", color)
                            }
                            showPicker={product.showTubColorPicker}
                            setShowPicker={(show) =>
                              updateProduct(
                                product.id,
                                "showTubColorPicker",
                                show
                              )
                            }
                          />
                        )}
                      </div>

                      {/* Quantity Details */}
                      <div className="grid grid-cols-4 gap-[1.5vw] mt-[1.5vw]">
                        <Input
                          label="Labels Qty"
                          required
                          placeholder="Enter Label Quantity"
                          value={product.labelQty}
                          onChange={(e) =>
                            updateQuantity(
                              product.id,
                              "labelQty",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          label="Production Qty"
                          required
                          placeholder="Enter Production Quantity"
                          value={product.productionQty}
                          onChange={(e) =>
                            updateQuantity(
                              product.id,
                              "productionQty",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          label="Stock"
                          required
                          placeholder="Stock"
                          value={product.stock}
                          onChange={(e) => {}}
                          disabled
                        />
                      </div>
                    </div>

                    {/* Design Type Toggle - Before Design Selection */}
                    <div className="flex justify-end gap-[0.8vw] mb-[1.5vw]">
                      <button
                        onClick={() =>
                          updateProduct(product.id, "designType", "existing")
                        }
                        className={`px-[2vw] py-[0.6vw] rounded-[0.4vw] cursor-pointer text-[0.9vw] font-medium transition-all duration-200 ${
                          product.designType === "existing"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Existing Design
                      </button>
                      <button
                        onClick={() =>
                          updateProduct(product.id, "designType", "new")
                        }
                        className={`px-[2vw] py-[0.6vw] rounded-[0.4vw] cursor-pointer text-[0.9vw] font-medium transition-all duration-200 ${
                          product.designType === "new"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        New Design
                      </button>
                    </div>

                    {/* Design Selection Section */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-[0.6vw] border-2 border-purple-200 p-[1.5vw] mb-[1.5vw]">
                      <h3 className="text-[1vw] font-semibold text-purple-900 mb-[1vw]">
                        Design Selection
                      </h3>

                      {/* Design File Upload - Conditional based on design type */}
                      {product.designType === "existing" ? (
                        // Existing Design - Radio selection with preview
                        <div className="grid grid-cols-2 gap-[2vw]">
                          <div>
                            <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
                              Old Design Files{" "}
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-[0.6vw] p-[2vw] min-h-[15vw] bg-white mb-[1vw]">
                              <div className="grid grid-cols-3 gap-[1.5vw]">
                                {[
                                  {
                                    id: 1,
                                    name: "design1.png",
                                    thumbnail: "🎨",
                                  },
                                  {
                                    id: 2,
                                    name: "design2.png",
                                    thumbnail: "🏛️",
                                  },
                                  {
                                    id: 3,
                                    name: "design3.png",
                                    thumbnail: "👟",
                                  },
                                ].map((file) => (
                                  <div key={file.id} className="text-center">
                                    <div className="w-[6vw] h-[6vw] mx-auto bg-yellow-400 rounded-[0.6vw] flex items-center justify-center text-[3vw] mb-[0.8vw]">
                                      {file.thumbnail}
                                    </div>
                                    <label className="flex items-center justify-center gap-[0.4vw] text-[0.75vw] text-gray-500 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`design-${product.id}`}
                                        checked={
                                          product.selectedOldDesign === file.id
                                        }
                                        onChange={() =>
                                          updateProduct(
                                            product.id,
                                            "selectedOldDesign",
                                            file.id
                                          )
                                        }
                                        className="w-[0.9vw] h-[0.9vw] cursor-pointer"
                                      />
                                      <span className="text-[0.75vw]">
                                        Select
                                      </span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Approve Date below designs */}
                            <div className="w-[50%]">
                              <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
                                Approve Date
                              </label>
                              <input
                                type="date"
                                value={product.approvedDate}
                                onChange={(e) =>
                                  updateProduct(
                                    product.id,
                                    "approvedDate",
                                    e.target.value
                                  )
                                }
                                className="w-full px-[1vw] py-[0.8vw] border border-gray-300 bg-white rounded-[0.5vw] text-[0.9vw] outline-none box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
                              Selected Design Preview
                            </label>
                            <div className="border-2 border-gray-300 rounded-[0.6vw] p-[2vw] min-h-[15vw] bg-white flex items-center justify-center">
                              {product.selectedOldDesign ? (
                                <div className="text-center">
                                  <div className="w-[10vw] h-[10vw] mx-auto bg-yellow-400 rounded-[0.6vw] flex items-center justify-center text-[5vw] mb-[1vw]">
                                    {product.selectedOldDesign === 1
                                      ? "🎨"
                                      : product.selectedOldDesign === 2
                                      ? "🏛️"
                                      : "👟"}
                                  </div>
                                  <p className="text-[0.9vw] text-gray-700 font-medium">
                                    Design {product.selectedOldDesign}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[0.9vw] text-gray-400">
                                  No design selected
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // New Design - Checkbox first, then status dropdown
                        <div>
                          {/* Design Shared Checkbox - FIRST */}
                          <div className="mb-[1.5vw]">
                            <label className="flex items-center gap-[0.6vw] text-[0.9vw] text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={product.designSharedMail}
                                onChange={(e) =>
                                  updateProduct(
                                    product.id,
                                    "designSharedMail",
                                    e.target.checked
                                  )
                                }
                                className="w-[1.1vw] h-[1.1vw] cursor-pointer"
                              />
                              <span className="text-[0.9vw] font-medium">
                                Design Shared In Mail On Last Meeting
                              </span>
                            </label>
                          </div>

                          {/* Design Status Dropdown */}
                          <div className="grid grid-cols-3 gap-[2vw]">
                            <div>
                              <Select
                                label="Design Status"
                                required
                                placeholder="Select Status"
                                options={["Pending", "Approved"]}
                                value={
                                  product.designStatus === "pending"
                                    ? "Pending"
                                    : product.designStatus === "approved"
                                    ? "Approved"
                                    : ""
                                }
                                onChange={(e) => {
                                  const newValue = e.target.value.toLowerCase();
                                  updateProduct(
                                    product.id,
                                    "designStatus",
                                    newValue
                                  );
                                }}
                              />
                            </div>

                            {/* Approve Date - only show if approved */}
                            {product.designStatus === "approved" && (
                              <div >
                                <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
                                  Approve Date{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="date"
                                  value={product.approvedDate}
                                  onChange={(e) =>
                                    updateProduct(
                                      product.id,
                                      "approvedDate",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-[0.75vw] py-[0.45vw] border border-gray-300 bg-white rounded-[0.5vw] text-[0.9vw] outline-none box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                              </div>
                            )}
                          </div>

                          {/* Upload - only enabled if approved */}
                          {product.designStatus === "approved" && (
                            <div className="mt-[1.5vw] w-[50%]">
                              <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
                                Upload New Design File{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <FileUploadBox
                                file={product.designFile}
                                onFileChange={(file) =>
                                  updateProduct(product.id, "designFile", file)
                                }
                                productId={product.id}
                                small
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove Product Button (Inside card, only if > 1) */}
                    {products.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="px-[2vw] py-[0.7vw] border border-red-500 text-red-500 bg-white rounded-[0.5vw] text-[0.9vw] cursor-pointer transition-all duration-200 hover:bg-red-50"
                        >
                          Remove Product
                        </button>
                      </div>
                    )}
                  </>
                )}
              </Section>
            </div>
          ))}

          {/* Add Product Button - Outside the card */}
          <div className="flex justify-end mt-[1.5vw]">
            <button
              onClick={addProduct}
              className="px-[1vw] py-[0.5vw] bg-blue-600 text-white border-none rounded-[0.5vw] text-[0.9vw] font-medium cursor-pointer flex items-center gap-[0.6vw] transition-all duration-200 hover:bg-blue-700 shadow-md hover:shadow-lg"
            >
              <span className="text-[1.2vw]">+</span> Add Another Product
            </button>
          </div>

          {/* Payment Details */}
          <Section title="Payment Details">
            <div className="mb-[1vw]">
              <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
                Payment Type
              </label>
              <div className="flex gap-[2vw] mt-[1vw]">
                <label className="flex items-center gap-[0.4vw] cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="advance"
                    checked={payment.paymentType === "advance"}
                    onChange={(e) =>
                      setPayment({
                        ...payment,
                        paymentType: e.target.value,
                      })
                    }
                    className="w-[1vw] h-[1vw] cursor-pointer"
                  />
                  <span className="text-[0.85vw] text-gray-700">Advance</span>
                </label>
                <label className="flex items-center gap-[0.4vw] cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="po"
                    checked={payment.paymentType === "po"}
                    onChange={(e) =>
                      setPayment({
                        ...payment,
                        paymentType: e.target.value,
                      })
                    }
                    className="w-[1vw] h-[1vw] cursor-pointer"
                  />
                  <span className="text-[0.85vw] text-gray-700">PO</span>
                </label>
              </div>
            </div>

            {payment.paymentType === "advance" && (
              <>
                <div className="grid grid-cols-4 gap-[1.5vw] mt-[1.5vw]">
                  <Select
                    label="Payment Method"
                    required
                    placeholder="Choose Payment Method"
                    options={["Cash", "UPI", "Bank Transfer", "Cheque"]}
                    value={payment.method}
                    onChange={(e) =>
                      setPayment({ ...payment, method: e.target.value })
                    }
                  />
                  <Input
                    label="Total Estimated Amount"
                    required
                    placeholder="Enter Total Estimated Amount"
                    value={payment.totalEstimated}
                    onChange={(e) =>
                      setPayment({ ...payment, totalEstimated: e.target.value })
                    }
                    type="number"
                  />
                  <Input
                    label="Advance Amount"
                    required
                    placeholder="Enter Advance Amount"
                    value={payment.advance}
                    onChange={(e) =>
                      setPayment({ ...payment, advance: e.target.value })
                    }
                    type="number"
                  />
                  <Input
                    label="Remarks"
                    placeholder="Enter Remarks"
                    value={payment.remarks}
                    onChange={(e) =>
                      setPayment({ ...payment, remarks: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-[1vw] mt-[2vw]">
              <button className="px-[2vw] py-[0.7vw] border border-gray-300 text-gray-700 bg-white rounded-[0.5vw] text-[0.9vw] cursor-pointer transition-all duration-200 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={submitForm}
                className="px-[2vw] py-[0.7vw] bg-green-600 text-white border-none rounded-[0.5vw] text-[0.9vw] cursor-pointer transition-all duration-200 hover:bg-green-700"
              >
                Submit Order
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// RGBA Color Picker Component (same as before)
function RgbaColorPickerInput({
  label,
  value,
  onChange,
  showPicker,
  setShowPicker,
}) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, setShowPicker]);

  const rgbaToString = (rgba) => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  };

  const rgbaToHex = (rgba) => {
    const r = rgba.r.toString(16).padStart(2, "0");
    const g = rgba.g.toString(16).padStart(2, "0");
    const b = rgba.b.toString(16).padStart(2, "0");
    const a = Math.round(rgba.a * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}${a}`;
  };

  const hexToRgba = (hex) => {
    hex = hex.replace("#", "");
    let r, g, b, a;

    if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = 1;
    } else {
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    return { r, g, b, a };
  };

  const handleHexInputChange = (e) => {
    const hexValue = e.target.value;
    if (/^#?[0-9A-Fa-f]{0,8}$/.test(hexValue)) {
      if (hexValue.length === 7 || hexValue.length === 9) {
        const rgba = hexToRgba(hexValue);
        onChange(rgba);
      }
    }
  };

  return (
    <div className="relative">
      <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="#RRGGBBAA"
          value={rgbaToHex(value)}
          onChange={handleHexInputChange}
          className="w-full px-[0.75vw] py-[0.45vw] pr-[3.5vw] border border-gray-300 bg-white rounded-[0.5vw] text-[0.9vw] outline-none box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase font-mono"
          onClick={() => setShowPicker(!showPicker)}
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="absolute right-[0.5vw] top-1/2 -translate-y-1/2 w-[2.5vw] h-[2vw] rounded border-2 border-gray-300 cursor-pointer transition-all hover:border-blue-500 overflow-hidden"
          style={{
            background: `
              linear-gradient(${rgbaToString(value)}, ${rgbaToString(value)}),
              repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 10px 10px
            `,
          }}
          title="Pick a color"
        />
      </div>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-[4.5vw] left-0 z-50 p-4 bg-white rounded-lg shadow-2xl border border-gray-200"
        >
          <div className="mb-3">
            <RgbaColorPicker
              color={value}
              onChange={onChange}
              style={{ width: "100%" }}
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[0.75vw] text-gray-600 font-medium">
              Selected:
            </span>
            <div
              className="w-10 h-10 rounded border-2 border-gray-300 overflow-hidden"
              style={{
                background: `
                  linear-gradient(${rgbaToString(value)}, ${rgbaToString(
                  value
                )}),
                  repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 10px 10px
                `,
              }}
            />
            <div className="flex flex-col">
              <span className="text-[0.8vw] text-gray-700 font-mono font-semibold">
                {rgbaToHex(value).toUpperCase()}
              </span>
              <span className="text-[0.7vw] text-gray-500">
                Opacity: {Math.round(value.a * 100)}%
              </span>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[0.75vw] text-gray-600 font-medium block mb-1">
              HEX Color Code
            </label>
            <input
              type="text"
              value={rgbaToHex(value)}
              onChange={handleHexInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-[0.85vw] font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="#RRGGBBAA"
            />
          </div>

          <div className="mb-3">
            <label className="text-[0.75vw] text-gray-600 font-medium block mb-2">
              RGBA Values
            </label>
            <div className="grid grid-cols-4 gap-2 text-[0.7vw]">
              <div>
                <label className="text-gray-600 block mb-1">R</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={value.r}
                  onChange={(e) =>
                    onChange({ ...value, r: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 border rounded text-center focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-gray-600 block mb-1">G</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={value.g}
                  onChange={(e) =>
                    onChange({ ...value, g: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 border rounded text-center focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-gray-600 block mb-1">B</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={value.b}
                  onChange={(e) =>
                    onChange({ ...value, b: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 border rounded text-center focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-gray-600 block mb-1">A</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value.a}
                  onChange={(e) =>
                    onChange({ ...value, a: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 border rounded text-center focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded text-[0.85vw] hover:bg-blue-700 transition-all font-medium"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// File Upload Component (same as before - keeping your existing implementation)
function FileUploadBox({ file, onFileChange, productId, small }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      onFileChange(selectedFile);

      const type = selectedFile.type;
      setFileType(type);

      if (type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else if (type === "application/pdf") {
        setPreviewUrl(null);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileChange(selectedFile);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];
      if (allowedTypes.includes(droppedFile.type)) {
        handleFileChange(droppedFile);
      } else {
        alert("Please upload only images (JPEG, PNG, GIF, WebP) or PDF files");
      }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    onFileChange(null);
    setPreviewUrl(null);
    setFileType(null);
  };

  return (
    <div
      className={`border-2 ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-dashed border-gray-300"
      } rounded-[0.6vw] p-[2vw] bg-white ${
        small ? "min-h-[12vw]" : "min-h-[15vw]"
      } transition-all duration-200`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <input
          type="file"
          id={`file-upload-${productId}`}
          className="hidden"
          onChange={handleInputChange}
          accept="image/*,.pdf"
        />

        {!file ? (
          <label
            htmlFor={`file-upload-${productId}`}
            className="cursor-pointer flex flex-col items-center w-full"
          >
            <div
              className={`w-[3.5vw] h-[3.5vw] ${
                isDragging ? "bg-blue-200" : "bg-gray-200"
              } rounded-full flex items-center justify-center mb-[0.8vw] transition-all`}
            >
              <svg
                className={`w-[2vw] h-[2vw] ${
                  isDragging ? "text-blue-600" : "text-gray-500"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p
              className={`text-[0.85vw] ${
                isDragging ? "text-blue-600 font-medium" : "text-gray-500"
              } my-[0.2vw]`}
            >
              {isDragging ? "Drop file here" : "Upload Design File"}
            </p>
            <p className="text-[0.75vw] text-gray-400 my-[0.2vw]">
              Click to browse or drag & drop
            </p>
            <p className="text-[0.7vw] text-gray-400 mt-[0.5vw]">
              Supports: JPG, PNG, GIF, WebP, PDF
            </p>
          </label>
        ) : (
          <div className="w-full">
            {fileType && fileType.startsWith("image/") && previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-[12vw] object-contain rounded-[0.4vw] border border-gray-200"
                />
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                  title="Remove file"
                >
                  ×
                </button>
                <div className="mt-2 text-center">
                  <p className="text-[0.8vw] text-gray-700 font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-[0.7vw] text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : fileType === "application/pdf" ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-[8vw] h-[10vw] bg-red-50 rounded-[0.4vw] border-2 border-red-200 flex flex-col items-center justify-center">
                    <svg
                      className="w-[4vw] h-[4vw] text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                      <path
                        d="M14 2v6h6M10 13h4m-4 4h4"
                        stroke="white"
                        strokeWidth="1"
                      />
                    </svg>
                    <span className="text-[0.9vw] font-bold text-red-600 mt-1">
                      PDF
                    </span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-2 text-center max-w-full">
                  <p className="text-[0.8vw] text-gray-700 font-medium truncate px-2">
                    {file.name}
                  </p>
                  <p className="text-[0.7vw] text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-[8vw] h-[10vw] bg-gray-100 rounded-[0.4vw] border-2 border-gray-300 flex flex-col items-center justify-center">
                    <svg
                      className="w-[4vw] h-[4vw] text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    </svg>
                  </div>
                  <button
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[0.8vw] text-gray-700 font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-[0.7vw] text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}

            <label
              htmlFor={`file-upload-${productId}`}
              className="mt-3 block w-full"
            >
              <div className="cursor-pointer text-center px-3 py-2 border border-blue-500 text-blue-600 rounded-[0.4vw] text-[0.8vw] font-medium hover:bg-blue-50 transition-all">
                Change File
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, onClick, isCollapsed }) {
  return (
    <div className="mt-[1.5vw]">
      <div
        className={`bg-blue-600 text-white px-[1.5vw] py-[0.8vw] rounded-t-[0.6vw] text-[1vw] font-medium ${
          onClick ? "cursor-pointer" : ""
        }`}
        onClick={onClick}
      >
        {title}
      </div>
      <div className="bg-gray-50 p-[2vw] rounded-b-[0.6vw] border border-gray-200 border-t-0">
        {children}
      </div>
    </div>
  );
}

function Input({
  label,
  required,
  placeholder,
  value,
  onChange,
  disabled,
  onBlur,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
        {label} {required}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className="w-full px-[0.75vw] py-[0.45vw] border border-gray-300 bg-white rounded-[0.5vw] text-[0.9vw] outline-none box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function Select({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}) {
  return (
    <div>
      <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
        {label} {required}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-[0.75vw] py-[0.45vw] pr-[2.5vw] border border-gray-300 rounded-[0.5vw] text-[0.9vw] outline-none bg-white box-border appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer ${
            disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-[1vw] top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-[1vw] h-[1vw] text-gray-500"
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
        </div>
      </div>
    </div>
  );
}
