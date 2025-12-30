import type { DataProvider } from '@refinedev/core';

const API_URL = '/api';

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};

    const queryParams = new URLSearchParams();
    queryParams.set('page', String(current));
    queryParams.set('pageSize', String(pageSize));

    // Apply filters
    if (filters) {
      filters.forEach((filter) => {
        if ('field' in filter && filter.value !== undefined) {
          queryParams.set(filter.field, String(filter.value));
        }
      });
    }

    // Apply sorters
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      queryParams.set('sortBy', sorter.field);
      queryParams.set('sortOrder', sorter.order);
    }

    const response = await fetch(`${API_URL}/${resource}?${queryParams.toString()}`);
    const data = await response.json();

    return {
      data: data.data,
      total: data.total,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const response = await fetch(`${API_URL}/${resource}/${id}`);
    const data = await response.json();

    return {
      data: data.data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const response = await fetch(`${API_URL}/${resource}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Create failed');
    }

    return {
      data: data.data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Update failed');
    }

    return {
      data: data.data,
    };
  },

  deleteOne: async ({ resource, id, meta }) => {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Delete failed');
    }

    return {
      data: data.data,
    };
  },

  getApiUrl: () => API_URL,

  // Custom methods for specific operations
  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    const requestUrl = new URL(`${API_URL}${url}`, window.location.origin);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        requestUrl.searchParams.set(key, String(value));
      });
    }

    const response = await fetch(requestUrl.toString(), {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return {
      data,
    };
  },
};
