export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kaamsetu_token');
  }
  return null;
};

export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kaamsetu_token', token);
  }
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kaamsetu_token');
    localStorage.removeItem('kaamsetu_user');
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('kaamsetu_user');
    if (user) return JSON.parse(user);
    // Fallback: Decode from token if user string not found
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      } catch(e) { return null; }
    }
  }
  return null;
};

export const isLoggedIn = () => {
  return !!getToken();
};
