import { API_BASE_URL } from './constants';

class SeacloudClient {
  public idToken: string | null = null;
  public refreshToken: string | null = null;
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  static async createAuthenticatedClient(username: string, password: string, baseURL: string = API_BASE_URL): Promise<SeacloudClient> {
    const client = new SeacloudClient(baseURL);
    await client.authenticate(username, password);
    return client;
  }

  async authenticate(username: string, password: string): Promise<void> {
    const response = await this.request('/authenticate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    this.idToken = response.idToken;
    this.refreshToken = response.refreshToken;
  }

  async refreshAuthentication(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available. Please authenticate first.');
    }

    const response = await this.request('/v1/authenticate/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    this.idToken = response.idToken;
    this.refreshToken = response.refreshToken;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.idToken) {
      headers['Authorization'] = `Bearer ${this.idToken}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }


  
  // Add other methods for API calls here
}

export default SeacloudClient;
