import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NewOrder from "./pages/IML/NewOrder";
import Reports from "./pages/Reports";
import ScrollToTop from "./ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />   {/* ✅ Correct: OUTSIDE Routes */}

      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          {/* IML → New Order */}
          <Route path="iml/new-order" element={<NewOrder />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
