import { Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// Add each feature's pages here.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
