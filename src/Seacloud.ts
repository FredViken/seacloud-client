import { API_BASE_URL } from './constants';
import { Location, LocationsResponse, Area, AreasResponse, Position, PositionsResponse, CO2Emission } from './types';

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
  /**
   * Authenticate with the Seacloud API.
   * @param {string} username - The username
   * @param {string} password - The password
   */
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

    const response = await this.request('/authenticate/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    this.idToken = response.idToken;
    this.refreshToken = response.refreshToken;
  }

  private async request(endpoint: string, options: RequestInit & { params?: Record<string, string> } = {}): Promise<any> {
    try {
      let url = `${this.baseURL}${endpoint}`;
      
      // Add query parameters if they exist
      if (options.params) {
        const queryParams = new URLSearchParams(options.params).toString();
        url += `?${queryParams}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.idToken) {
        headers['Authorization'] = `Bearer ${this.idToken}`;
      }

      const { params, ...fetchOptions } = options;
      const response = await fetch(url, { ...fetchOptions, headers });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  /**
   * Get a list of all locations.
   * @returns {Promise<LocationsResponse>}
   */
  async getLocations(): Promise<LocationsResponse> {
    return this.request('/Locations', { method: 'GET' });
  }

  /**
   * Get a location complete with areas, nodes and sensors.
   * @param {number} locationId - The id of the location
   * @param {boolean} includeSensorData - Whether to include sensor data
   * @returns {Promise<Location>}
   */
  async getLocationById(locationId: number, includeSensorData: boolean = false): Promise<Location> {
    return this.request(`/Locations/${locationId}`, { 
      method: 'GET',
      params: { includeSensorData: includeSensorData.toString() }
    });
  }

  /**
   * Get a simple list of areas with id and name for a location.
   * @param {number} locationId - The id of the location
   * @returns {Promise<AreasResponse>}
   */
  async getAreasForLocation(locationId: number): Promise<AreasResponse> {
    return this.request(`/Locations/${locationId}/Areas`, { method: 'GET' });
  }

  /**
   * Get a complete area with nodes and sensors for a location.
   * @param {number} locationId - The id of the location
   * @param {number} areaId - The id of the area
   * @returns {Promise<Area>}
   */
  async getAreaById(locationId: number, areaId: number): Promise<Area> {
    return this.request(`/Locations/${locationId}/Areas/${areaId}`, { method: 'GET' });
  }

  /**
   * Get the latest position for a location.
   * @param {number} locationId - The id of the location
   * @returns {Promise<Position>}
   */
  async getLatestPositionForLocation(locationId: number): Promise<Position> {
    return this.request(`/Locations/${locationId}/LatestPosition`, { method: 'GET' });
  }

  /**
   * Get a list of GPS positions for a location.
   * @param {string} locationId - The id of the location
   * @param {string} [from] - Optional start date for the position data
   * @param {string} [to] - Optional end date for the position data
   * @returns {Promise<PositionsResponse>}
   */
  async getGPSPositionsForLocation(locationId: string, from?: string, to?: string): Promise<PositionsResponse> {
    const params: { [key: string]: string } = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.request(`/Locations/${locationId}/Positions`, { method: 'GET', params });
  }

  /**
   * Get the current CO2 emission for a location.
   * @param {string} locationId - The id of the location
   * @returns {Promise<CO2Emission>}
   */
  async getVesselCurrentCO2Emission(locationId: string): Promise<CO2Emission> {
    return this.request(`/Locations/${locationId}/VesselCurrentCo2Emission`, { method: 'GET' });
  }

  // Add other methods for API calls here
}

export default SeacloudClient;
