import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NewOrder from "./pages/IML/NewOrder";
import OrdersManagement from "./pages/IML/OrdersManagement";
import OrdersManagement2 from "./pages/IML/OrdersManagement2";
import PurchaseManagement from "./pages/IML/PurchaseManagement";
import Reports from "./pages/Reports";
import ScrollToTop from "./ScrollToTop";
import LoginPage from './pages/LoginPage'
import PurchaseDetails from "./pages/IML/PurchaseDetails ";
import PurchaseDetails2 from "./pages/IML/PurchaseDetails2";
import ProductionManagement from "./pages/IML/ProductionManagement";
import ProductionDetails from "./pages/IML/ProductionDetails";
import InventoryManagement from "./pages/IML/InventoryManagement";
import InventoryDetails from "./pages/IML/InventoryDetails";

function App() {
  return (
    <>
      <ScrollToTop />   {/* ✅ Correct: OUTSIDE Routes */}

      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          {/* IML → New Order */}
          {/* New order management */}
          <Route path="iml/new-order" element={<OrdersManagement2 />} />
          <Route path="iml/new-order2" element={<OrdersManagement />} />
          {/* Purchase Management */}
          <Route path="iml/purchaseManagement" element={<PurchaseManagement />} />
          <Route path="iml/purchase-details" element={<PurchaseDetails />} />
          <Route path="iml/purchase" element={<PurchaseDetails2 />} />
          {/* Production Management */}
          <Route path="iml/productionManagement" element={<ProductionManagement />} />
          <Route path="iml/production-details" element={<ProductionDetails />} />
          {/* Inventory Management */}
          <Route path="iml/inventoryManagement" element={<InventoryManagement />} />
          <Route path="iml/inventory-details" element={<InventoryDetails />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
