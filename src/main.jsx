import React from "react";
import { createRoot } from "react-dom/client";
import MomoFlipBook from "./MomoFlipBook.jsx";

function App() {
  return <MomoFlipBook open={true} onClose={() => {}} />;
}

createRoot(document.getElementById("root")).render(<App />);
