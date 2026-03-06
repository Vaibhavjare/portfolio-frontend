import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { setupListeners } from "@reduxjs/toolkit/query";

import App from "./App";
import { store } from "./redux/store";

import "./index.css";

/* Enable RTK Query auto refetch behaviors */
setupListeners(store.dispatch);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
          }}
        />

      </BrowserRouter>
    </Provider>
  </StrictMode>
);