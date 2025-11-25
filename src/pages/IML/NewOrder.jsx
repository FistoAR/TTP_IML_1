import { useState, useRef, useEffect } from "react";
import { RgbaColorPicker } from "react-colorful";
import * as pdfjsLib from "pdfjs-dist";

import design1PDF from "../../assets/pdf/design1.pdf";
import design2PDF from "../../assets/pdf/design2.pdf";
import design3PDF from "../../assets/pdf/design3.pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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

  const OLD_DESIGN_FILES = [
    { id: 1, name: "Design 1", path: design1PDF, type: "pdf" },
    { id: 2, name: "Design 2", path: design2PDF, type: "pdf" },
    { id: 3, name: "Design 3", path: design3PDF, type: "pdf" },
  ];
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

  const [customerType, setCustomerType] = useState("existing"); // "existing" or "new"

  const [pdfPreviews, setPdfPreviews] = useState({});

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    type: null, // 'pdf' or 'image'
    path: null,
    name: null,
  });

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

  // Generate PDF thumbnail from first page
  // Generate PDF thumbnail from first page
  const generatePdfThumbnail = async (file, productId) => {
    try {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);

          // Load the PDF document
          const loadingTask = pdfjsLib.getDocument({
            data: typedArray,
            cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
            cMapPacked: true,
          });

          const pdf = await loadingTask.promise;

          // Get the first page
          const page = await pdf.getPage(1);

          // Set scale for thumbnail
          const scale = 1.5; // Increased for better quality
          const viewport = page.getViewport({ scale });

          // Create canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;

          // Convert canvas to data URL
          const thumbnailUrl = canvas.toDataURL("image/png");

          // Store thumbnail in state
          setPdfPreviews((prev) => ({
            ...prev,
            [productId]: thumbnailUrl,
          }));

          console.log(
            "PDF thumbnail generated successfully for product:",
            productId
          );
        } catch (error) {
          console.error("Error rendering PDF:", error);
          // Set error state if needed
          setPdfPreviews((prev) => ({
            ...prev,
            [productId]: "error",
          }));
        }
      };

      fileReader.onerror = function (error) {
        console.error("FileReader error:", error);
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error generating PDF thumbnail:", error);
    }
  };

  // Generate PDF thumbnail from URL (for existing designs)
  const generatePdfThumbnailFromUrl = async (pdfUrl, previewId) => {
    try {
      // Fetch the PDF file
      const response = await fetch(pdfUrl);
      const blob = await response.blob();

      const fileReader = new FileReader();

      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);

          // Load the PDF document
          const loadingTask = pdfjsLib.getDocument({
            data: typedArray,
            cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
            cMapPacked: true,
          });

          const pdf = await loadingTask.promise;

          // Get the first page
          const page = await pdf.getPage(1);

          // Set scale for thumbnail
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          // Create canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;

          // Convert canvas to data URL
          const thumbnailUrl = canvas.toDataURL("image/png");

          // Store thumbnail in state
          setPdfPreviews((prev) => ({
            ...prev,
            [previewId]: thumbnailUrl,
          }));

          console.log("PDF thumbnail generated successfully for:", previewId);
        } catch (error) {
          console.error("Error rendering PDF:", error);
          setPdfPreviews((prev) => ({
            ...prev,
            [previewId]: "error",
          }));
        }
      };

      fileReader.onerror = function (error) {
        console.error("FileReader error:", error);
      };

      fileReader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  useEffect(() => {
    const pdfDesigns = OLD_DESIGN_FILES.filter(
      (design) => design.type === "pdf"
    );

    pdfDesigns.forEach((design) => {
      // Only generate if not already in state
      if (!pdfPreviews[`old-${design.id}`]) {
        generatePdfThumbnailFromUrl(design.path, `old-${design.id}`);
      }
    });
  }, []); // Empty dependency array - runs once on mount

  // Auto-select "New Design" when "New Customer" is selected
  useEffect(() => {
    if (customerType === "new") {
      setProducts(
        products.map((p) => ({
          ...p,
          designType: "new",
        }))
      );
    }
  }, [customerType]);

  // Preview Modal Component
  const PreviewModal = () => {
    if (!previewModal.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-[#000000ad] bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg overflow-hidden max-w-6xl w-full max-h-90vh flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gray-50">
            <h2 className="text-[1.25vw] font-semibold text-gray-800">
              Preview: {previewModal.name}
            </h2>
            <button
              onClick={() =>
                setPreviewModal({
                  isOpen: false,
                  type: null,
                  path: null,
                  name: null,
                })
              }
              className="text-gray-500 hover:text-gray-800 text-2vw font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {previewModal.type === "pdf" ? (
              <iframe
                src={`${previewModal.path}#toolbar=1&navpanes=0`}
                title={previewModal.name}
                className="w-full h-full border-0"
                style={{ minHeight: "60vh" }}
              />
            ) : (
              <img
                src={previewModal.path}
                alt={previewModal.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-300 bg-gray-50">
            <button
              onClick={() =>
                setPreviewModal({
                  isOpen: false,
                  type: null,
                  path: null,
                  name: null,
                })
              }
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-[0.4vw] cursor-pointer hover:bg-gray-400 hover:text-white font-medium text-0.9vw"
            >
              Close
            </button>
            <a
              href={previewModal.path}
              download={previewModal.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-[0.4vw] hover:bg-blue-700 font-medium text-0.9vw"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    );
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
            <button
              onClick={() => setCustomerType("existing")}
              className={`px-[1.5vw] py-[0.6vw] border-2 border-blue-600 rounded-full text-[0.9vw] font-medium cursor-pointer transition-all duration-200 ${
                customerType === "existing"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "bg-blue-600 text-white border-blue-600 hover:bg-blue-500"
              }`}
            >
              Existing Customer
            </button>
            <button
              onClick={() => setCustomerType("new")}
              className={`px-[1.5vw] py-[0.6vw] border-none rounded-full text-[0.9vw] font-medium cursor-pointer transition-all duration-200 ${
                customerType === "new"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "bg-blue-600 text-white border-blue-600 hover:bg-blue-500"
              }`}
            >
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
                    <div className="mb-[1.25vw] p-[1vw] bg-blue-50 border border-blue-200 rounded-[0.5vw]">
                      <span className="text-[0.9vw] font-semibold text-blue-900">
                        Order Number: {product.orderNumber}
                      </span>
                    </div>

                    {/* Product Basic Details Section */}
                    <div className="bg-white rounded-[0.6vw] border-2 border-blue-200 p-[1.5vw] mb-[1.25vw]">
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
                    <div className="flex justify-end gap-[0.8vw] mb-[1.25vw]">
                      {/* Only show Existing Design button if customerType is "existing" */}
                      {customerType === "existing" && (
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
                      )}
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
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-[0.6vw] border-2 border-purple-200 p-[1.5vw] mb-[1.25vw]">
                      <h3 className="text-[1vw] font-semibold text-purple-900 mb-[1vw]">
                        Design Selection
                      </h3>

                      {/* Design File Upload - Conditional based on design type */}
                      {product.designType === "existing" ? (
                        // Existing Design - Radio selection with preview
                        <div className="grid grid-cols-2 gap-[2vw]">
                          <div>
                            <label className="block text-[0.9vw] font-medium text-gray-700 mb-[0.5vw]">
                              Old Design Files
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-[0.6vw] p-[2vw] min-h-[15vw] bg-white mb-[1vw]">
                              <div className="grid grid-cols-3 gap-[1.5vw]">
                                {OLD_DESIGN_FILES.map((file) => (
                                  <div key={file.id} className="text-center">
                                    <div className="w-[6vw] h-[6vw] mx-auto bg-gray-100 rounded-[0.6vw] flex items-center justify-center text-[3vw] mb-[0.8vw] border-2 border-gray-300 overflow-hidden">
                                      {/* Show thumbnail based on type */}
                                      {file.type === "pdf" ? (
                                        pdfPreviews[`old-${file.id}`] ? (
                                          <img
                                            src={pdfPreviews[`old-${file.id}`]}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center">
                                            <svg
                                              className="w-[3vw] h-[3vw] text-red-500"
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
                                            <span className="text-[0.6vw] text-gray-500 mt-1">
                                              Loading...
                                            </span>
                                          </div>
                                        )
                                      ) : (
                                        <img
                                          src={file.path}
                                          alt={file.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.parentElement.innerHTML =
                                              '<span class="text-[2vw]">🖼️</span>';
                                          }}
                                        />
                                      )}
                                    </div>
                                    <label className="flex items-center justify-center gap-[0.4vw] text-[0.75vw] text-gray-500 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`design-${product.id}`}
                                        checked={
                                          product.selectedOldDesign === file.id
                                        }
                                        onChange={() => {
                                          updateProduct(
                                            product.id,
                                            "selectedOldDesign",
                                            file.id
                                          );
                                          // Generate PDF thumbnail if not already generated
                                          if (
                                            file.type === "pdf" &&
                                            !pdfPreviews[`old-${file.id}`]
                                          ) {
                                            generatePdfThumbnailFromUrl(
                                              file.path,
                                              `old-${file.id}`
                                            );
                                          }
                                        }}
                                        className="w-[0.9vw] h-[0.9vw] cursor-pointer"
                                      />
                                      <span className="text-[0.75vw] font-medium">
                                        {file.name}
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
                                (() => {
                                  const selectedFile = OLD_DESIGN_FILES.find(
                                    (f) => f.id === product.selectedOldDesign
                                  );

                                  return (
                                    <div className="text-center w-full">
                                      <div className="w-full h-auto max-h-[12vw] mx-auto rounded-[0.6vw] flex items-center justify-center mb-[1vw] overflow-hidden">
                                        {selectedFile.type === "pdf" ? (
                                          pdfPreviews[
                                            `old-${selectedFile.id}`
                                          ] ? (
                                            <img
                                              src={
                                                pdfPreviews[
                                                  `old-${selectedFile.id}`
                                                ]
                                              }
                                              alt={selectedFile.name}
                                              className="w-full h-auto max-h-[6.5vw] object-contain"
                                            />
                                          ) : (
                                            <div className="flex flex-col items-center py-4">
                                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                              <p className="text-gray-500 text-[0.8vw]">
                                                Loading PDF preview...
                                              </p>
                                            </div>
                                          )
                                        ) : (
                                          <img
                                            src={selectedFile.path}
                                            alt={selectedFile.name}
                                            className="w-full h-auto max-h-[12vw] object-contain"
                                          />
                                        )}
                                      </div>
                                      <p className="text-[0.9vw] text-gray-700 font-medium mb-1">
                                        {selectedFile.name}
                                      </p>
                                      <span
                                        className={`inline-block px-3 py-1 rounded text-[0.75vw] font-medium ${
                                          selectedFile.type === "pdf"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        {selectedFile.type === "pdf"
                                          ? "PDF"
                                          : "Image"}
                                      </span>

                                      <div className="flex justify-end gap-1vw mt-2vw">
                                        <button
                                          onClick={() => {
                                            const selectedFile =
                                              OLD_DESIGN_FILES.find(
                                                (f) =>
                                                  f.id ===
                                                  product.selectedOldDesign
                                              );
                                            if (selectedFile) {
                                              setPreviewModal({
                                                isOpen: true,
                                                type: selectedFile.type,
                                                path: selectedFile.path,
                                                name: selectedFile.name,
                                              });
                                            }
                                          }}
                                          className="px-2vw py-0.6vw bg-blue-600 text-white rounded-0.4vw hover:bg-blue-700 font-medium text-0.85vw transition-all"
                                        >
                                          👁️ Preview Full
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()
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
                          <div className="mb-[1.25vw]">
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
                              <div>
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
                            <div className="mt-[1.5vw]">
                              <label className="block text-0.9vw font-medium text-gray-700 mb-[0.5vw]">
                                Upload New Design File{" "}
                                <span className="text-red-500">*</span>
                              </label>

                              {/* Side by side layout - Upload box and Preview */}
                              <div className="grid grid-cols-2 gap-[2vw]">
                                {/* Left: Upload Box */}
                                <div>
                                  <FileUploadBox
                                    file={product.designFile}
                                    onFileChange={(file) => {
                                      updateProduct(
                                        product.id,
                                        "designFile",
                                        file
                                      );

                                      // Generate PDF thumbnail if it's a PDF file
                                      if (
                                        file &&
                                        file.type === "application/pdf"
                                      ) {
                                        generatePdfThumbnail(file, product.id);
                                      }
                                    }}
                                    productId={product.id}
                                    small
                                  />
                                </div>

                                {/* Right: Preview Panel */}
                                <div>
                                  {product.designFile ? (
                                    <div className="p-[1vw] bg-gray-50 rounded-0.4vw border-2 border-gray-300 h-full">
                                      <p className="text-[0.85vw] font-medium text-gray-700 mb-[0.5vw]">
                                        Preview:
                                      </p>

                                      {/* Show PDF thumbnail or image preview */}
                                      {product.designFile.type ===
                                      "application/pdf" ? (
                                        <div className="mb-[1vw]">
                                          {pdfPreviews[product.id] ? (
                                            <img
                                              src={pdfPreviews[product.id]}
                                              alt="PDF Preview"
                                              className="w-full h-auto border border-gray-300 rounded"
                                              style={{
                                                maxHeight: "180px",
                                                objectFit: "contain",
                                              }}
                                            />
                                          ) : (
                                            <div className="flex flex-col items-center justify-center h-32 bg-gray-200 rounded">
                                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                              <p className="text-gray-500 text-0.8vw">
                                                Generating preview...
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        product.designFile.type.startsWith(
                                          "image/"
                                        ) && (
                                          <img
                                            src={URL.createObjectURL(
                                              product.designFile
                                            )}
                                            alt="Design Preview"
                                            className="w-full h-auto mb-1vw border border-gray-300 rounded"
                                            style={{
                                              maxHeight: "180px",
                                              objectFit: "contain",
                                            }}
                                          />
                                        )
                                      )}

                                      <div className="mt-2">
                                        <div className="flex items-center justify-between text-0.75vw">
                                          <span className="text-gray-600 truncate pr-2">
                                            {product.designFile.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-0.7vw mt-1">
                                          <span className="text-gray-500">
                                            {(
                                              product.designFile.size / 1024
                                            ).toFixed(2)}{" "}
                                            KB
                                          </span>
                                          <span
                                            className={`px-2 py-0.5 rounded text-0.65vw font-medium ${
                                              product.designFile.type ===
                                              "application/pdf"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                          >
                                            {product.designFile.type ===
                                            "application/pdf"
                                              ? "PDF"
                                              : "Image"}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const fileUrl = URL.createObjectURL(
                                            product.designFile
                                          );
                                          setPreviewModal({
                                            isOpen: true,
                                            type:
                                              product.designFile.type ===
                                              "application/pdf"
                                                ? "pdf"
                                                : "image",
                                            path: fileUrl,
                                            name: product.designFile.name,
                                          });
                                        }}
                                        className="ml-2vw px-1.5vw py-0.5vw bg-green-600 text-white rounded-0.4vw hover:bg-green-700 font-medium text-0.75vw whitespace-nowrap transition-all"
                                      >
                                        👁️ Preview
                                      </button>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </div>
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
      <PreviewModal />
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
          accept="image/*,application/pdf"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              onFileChange(file); // Just pass the file to parent
            }
          }}
          className="hidden"
          id={`file-upload-${productId}`}
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
      <div className="bg-gray-50 p-[1.25vw] rounded-b-[0.6vw] border border-gray-200 border-t-0">
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
