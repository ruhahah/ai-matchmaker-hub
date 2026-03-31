import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize demo data
import { initializeDemoData } from './lib/supabase';
initializeDemoData();

createRoot(document.getElementById("root")!).render(<App />);
