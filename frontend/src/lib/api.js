async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const requiresPasswordChange = response.status === 403 && /change your temporary password/i.test(String(data.error || ""));
    if (requiresPasswordChange) {
      localStorage.setItem("mustChangePassword", "true");
      localStorage.setItem("activeDashboardPage", "profile");
      if (sessionStorage.getItem("zonal:password-redirecting") !== "true") {
        sessionStorage.setItem("zonal:password-redirecting", "true");
        window.location.assign("/dashboard");
      }
    }
    if (response.status === 401 && path !== "/auth/login") {
      localStorage.clear();
      sessionStorage.clear();
      if (window.location.pathname !== "/") window.location.assign("/");
    }
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export const authApi = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  session: () => request("/auth/session"),
  logout: () => request("/auth/logout", { method: "POST" }),
  changeAdminPassword: (passwords) =>
    request("/admin/password", {
      method: "PATCH",
      body: JSON.stringify(passwords),
    }),
};

export const dashboardApi = {
  stats: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    const query = params.toString();
    return request(`/dashboard/stats${query ? `?${query}` : ""}`);
  },
};

export const notificationApi = {
  list: () => request('/notifications'),
  markRead: (id) => request('/notifications', { method: 'PATCH', body: JSON.stringify(id ? { id } : {}) }),
};

export const teamApi = {
  list: () => request('/teams'),
  get: (id) => request(`/teams/${id}`),
  create: (team) => request('/teams', { method: 'POST', body: JSON.stringify(team) }),
  update: (id, team) => request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(team) }),
  remove: (id) => request(`/teams/${id}`, { method: 'DELETE' }),
};

export const publicStatsApi = {
  get: () => request("/public-stats"),
};

export const propertyApi = {
  list: () => request("/properties"),
  create: (property) => request("/properties", {
    method: "POST",
    body: JSON.stringify(property),
  }),
  uploadImage: (id, image) => request(`/properties/${id}/image`, {
    method: "PUT",
    body: JSON.stringify(image),
  }),
  imageUrl: (id) => `/api/properties/${id}/image`,
  assignedAgents: (id) => request(`/properties/${id}/agents`),
};

export const propertyAssignmentApi = {
  listMine: () => request("/property-assignments"),
  select: (propertyId) => request("/property-assignments", { method: "POST", body: JSON.stringify({ propertyId }) }),
  remove: (propertyId) => request("/property-assignments", { method: "DELETE", body: JSON.stringify({ propertyId }) }),
};

export const agentApi = {
  list: () => request("/agents"),
  brsOptions: () => request("/agents/brs-options"),
  nextHlcCode: () => request("/agents/next-hlc-code"),
  create: (agent) =>
    request("/agents", {
      method: "POST",
      body: JSON.stringify(agent),
    }),
  get: (id) => request(`/agents/${id}`),
  update: (id, agent) =>
    request(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(agent),
    }),
  approve: (id) =>
    request(`/agents/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Active" }),
    }),
  changePassword: (id, passwords) =>
    request(`/agents/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify(passwords),
    }),
  resetPassword: (id) =>
    request(`/agents/${id}/reset-password`, {
      method: "POST",
    }),
  temporaryPassword: (id) => request(`/agents/${id}/temporary-password`),
  uploadPhoto: (id, photo) =>
    request(`/agents/${id}/photo`, {
      method: "PUT",
      body: JSON.stringify(photo),
    }),
  photoUrl: (id) => `/api/agents/${id}/photo`,
};

export const ayudaApi = {
  list: (agentId = '') => request(`/ayuda-loans${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`),
  create: (loan) => request('/ayuda-loans', { method: 'POST', body: JSON.stringify(loan) }),
  recordPayment: (payment) => request('/ayuda-loans', { method: 'POST', body: JSON.stringify({ ...payment, action: 'payment' }) }),
};

export const agentTaxApi = {
  list: () => request('/agents/tax-rates'),
};

export const developerApi = {
  list: () => request("/developers"),
  create: (developer) =>
    request("/developers", {
      method: "POST",
      body: JSON.stringify(developer),
    }),
  update: (id, developer) =>
    request(`/developers/${id}`, {
      method: "PUT",
      body: JSON.stringify(developer),
    }),
  delete: (id) =>
    request(`/developers/${id}`, {
      method: "DELETE",
    }),
};

export const brsApi = {
  list: () => request("/brs"),
  nextNumber: () => request("/brs/next-number"),
  create: (record) =>
    request("/brs", {
      method: "POST",
      body: JSON.stringify(record),
    }),
  get: (id) => request(`/brs/${id}`),
  update: (id, record) =>
    request(`/brs/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
    }),
  patch: (id, patch) =>
    request(`/brs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  listAttachments: (id) => request(`/brs/${id}/attachments`),
  uploadAttachment: (id, attachment) =>
    request(`/brs/${id}/attachments`, {
      method: "POST",
      body: JSON.stringify(attachment),
    }),
  attachmentUrl: (id, attachmentId) =>
    `/api/brs/${id}/attachments/${attachmentId}`,
};

export const voucherApi = {
  list: () => request("/commission-vouchers"),
  create: (record) =>
    request("/commission-vouchers", {
      method: "POST",
      body: JSON.stringify(record),
    }),
  patch: (id, patch) =>
    request(`/commission-vouchers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  delete: (id) =>
    request(`/commission-vouchers/${id}`, {
      method: "DELETE",
    }),
};

export const computationApi = {
  list: () => request("/commission-computations"),
  create: (record) =>
    request("/commission-computations", {
      method: "POST",
      body: JSON.stringify(record),
    }),
  update: (id, record) =>
    request(`/commission-computations/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
    }),
};
