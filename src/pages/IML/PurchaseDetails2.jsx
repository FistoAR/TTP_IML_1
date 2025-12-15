import React, { useState } from "react";

const PRODUCT_SIZE_OPTIONS = {
  Round: ["120ml", "250ml", "300ml", "500ml", "1000ml"],
  "Round Square": ["450ml", "500ml"],
  Rectangle: ["500ml", "650ml", "750ml"],
  "Sweet Box": ["250gms", "500gms"],
  "Sweet Box TE": ["TE 250gms", "TE 500gms"],
};

// Dummy product data based on product name and size
const PRODUCT_DATA = {
  Round: {
    "120ml": {
      qty: "50,000",
      colorTub: "TR / MW",
      colorLid: "Yellow",
      hasLid: true,
      hasTub: true,
    },
    "250ml": {
      qty: "75,000",
      colorTub: "White",
      colorLid: "Blue",
      hasLid: true,
      hasTub: true,
    },
    "500ml": {
      qty: "100,000",
      colorTub: "Clear",
      colorLid: null,
      hasLid: false,
      hasTub: true,
    },
  },
  "Round Square": {
    "450ml": {
      qty: "60,000",
      colorTub: "Red",
      colorLid: "Green",
      hasLid: true,
      hasTub: true,
    },
    "500ml": {
      qty: "80,000",
      colorTub: null,
      colorLid: "Orange",
      hasLid: true,
      hasTub: false,
    },
  },
  Rectangle: {
    "500ml": {
      qty: "90,000",
      colorTub: "Black",
      colorLid: "White",
      hasLid: true,
      hasTub: true,
    },
    "750ml": {
      qty: "120,000",
      colorTub: "Gray",
      colorLid: null,
      hasLid: false,
      hasTub: true,
    },
  },
  "Sweet Box": {
    "250gms": {
      qty: "40,000",
      colorTub: "Pink",
      colorLid: "Purple",
      hasLid: true,
      hasTub: true,
    },
    "500gms": {
      qty: "55,000",
      colorTub: null,
      colorLid: "Gold",
      hasLid: true,
      hasTub: false,
    },
  },
  "Sweet Box TE": {
    "TE 250gms": {
      qty: "35,000",
      colorTub: "Silver",
      colorLid: "Bronze",
      hasLid: true,
      hasTub: true,
    },
    "TE 500gms": {
      qty: "45,000",
      colorTub: "Copper",
      colorLid: null,
      hasLid: false,
      hasTub: true,
    },
  },
};

const suppliers = ["Ajanta", "Supplier B", "Supplier C"];
const labelTypes = ["Opaque", "Transparent"];

