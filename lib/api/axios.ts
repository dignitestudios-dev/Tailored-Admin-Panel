import axios from "axios";

export const baseURL = "https://api.staging.ai-tailored.com";

const headers = {
  "Content-Type": "application/json",
};

// Create an Axios instance
export const API = axios.create({
  baseURL: baseURL,
  timeout: 10000, // Set a timeout (optional)
  headers: headers,
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error?.response?.status;
    const requestUrl = error?.config?.url ?? "";
    const isAuthEndpointRequest =
      requestUrl.includes("/admin/login") ||
      requestUrl.includes("/admin/forgot-password") ||
      requestUrl.includes("/admin/reset-password") ||
      requestUrl.includes("/admin/verify");

    if (
      statusCode === 401 &&
      typeof window !== "undefined" &&
      !isAuthEndpointRequest
    ) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authEmail");
      window.location.href = "/auth/login";
    }
    console.log(error);
    console.log("API Error:", error.response?.data || error);
    return Promise.reject(error);
  }
);
