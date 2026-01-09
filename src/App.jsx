import { Routes, Route, Navigate  } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NewOrder from "./pages/IML/NewOrder";
import ScrollToTop from "./ScrollToTop";
import LoginPage from './pages/LoginPage';

// Overview
import Overview from './pages/Overview'

// IML PAGES IMPORT
import OrdersManagement from "./pages/IML/OrdersManagement";
import OrdersManagement2 from "./pages/IML/OrdersManagement2";
import PurchaseManagement from "./pages/IML/PurchaseManagement";
import PurchaseDetails from "./pages/IML/PurchaseDetails ";
import PurchaseDetails2 from "./pages/IML/PurchaseDetails2";
import PODetails from "./pages/IML/PODetails";
import LabelQuantitySheet from "./pages/IML/LabelQuantitySheet";
import ProductionManagement from "./pages/IML/ProductionManagement";
import ProductionDetails from "./pages/IML/ProductionDetails";
import ProductionManagement2 from "./pages/IML/ProductionManagement2";
import ProductionDetails2 from "./pages/IML/ProductionDetails2";
import InventoryManagement from "./pages/IML/InventoryManagement";
import InventoryDetails from "./pages/IML/InventoryDetails";
import InventoryManagement2 from "./pages/IML/InventoryManagement2";
import InventoryDetails2 from "./pages/IML/InventoryDetails2";
import SalesPayment from "./pages/IML/SalesPayment";
import SalesPaymentDetails from "./pages/IML/SalesPaymentDetails";
import BillingManagement from "./pages/IML/BillingManagement";
import BillingDetails from "./pages/IML/BillingDetails";
import DispatchManagement from "./pages/IML/DispatchManagement";
import DispatchDetails from "./pages/IML/DispatchDetails";
import IMLStocks from './pages/IML/Stocks';

// SCREEN PRINTING PAGES IMPORT
import ScreenPrintingOrders from "./pages/ScreenPrinting/ScreenPrintingOrders";
import ScreenPrintingOrderDetails from "./pages/ScreenPrinting/ScreenPrintingOrderDetails";
import ScreenPrintingJobWork from "./pages/ScreenPrinting/ScreenPrintingJobWork";
import JobWorkDetails from "./pages/ScreenPrinting/JobWorkDetails";
import GoodsReturned from "./pages/ScreenPrinting/GoodsReturned";
import ScreenPrintingJobWorkDetails from "./pages/ScreenPrinting/ScreenPrintingJobWorkDetails";
import ScreenPrintingDispatch from "./pages/ScreenPrinting/ScreenPrintingDispatch";
import ScreenPrintingDispatchDetails from "./pages/ScreenPrinting/ScreenPrintingDispatchDetails";
import ScreenPrintingStocks from './pages/ScreenPrinting/Stocks';
import StocksDetails from "./pages/ScreenPrinting/StocksDetails";
import ScreenSalesPayment from "./pages/ScreenPrinting/SalesPayment";
import ScreenSalesPaymentDetails from "./pages/ScreenPrinting/SalesPaymentDetails";
import ScreenBilling from "./pages/ScreenPrinting/Billing";
import ScreenBillingDetails from "./pages/ScreenPrinting/BillingDetails";
import ScreenDispatch from "./pages/ScreenPrinting/Dispatch";
import ScreenDispatchDetails from "./pages/ScreenPrinting/DispatchDetails";

// STOKC
import Stock from "./pages/Stock";

// REPORTS
import Reports from "./pages/Reports";

function App() {
  return (
    <>
      <ScrollToTop />   {/* ✅ Correct: OUTSIDE Routes */}

      <Routes>
        <Route path="/" element={<MainLayout />}>

          {/* ✅ Default redirect */}
          <Route index element={<Navigate to="iml/new-order" replace />} />

          {/* Overview */}
          <Route path='overview' element={<Overview />} />
          
          {/* IML Routes */}
          {/* New order management */}
          <Route path="iml/new-order" element={<OrdersManagement />} />
          <Route path="iml/new-order2" element={<OrdersManagement2 />} />
          {/* <Route path="iml/new-order2" element={<OrdersManagement />} /> */}
          {/* Purchase Management */}
          <Route path="iml/purchaseManagement" element={<PurchaseManagement />} />
          <Route path="iml/purchase-details" element={<PurchaseDetails />} />
          <Route path="iml/purchase" element={<PurchaseDetails2 />} />
          <Route path="iml/purchase/po-details" element={<PODetails />} />
          <Route path="iml/purchase/label-quantity-sheet" element={<LabelQuantitySheet />} />
          {/* Production Management */}
          <Route path="iml/productionManagement" element={<ProductionManagement />} />
          <Route path="iml/production" element={<ProductionManagement2 />} />
          <Route path="iml/production/details" element={<ProductionDetails2 />} />
          
          <Route path="iml/production-details" element={<ProductionDetails />} />
          {/* Inventory Management */}
          <Route path="iml/inventoryManagement" element={<InventoryManagement />} />
          <Route path="iml/inventory-details" element={<InventoryDetails />} />
          
          <Route path="iml/inventory" element={<InventoryManagement2 />} />
          <Route path="iml/inventory/details" element={<InventoryDetails2 />} />

          {/* Sales payment management */}
          <Route path="iml/sales" element={<SalesPayment />} />
          <Route path="iml/sales-details" element={<SalesPaymentDetails />} />


          {/* Billing Management */}
          <Route path="iml/billingManagement" element={<BillingManagement />} />
          <Route path="iml/billing-details" element={<BillingDetails />} />
          {/* Dispatch Management */}
          <Route path="iml/dispatchManagement" element={<DispatchManagement />} />
          <Route path="iml/dispatch-details" element={<DispatchDetails />} />
          <Route path="iml/stocks" element={<IMLStocks />} />


          {/* Screen Printing Routes */}
          <Route path="screen-printing/orders" element={<ScreenPrintingOrders />} />
          <Route path="screen-printing/order-details" element={<ScreenPrintingOrderDetails />} />
          <Route path="screen-printing/jobwork" element={<ScreenPrintingJobWork />} />
          <Route path="screen-printing/jobwork-details" element={<JobWorkDetails />} />
          <Route path="screen-printing/goods-returned" element={<GoodsReturned />} />
          {/* <Route path="screen-printing/jobwork-details" element={<ScreenPrintingJobWorkDetails />} /> */}
          {/* <Route path="screen-printing/dispatch" element={<ScreenPrintingDispatch />} />
          <Route path="screen-printing/dispatch-details" element={<ScreenPrintingDispatchDetails />} /> */}
          <Route path="screen-printing/stocks" element={<ScreenPrintingStocks />} />
          <Route path="screen-printing/stocks/details" element={<StocksDetails />} />
          <Route path="screen-printing/sales-payment" element={<ScreenSalesPayment />} />
          <Route path="screen-printing/sales-payment/details" element={<ScreenSalesPaymentDetails />} />
          <Route path="screen-printing/billing" element={<ScreenBilling />} />
          <Route path="screen-printing/billing/details" element={<ScreenBillingDetails />} />
          <Route path="screen-printing/dispatch" element={<ScreenDispatch />} />
          <Route path="screen-printing/dispatch/details" element={<ScreenDispatchDetails />} />
          

          {/* Stock - Plain box */}
          <Route path="stock" element={<Stock />} />
          {/* Reports */}
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
