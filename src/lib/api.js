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
};

export const dashboardApi = {
  stats: () => request("/dashboard/stats"),
};

export const agentApi = {
  list: () => request("/agents"),
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
