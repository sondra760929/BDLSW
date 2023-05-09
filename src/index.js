import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import fbase from "fbase";
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc =
  window.location.origin + "/pdf.worker.min.js";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
