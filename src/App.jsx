import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NewOrder from "./pages/IML/NewOrder";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* IML → New Order */}
        <Route path="iml/new-order" element={<NewOrder />} />
      </Route>
    </Routes>
  );
}

export default App;
