import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import Store from "./store/Store.js";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import App from "./containers/AppContainer.js";

// window.store = Store;
ReactDOM.render(
  <Provider store={Store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);


serviceWorker.unregister();
