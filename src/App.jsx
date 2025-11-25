import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NewOrder from "./pages/IML/NewOrder";
import Reports from "./pages/Reports";
import ScrollToTop from "./ScrollToTop";
import LoginPage from './pages/LoginPage'
import PurchaseDetails from "./pages/IML/PurchaseDetails ";

function App() {
  return (
    <>
      <ScrollToTop />   {/* ✅ Correct: OUTSIDE Routes */}

      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          {/* IML → New Order */}
          <Route path="iml/new-order" element={<NewOrder />} />
          <Route path="iml/purchase" element={<PurchaseDetails />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
