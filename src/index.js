import React from "react";
import ReactDOM from "react-dom";
import axios from 'axios';
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { AuthProvider } from "./react-bff-auth";

axios.defaults.headers['x-csrf-token'] = 'wemustsendsomething';
if (process.env.NODE_ENV !== 'production') {
  axios.defaults.baseURL = 'http://localhost:3000'; // comment out for prod!!!
  axios.defaults.withCredentials = true;
}

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
