import axios, { AxiosInstance } from "axios";

const isServer = typeof window === "undefined";

// Create a base Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: isServer ? process.env.NEXT_PUBLIC_API_BASE_URL : window.location.origin,
  withCredentials: true, // Include cookies for cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor (optional)
apiClient.interceptors.request.use(
  (config) => {
    // Add logic here if needed, e.g., adding auth tokens
    console.log("Request sent:", config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor (optional)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;