import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StrictMode } from 'react';
import { demoDatabase } from './lib/demoDatabaseFixed';

// Initialize demo database
demoDatabase.initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
