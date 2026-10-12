// API Client & Service Gateway for VeriSource AI

const API_BASE = '/api';

// Retrieve stored token
export const getToken = () => localStorage.getItem('verisource_token');
export const setToken = (token) => {
  if (token) localStorage.setItem('verisource_token', token);
  else localStorage.removeItem('verisource_token');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('verisource_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('verisource_user', JSON.stringify(user));
  else localStorage.removeItem('verisource_user');
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || (data.details && data.details.join(', ')) || `HTTP ${response.status} Error`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
};

export const authApi = {
  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (fullName, email, password) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
  },
  getMe: async () => {
    return request('/auth/me');
  },
  updateProfile: async (payload) => {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

export const verificationApi = {
  submitText: async (text) => {
    return request('/verifications/text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
  submitUrl: async (url) => {
    return request('/verifications/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
  submitFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/verifications/file', {
      method: 'POST',
      body: formData,
    });
  },
  getById: async (id) => {
    return request(`/verifications/${id}`);
  },
  getStatus: async (id) => {
    return request(`/verifications/${id}/status`);
  },
  listUserVerifications: async (status, query) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (query) params.append('query', query);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return request(`/verifications${qStr}`);
  },
  delete: async (id) => {
    return request(`/verifications/${id}`, {
      method: 'DELETE',
    });
  },
};

export const dashboardApi = {
  getSummary: async () => {
    return request('/dashboard/summary');
  },
  getActivity: async () => {
    return request('/dashboard/activity');
  },
};

export const adminApi = {
  getUsers: async () => {
    return request('/admin/users');
  },
  updateUserStatus: async (userId, status, role) => {
    return request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, role }),
    });
  },
  getAllVerifications: async (status, query) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (query) params.append('query', query);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return request(`/admin/verifications${qStr}`);
  },
  getSystemSummary: async () => {
    return request('/admin/analytics/summary');
  },
  getAllSources: async (query) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return request(`/admin/sources${qStr}`);
  },
  getActivityLogs: async () => {
    return request('/admin/activity-logs');
  },
};
