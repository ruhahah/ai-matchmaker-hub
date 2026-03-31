import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize demo data
import { localStorageDB } from './lib/useLocalStorage';
import { friendsService } from './lib/friendsService';
localStorageDB.initializeDemoData();
friendsService.initializeDemoData();

createRoot(document.getElementById("root")!).render(<App />);
