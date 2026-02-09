export const auth = {
  isAuthenticated: () => {
    return Boolean(localStorage.getItem("user"));
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  },

  setUser: (user:any) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem("user");
  }
};
