// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// StrictMode 임시 비활성화 - 웹소켓 중복 연결 방지
createRoot(document.getElementById("root")!).render(<App />);
