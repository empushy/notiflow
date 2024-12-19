const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

export const userService = {
  // Get user's API key from localStorage
  getApiKey: () => {
    return localStorage.getItem("notiflow_api_key");
  },

  // Set user's API key in localStorage
  setApiKey: (apiKey) => {
    localStorage.setItem("notiflow_api_key", apiKey);
  },

  // Remove user's API key from localStorage
  removeApiKey: () => {
    localStorage.removeItem("notiflow_api_key");
  },

  // Get user data by email
  getUserByEmail: async (email) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/user/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      return { success: false, message: "Failed to fetch user" };
    }
  },

  // Get user's API key from backend
  getUserApiKey: async (email) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/user/${encodeURIComponent(email)}/api-key`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching user API key:", error);
      return { success: false, message: "Failed to fetch API key" };
    }
  },

  // Check if user has valid API key
  hasValidApiKey: () => {
    const apiKey = localStorage.getItem("notiflow_api_key");
    return !!apiKey;
  },

  // Logout user (clear API key)
  logout: () => {
    localStorage.removeItem("notiflow_api_key");
  },
};
