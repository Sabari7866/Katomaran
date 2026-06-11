import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// URL endpoints
export const getUrls = async (page = 1, limit = 10) => {
  const response = await api.get(`/urls?page=${page}&limit=${limit}`);
  return response.data;
};

export const createUrl = async (urlData) => {
  const response = await api.post("/urls", urlData);
  return response.data;
};

export const deleteUrl = async (urlId) => {
  const response = await api.delete(`/urls/${urlId}`);
  return response.data;
};

export const updateUrl = async (urlId, urlData) => {
  const response = await api.put(`/urls/${urlId}`, urlData);
  return response.data;
};

// Analytics endpoints
export const getDashboardSummary = async () => {
  const response = await api.get("/analytics/dashboard/summary");
  return response.data;
};

export const getUrlAnalytics = async (urlId) => {
  const response = await api.get(`/analytics/${urlId}`);
  return response.data;
};