const PurchaseDetails = () => {
  const [activeTab, setActiveTab] = useState("Tracking Sheet");
  const [form, setForm] = useState({
    company: "Terra Tech Packs",
    product: "",
    size: "",
    qty: "",
    colorTub: "",
    colorLid: "",
    hasLid: false,
    hasTub: false,
    supplier: "",
    poNumber: "",
    labelType: "",
    prodDate: "",
    comments: "",
  });

  const [labelQtyForm, setLabelQtyForm] = useState({
    product: "",
    size: "",
    qty: "",
    comments: "",
  });

  const [labelQtyEntries, setLabelQtyEntries] = useState([
    {
      id: 1,
      product: "Round",
      size: "250ml",
      qty: "26,500",
      comments: "Urgent delivery",
      date: "25/11/2025",
    },
    {
      id: 2,
      product: "Rectangle",
      size: "500ml",
      qty: "15,000",
      comments: "Standard order",
      date: "24/11/2025",
    },
    {
      id: 3,
      product: "Sweet Box",
      size: "250gms",
      qty: "10,000",
      comments: "Festival special",
      date: "23/11/2025",
    },
  ]);

  const handleProductChange = (e) => {
    const selectedProduct = e.target.value;
    const firstSize = PRODUCT_SIZE_OPTIONS[selectedProduct]?.[0] || "";
    const productData = PRODUCT_DATA[selectedProduct]?.[firstSize] || {};

    setForm({
      ...form,
      product: selectedProduct,
      size: firstSize,
      qty: productData.qty || "",
      colorTub: productData.colorTub || "",
      colorLid: productData.colorLid || "",
      hasLid: productData.hasLid || false,
      hasTub: productData.hasTub || false,
    });
  };

  const handleSizeChange = (e) => {
    const selectedSize = e.target.value;
    const productData = PRODUCT_DATA[form.product]?.[selectedSize] || {};

    setForm({
      ...form,
      size: selectedSize,
      qty: productData.qty || "",
      colorTub: productData.colorTub || "",
      colorLid: productData.colorLid || "",
      hasLid: productData.hasLid || false,
      hasTub: productData.hasTub || false,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLabelQtyChange = (e) => {
    const { name, value } = e.target;

    if (name === "product") {
      const firstSize = PRODUCT_SIZE_OPTIONS[value]?.[0] || "";
      setLabelQtyForm({
        ...labelQtyForm,
        product: value,
        size: firstSize,
      });
    } else if (name === "size") {
      setLabelQtyForm({
        ...labelQtyForm,
        size: value,
      });
    } else {
      setLabelQtyForm({ ...labelQtyForm, [name]: value });
    }
  };

  const handleLabelQtySubmit = () => {
    if (labelQtyForm.product && labelQtyForm.size && labelQtyForm.qty) {
      const newEntry = {
        id: labelQtyEntries.length + 1,
        ...labelQtyForm,
        date: new Date().toLocaleDateString("en-GB"),
      };
      setLabelQtyEntries([newEntry, ...labelQtyEntries]);
      setLabelQtyForm({ product: "", size: "", qty: "", comments: "" });
    }
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-[#F6F7FB] text-[#222] pb-[0.25vw] w-full">
      <div className="flex items-center justify-between px-[2vw]">
        <h1 className="text-[1.5vw] font-semibold">Purchase Details</h1>

        <div className="flex items-center gap-0 mt-[0.5vw] bg-blue-600 rounded-full p-[0.3vw]">
          <button
            onClick={() => handleTab("Tracking Sheet")}
            className={`px-[1.5vw] py-[0.8vw] rounded-full text-[.9vw] font-medium transition-all cursor-pointer ${
              activeTab === "Tracking Sheet"
                ? "bg-white text-[#5279F7]"
                : "bg-transparent text-white"
            }`}
          >
            Tracking Sheet
          </button>
          <button
            onClick={() => handleTab("Label Quantity")}
            className={`px-[1.5vw] py-[0.8vw] rounded-full text-[.9vw] font-medium transition-all cursor-pointer ${
              activeTab === "Label Quantity"
                ? "bg-white text-[#5279F7]"
                : "bg-transparent text-white"
            }`}
          >
            Label Quantity
          </button>
        </div>
      </div>

      {/* Tracking Sheet Tab */}
      {activeTab === "Tracking Sheet" && (
        <div className="bg-white rounded-[0.8vw] mt-[1.5vw] w-[95%] mx-auto shadow-md">
          <div className="bg-blue-600 text-white text-[1.25vw] px-[1.5vw] py-[0.9vw] rounded-t-[0.8vw] font-medium">
            Purchase Details
          </div>
          <form className="grid grid-cols-4 gap-[1.75vw] px-[1.5vw] pt-[1.5vw] text-[1.1vw]">
            {/* Company Name */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Company Name
              </label>
              <input
                name="company"
                value={form.company}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            {/* Product Name */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Product Name
              </label>
              <select
                name="product"
                value={form.product}
                onChange={handleProductChange}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] focus:outline-none focus:border-[#5279F7] bg-white"
              >
                <option value="">Select Product</option>
                {Object.keys(PRODUCT_SIZE_OPTIONS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            {/* Size */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Size
              </label>
              <select
                name="size"
                value={form.size}
                onChange={handleSizeChange}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] focus:outline-none focus:border-[#5279F7] bg-white"
                disabled={!form.product}
              >
                <option value="">Select Size</option>
                {form.product &&
                  PRODUCT_SIZE_OPTIONS[form.product]?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>
            {/* Qty */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Qty
              </label>
              <input
                name="qty"
                value={form.qty}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            {/* Color - Tub */}
            {form.hasTub && (
              <div>
                <label className="block mb-[0.5vw] text-[1vw] font-medium">
                  Color - Tub
                </label>
                <div className="flex items-center gap-[1.2vw]">
                  <input
                    name="colorTub"
                    value={form.colorTub}
                    className="border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] flex-1 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                  <span className="w-[2.5vw] h-[2.5vw] rounded-full bg-gradient-conic from-red-200 via-green-200 to-blue-200 border-2 border-gray-300"></span>
                  <span className="w-[3vw] h-[2.5vw] bg-[#90EE90] rounded-[0.4vw] flex items-center justify-center font-bold text-black text-[0.8vw]">
                    TUB
                  </span>
                </div>
              </div>
            )}
            {/* Color - Lid */}
            {form.hasLid && (
              <div>
                <label className="block mb-[0.5vw] text-[1vw] font-medium">
                  Color - Lid
                </label>
                <div className="flex items-center gap-[1.2vw]">
                  <input
                    name="colorLid"
                    value={form.colorLid}
                    className="border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] flex-1 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                  <span className="w-[2.5vw] h-[2.5vw] rounded-full bg-gradient-conic from-yellow-200 via-orange-200 to-pink-200 border-2 border-gray-300"></span>
                  <span className="w-[3vw] h-[2.5vw] bg-[#FFD43B] rounded-[0.4vw] flex items-center justify-center font-bold text-black text-[0.8vw]">
                    LID
                  </span>
                </div>
              </div>
            )}
            {/* Label Type */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Label Type
              </label>
              <select
                name="labelType"
                value={form.labelType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] focus:outline-none focus:border-[#5279F7] bg-white"
              >
                <option value="">Select Label Type</option>
                {labelTypes.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {/* Supplier Name */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Supplier Name
              </label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] focus:outline-none focus:border-[#5279F7] bg-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {/* PO Number */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                PO Number
              </label>
              <input
                name="poNumber"
                value={form.poNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] focus:outline-none focus:border-[#5279F7]"
                placeholder="Enter PO Number"
              />
            </div>
            {/* Production Dateline */}
            <div>
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Production Dateline
              </label>
              <input
                name="prodDate"
                type="date"
                value={form.prodDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] focus:outline-none focus:border-[#5279F7]"
              />
            </div>
            {/* Add Comments - Now placed after Production Dateline */}
            <div className="col-span-4">
              <label className="block mb-[0.5vw] text-[1vw] font-medium">
                Add Comments
              </label>
              <textarea
                name="comments"
                value={form.comments}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.9vw] focus:outline-none focus:border-[#5279F7] resize-none"
                placeholder="Type Here ........"
              />
            </div>
          </form>
          <div className="flex justify-end gap-[1vw] px-[2.5vw] py-[2vw]">
            <button className="px-[1.5vw] py-[0.75vw] rounded-[0.6vw] border-2 border-gray-300 bg-white text-[#5279F7] text-[.9vw] font-medium cursor-pointer hover:bg-gray-50 transition">
              Cancel
            </button>
            <button className="px-[1.5vw] py-[0.75vw] rounded-[0.6vw] bg-blue-600 text-white text-[.9vw] font-medium cursor-pointer hover:bg-[#3d5dd4] transition">
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Label Quantity Tab */}
      {activeTab === "Label Quantity" && (
        <div className="mt-[1.5vw] bg-[#F6F7FB] rounded-[0.8vw] w-[95%] mx-auto">
          <div className="bg-white rounded-[0.8vw] shadow-md px-[2.5vw] py-[2vw] mb-[2vw]">
            <div className="grid grid-cols-4 gap-[1.75vw] text-[1.1vw]">
              <div>
                <label className="block mb-[0.5vw] text-[1vw] font-medium">
                  Product Name
                </label>
                <select
                  name="product"
                  value={labelQtyForm.product}
                  onChange={handleLabelQtyChange}
                  className="border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.85vw] w-full focus:outline-none focus:border-[#5279F7] bg-white"
                >
                  <option value="">Select Product</option>
                  {Object.keys(PRODUCT_SIZE_OPTIONS).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-[0.5vw] text-[1vw] font-medium">
                  Product Size
                </label>
                <select
                  name="size"
                  value={labelQtyForm.size}
                  onChange={handleLabelQtyChange}
                  className="border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.85vw] w-full focus:outline-none focus:border-[#5279F7] bg-white"
                  disabled={!labelQtyForm.product}
                >
                  <option value="">Select Size</option>
                  {labelQtyForm.product &&
                    PRODUCT_SIZE_OPTIONS[labelQtyForm.product]?.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block mb-[0.5vw] text-[1vw] font-medium">
                  Enter Qty
                </label>
                <input
                  name="qty"
                  value={labelQtyForm.qty}
                  onChange={handleLabelQtyChange}
                  className="border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.85vw] w-full focus:outline-none focus:border-[#5279F7]"
                  type="text"
                  placeholder="26,500"
                />
              </div>
              <div>
                <label className="block mb-[0.5vw] text-[1vw] font-medium">
                  Add Comments
                </label>
                <input
                  name="comments"
                  value={labelQtyForm.comments}
                  onChange={handleLabelQtyChange}
                  className="w-full border border-gray-300 rounded-[0.6vw] px-[0.85vw] py-[0.7vw] text-[.85vw] focus:outline-none focus:border-[#5279F7]"
                  placeholder="Type Here ........"
                />
              </div>
            </div>
            <div className="flex justify-end mt-[1.5vw]">
              <button
                onClick={handleLabelQtySubmit}
                className="px-[1.5vw] py-[0.75vw] rounded-[0.6vw] bg-blue-600 text-white text-[.9vw] font-medium cursor-pointer hover:bg-[#3d5dd4] transition"
              >
                Add Entry
              </button>
            </div>
          </div>

          {/* Table View of Entries */}
          <div className="bg-white rounded-[0.8vw] shadow-md px-[2.5vw] py-[2vw] mb-[2vw]">
            <h2 className="text-[1.4vw] font-semibold mb-[1.5vw]">
              Label Quantity Entries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[.9vw]">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-[1vw] py-[0.8vw] text-left rounded-tl-[0.5vw]">
                      Date
                    </th>
                    <th className="px-[1vw] py-[0.8vw] text-left">Product Name</th>
                    <th className="px-[1vw] py-[0.8vw] text-left">Size</th>
                    <th className="px-[1vw] py-[0.8vw] text-left">Quantity</th>
                    <th className="px-[1vw] py-[0.8vw] text-left rounded-tr-[0.5vw]">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {labelQtyEntries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`${
                        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } border-b border-gray-200 hover:bg-blue-50 transition`}
                    >
                      <td className="px-[1vw] py-[0.9vw]">{entry.date}</td>
                      <td className="px-[1vw] py-[0.9vw]">{entry.product}</td>
                      <td className="px-[1vw] py-[0.9vw]">{entry.size}</td>
                      <td className="px-[1vw] py-[0.9vw]">{entry.qty}</td>
                      <td className="px-[1vw] py-[0.9vw]">
                        {entry.comments || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseDetails;
