// LabelQuantitySheet.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const STORAGE_KEY_ORDERS = "imlorders";
const STORAGE_KEY_LABEL_QTY = "iml_label_quantity_received";

const LabelQuantitySheet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { companyName, productCategory, size } = location.state || {};

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [allLabelsReceived, setAllLabelsReceived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [receivedHistory, setReceivedHistory] = useState([]);

  // Load orders for this company
  useEffect(() => {
    if (!companyName) {
      setLoading(false);
      return;
    }

    const storedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (storedOrders) {
      const allOrders = JSON.parse(storedOrders);
      
      // Filter orders by company name that have products moved to purchase
      const companyOrders = allOrders.filter(order => {
        const matchesCompany = order.contact?.company === companyName;
        const hasMatchingProducts = order.products?.some(p => 
          p.moveToPurchase && 
          p.productName === productCategory && 
          p.size === size
        );
        return matchesCompany && hasMatchingProducts;
      });

      setOrders(companyOrders);
    }
    setLoading(false);
  }, [companyName, productCategory, size]);

  // Handle order selection
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    
    // Find the matching product
    const product = order.products?.find(p => 
      p.moveToPurchase && 
      p.productName === productCategory && 
      p.size === size
    );
    
    setSelectedProduct(product);

    // Load existing label quantity data and history
    const storedLabelQty = localStorage.getItem(STORAGE_KEY_LABEL_QTY);
    if (storedLabelQty) {
      const allLabelData = JSON.parse(storedLabelQty);
      const key = `${order.id}_${product.id}`;
      const existingData = allLabelData[key];
      
      if (existingData) {
        setReceivedQuantity(existingData.receivedQuantity || "");
        setAllLabelsReceived(existingData.allReceived || false);
        
        // Load history
        if (existingData.history && Array.isArray(existingData.history)) {
          setReceivedHistory(existingData.history);
        } else {
          // If no history exists, create one entry from existing data
          setReceivedHistory([{
            quantity: existingData.receivedQuantity,
            date: existingData.updatedAt || new Date().toISOString(),
            allReceived: existingData.allReceived || false
          }]);
        }
      } else {
        setReceivedQuantity("");
        setAllLabelsReceived(false);
        setReceivedHistory([]);
      }
    } else {
      setReceivedQuantity("");
      setAllLabelsReceived(false);
      setReceivedHistory([]);
    }
  };

  // Handle form submission
  const handleSubmit = (isFinal = false) => {
    if (!receivedQuantity || receivedQuantity <= 0) {
      alert("Please enter a valid received quantity");
      return;
    }

    const storedLabelQty = localStorage.getItem(STORAGE_KEY_LABEL_QTY);
    const allLabelData = storedLabelQty ? JSON.parse(storedLabelQty) : {};

    const key = `${selectedOrder.id}_${selectedProduct.id}`;
    
    // Get existing data to preserve history
    const existingData = allLabelData[key] || {};
    const existingHistory = existingData.history || [];
    
    // Add new entry to history
    const newHistoryEntry = {
      quantity: parseInt(receivedQuantity),
      date: new Date().toISOString(),
      allReceived: isFinal ? true : allLabelsReceived
    };
    
    const updatedHistory = [...existingHistory, newHistoryEntry];
    
    allLabelData[key] = {
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      productId: selectedProduct.id,
      companyName: companyName,
      productCategory: productCategory,
      size: size,
      imlName: selectedProduct.imlName,
      imlType: selectedProduct.imlType,
      orderQuantity: selectedProduct.imlType.includes("LID") 
        ? selectedProduct.lidLabelQty 
        : selectedProduct.tubLabelQty,
      receivedQuantity: parseInt(receivedQuantity),
      allReceived: isFinal ? true : allLabelsReceived,
      updatedAt: new Date().toISOString(),
      history: updatedHistory
    };

    localStorage.setItem(STORAGE_KEY_LABEL_QTY, JSON.stringify(allLabelData));

    if (isFinal) {
      alert("✅ Label quantity submitted successfully!");
    } else {
      alert("💾 Label quantity saved successfully!");
    }

    // Update history display
    setReceivedHistory(updatedHistory);
    
    // Clear form but keep selection
    setReceivedQuantity("");
    setAllLabelsReceived(false);
  };

  const handleBack = () => {
    // Navigate back to purchase management with label sheet active
    navigate("/iml/purchase", {
      state: { activeSheet: "label" }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!companyName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Access</h2>
          <p className="text-gray-600 mb-4">No company information provided</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700"
          >
            Back to Purchase Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-[1vw]">
      <div className="max-w-[90vw] mx-auto bg-white rounded-[0.8vw] shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-[1vw] px-[1.5vw] border-b border-gray-200">
          <button
            className="flex gap-[.5vw] items-center cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[1vw] h-[1vw]"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-[1vw]">Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-[1.5vw] font-semibold text-gray-800 m-0">
              Label Quantity Sheet
            </h1>
            <p className="text-[.85vw] text-gray-600 mt-1">
              {companyName} - {productCategory} ({size})
            </p>
          </div>
          <div className="w-[3vw]"></div>
        </div>

        <div className="p-[1.5vw]">
          <div className="grid grid-cols-2 gap-[1.5vw] max-h-[70vh] overflow-y-auto">
            {/* Left Side - Order List */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[0.6vw] border-2 border-blue-200 p-[1vw] h-fit">
              <h3 className="text-[1vw] font-semibold text-blue-900 mb-[1vw] flex items-center gap-2">
                <span className="text-[1.2vw]">📋</span> Orders List
              </h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-[3vw] text-gray-500">
                  <p className="text-[.9vw]">No orders found for this product</p>
                </div>
              ) : (
                <div className="space-y-[0.75vw] max-h-[60vh] overflow-y-auto pr-[0.5vw]">
                  {orders.map((order, idx) => {
                    // Get IML name for this order
                    const product = order.products?.find(p => 
                      p.moveToPurchase && 
                      p.productName === productCategory && 
                      p.size === size
                    );
                    
                    return (
                      <div
                        key={order.id}
                        onClick={() => handleOrderSelect(order)}
                        className={`p-[1vw] rounded-[0.5vw] border-2 cursor-pointer transition-all ${
                          selectedOrder?.id === order.id
                            ? "bg-blue-600 border-blue-700 text-white shadow-lg"
                            : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className={`text-[.9vw] font-semibold ${
                              selectedOrder?.id === order.id ? "text-white" : "text-gray-800"
                            }`}>
                              Order: #{order.orderNumber}
                            </p>
                            <p className={`text-[.85vw] font-medium mt-[0.3vw] ${
                              selectedOrder?.id === order.id ? "text-blue-100" : "text-purple-700"
                            }`}>
                              IML: {product?.imlName || "N/A"}
                            </p>
                            <p className={`text-[.75vw] mt-[0.3vw] ${
                              selectedOrder?.id === order.id ? "text-blue-100" : "text-gray-600"
                            }`}>
                              Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          {selectedOrder?.id === order.id && (
                            <svg className="w-[1.5vw] h-[1.5vw]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Side - Product Details & Form */}
            <div>
              {!selectedProduct ? (
                <div className="bg-gray-50 rounded-[0.6vw] border-2 border-dashed border-gray-300 p-[3vw] text-center">
                  <svg className="w-[4vw] h-[4vw] mx-auto text-gray-400 mb-[1vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-[1vw] text-gray-600 font-medium">
                    Select an order to view details
                  </p>
                </div>
              ) : (
                <div className="space-y-[1vw]">
                  {/* Product Details */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[0.6vw] border-2 border-purple-200 p-[1vw]">
                    <h3 className="text-[1vw] font-semibold text-purple-900 mb-[1vw] flex items-center gap-2">
                      <span className="text-[1.2vw]">📦</span> Product Details
                    </h3>
                    <div className="grid grid-cols-2 gap-[1vw]">
                      <div>
                        <label className="block text-[.75vw] font-medium text-gray-700 mb-[0.3vw]">Company Name</label>
                        <div className="text-[.85vw] px-[0.75vw] py-[0.4vw] bg-white border border-gray-300 rounded-[0.4vw] font-semibold">
                          {companyName}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[.75vw] font-medium text-gray-700 mb-[0.3vw]">Order Number</label>
                        <div className="text-[.85vw] px-[0.75vw] py-[0.4vw] bg-white border border-gray-300 rounded-[0.4vw] font-semibold">
                          {selectedOrder.orderNumber}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[.75vw] font-medium text-gray-700 mb-[0.3vw]">IML Name</label>
                        <div className="text-[.85vw] px-[0.75vw] py-[0.4vw] bg-purple-100 border border-purple-300 rounded-[0.4vw] font-semibold text-purple-800">
                          {selectedProduct.imlName}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[.75vw] font-medium text-gray-700 mb-[0.3vw]">IML Type</label>
                        <div className="text-[.85vw] px-[0.75vw] py-[0.4vw] bg-blue-100 border border-blue-300 rounded-[0.4vw] font-semibold text-blue-800">
                          {selectedProduct.imlType}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[.75vw] font-medium text-gray-700 mb-[0.3vw]">Order Quantity</label>
                        <div className="text-[.85vw] px-[0.75vw] py-[0.4vw] bg-green-100 border border-green-300 rounded-[0.4vw] font-bold text-green-800">
                          {selectedProduct.imlType.includes("LID") 
                            ? selectedProduct.lidLabelQty 
                            : selectedProduct.tubLabelQty}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Label Received Input */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[0.6vw] border-2 border-green-200 p-[1vw]">
                    <h3 className="text-[1vw] font-semibold text-green-900 mb-[1vw] flex items-center gap-2">
                      <span className="text-[1.2vw]">📊</span> Label Received Quantity
                    </h3>
                    <div>
                      <label className="block text-[.85vw] font-medium text-gray-700 mb-[0.5vw]">
                        Received Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Enter received quantity"
                        value={receivedQuantity}
                        onChange={(e) => setReceivedQuantity(e.target.value)}
                        min="0"
                        className="w-full text-[.9vw] px-[1vw] py-[0.5vw] border-2 border-gray-300 bg-white rounded-[0.5vw] outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    {/* All Labels Received Checkbox */}
                    <div className="mt-[1vw] flex items-center gap-[0.75vw] p-[0.75vw] bg-white rounded-[0.5vw] border border-gray-300">
                      <input
                        type="checkbox"
                        id="allReceived"
                        checked={allLabelsReceived}
                        onChange={(e) => setAllLabelsReceived(e.target.checked)}
                        className="w-[1.2vw] h-[1.2vw] cursor-pointer accent-green-600"
                      />
                      <label htmlFor="allReceived" className="text-[.85vw] font-medium text-gray-700 cursor-pointer">
                        All labels received (Mark as complete)
                      </label>
                    </div>
                  </div>

                  {/* Received History Table */}
                  {receivedHistory.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[0.6vw] border-2 border-amber-200 p-[1vw]">
                      <h3 className="text-[1vw] font-semibold text-amber-900 mb-[1vw] flex items-center gap-2">
                        <span className="text-[1.2vw]">📜</span> Received History
                      </h3>
                      <div className="overflow-auto max-h-[20vh]">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-amber-100">
                              <th className="border border-amber-300 px-[0.75vw] py-[0.5vw] text-left text-[.8vw] font-semibold text-amber-900">Date</th>
                              <th className="border border-amber-300 px-[0.75vw] py-[0.5vw] text-left text-[.8vw] font-semibold text-amber-900">Quantity</th>
                              <th className="border border-amber-300 px-[0.75vw] py-[0.5vw] text-center text-[.8vw] font-semibold text-amber-900">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {receivedHistory.slice().reverse().map((entry, idx) => (
                              <tr key={idx} className="hover:bg-amber-50">
                                <td className="border border-amber-300 px-[0.75vw] py-[0.5vw] text-[.8vw] text-gray-700">
                                  {new Date(entry.date).toLocaleDateString('en-IN')} {new Date(entry.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="border border-amber-300 px-[0.75vw] py-[0.5vw] text-[.8vw] font-semibold text-gray-800">
                                  {entry.quantity}
                                </td>
                                <td className="border border-amber-300 px-[0.75vw] py-[0.5vw] text-center">
                                  {entry.allReceived ? (
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-[.75vw] font-semibold">
                                      ✓ Complete
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[.75vw] font-semibold">
                                      Partial
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-[1vw] mt-[1.5vw]">
                    <button
                      onClick={() => {
                        setSelectedOrder(null);
                        setSelectedProduct(null);
                        setReceivedQuantity("");
                        setAllLabelsReceived(false);
                        setReceivedHistory([]);
                      }}
                      className="px-[1.5vw] py-[.6vw] border-2 border-gray-300 text-gray-700 bg-white rounded-[0.6vw] font-medium text-[0.9vw] hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    {allLabelsReceived ? (
                      <button
                        onClick={() => handleSubmit(true)}
                        className="px-[1.5vw] py-[.6vw] bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-[0.6vw] font-semibold text-[0.9vw] hover:from-green-700 hover:to-emerald-700 transition-all shadow-md cursor-pointer"
                      >
                        ✓ Submit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubmit(false)}
                        className="px-[1.5vw] py-[.6vw] bg-blue-600 text-white rounded-[0.6vw] font-semibold text-[0.9vw] hover:bg-blue-700 transition-all shadow-md cursor-pointer"
                      >
                        💾 Save
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelQuantitySheet;
