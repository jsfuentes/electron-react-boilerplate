import { default as axiosBase } from "axios";

const isProd = process.env.NODE_ENV === "production";

const backendURL = isProd
  ? "https://www.slingshow.com/api"
  : "http://localhost:3001/api";

const axios = axiosBase.create({
  baseURL: backendURL,
  timeout: 10000
});

import Store from "electron-store";

const store = new Store();

export { axios, store, backendURL };
