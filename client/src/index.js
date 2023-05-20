import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// for simple peer to work
import * as process from "process";

window.global = window;
window.process = process;
window.Buffer = [];

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
