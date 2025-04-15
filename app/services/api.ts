interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters if they exist
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      // Check if response is empty
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, "GET", undefined, options);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, "POST", data, options);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, "PUT", data, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, "DELETE", undefined, options);
  }
}

// Create and export a default instance
const api = new ApiService();
export default api;

// Allow creating custom instances for specific base URLs
export const createApiService = (baseUrl: string) => new ApiService(baseUrl);
