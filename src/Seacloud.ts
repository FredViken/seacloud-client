import { API_BASE_URL } from './constants';
import {
  Location,
  LocationsResponse,
  Area,
  AreasResponse,
  Position,
  PositionsResponse,
  CO2Emission,
  Sensor,
  SensorValue,
  AggregatedSensorValue,
  SimpleArea,
} from './types';

class SeacloudClient {
  public idToken: string | null = null;
  public refreshToken: string | null = null;
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  static async createAuthenticatedClient(
    username: string,
    password: string,
    baseURL: string = API_BASE_URL,
  ): Promise<SeacloudClient> {
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

  private async request(
    endpoint: string,
    options: RequestInit & { params?: Record<string, string> } = {},
  ): Promise<any> {
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
        throw new Error(
          `API error: ${response.status} - ${response.statusText}`,
        );
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
  async getLocationById(
    locationId: number,
    includeSensorData: boolean = false,
  ): Promise<Location> {
    return this.request(`/Locations/${locationId}`, {
      method: 'GET',
      params: { includeSensorData: includeSensorData.toString() },
    });
  }

  /**
   * Get a simple list of areas with id and name for a location.
   * @param {number} locationId - The id of the location
   * @returns {Promise<AreasResponse>}
   */
  async getAreasForLocation(locationId: number): Promise<SimpleArea[]> {
    return this.request(`/Locations/${locationId}/Areas`, { method: 'GET' });
  }

  /**
   * Get a complete area with nodes and sensors for a location.
   * @param {number} locationId - The id of the location
   * @param {number} areaId - The id of the area
   * @returns {Promise<Area>}
   */
  async getAreaById(locationId: number, areaId: number): Promise<Area> {
    return this.request(`/Locations/${locationId}/Areas/${areaId}`, {
      method: 'GET',
    });
  }

  /**
   * Get the latest position for a location.
   * @param {number} locationId - The id of the location
   * @returns {Promise<Position>}
   */
  async getLatestPositionForLocation(locationId: number): Promise<Position> {
    return this.request(`/Locations/${locationId}/LatestPosition`, {
      method: 'GET',
    });
  }

  /**
   * Get a list of GPS positions for a location.
   * @param {string} locationId - The id of the location
   * @param {string} [from] - Optional start date for the position data
   * @param {string} [to] - Optional end date for the position data
   * @returns {Promise<PositionsResponse>}
   */
  async getGPSPositionsForLocation(
    locationId: string,
    from?: string,
    to?: string,
  ): Promise<PositionsResponse> {
    const params: { [key: string]: string } = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.request(`/Locations/${locationId}/Positions`, {
      method: 'GET',
      params,
    });
  }

  /**
   * Get the current CO2 emission for a location.
   * @param {string} locationId - The id of the location
   * @returns {Promise<CO2Emission>}
   */
  async getVesselCurrentCO2Emission(locationId: string): Promise<CO2Emission> {
    return this.request(`/Locations/${locationId}/VesselCurrentCo2Emission`, {
      method: 'GET',
    });
  }

  /**
   * Get a sensor by id.
   * @param {number} sensorId - The id of the sensor
   * @returns {Promise<Sensor>}
   */
  async getSensorById(sensorId: number): Promise<Sensor> {
    return this.request(`/Sensors/${sensorId}`, { method: 'GET' });
  }

  /**
   * Get aggregated sensor values from and to a specific date and time. Sensor values will be aggregated and you will get min/average/max value per interval as specified with timeIntervalInMinutes. This endpoint should be used when getting sensor data for a longer period of time (ie. more than 5-6 days) to prevent getting to many sensor values.
   * The maximum limit of sensor values returned is 10000, and requests resulting in more than this, will return a BadRequest with the message 'Too many sensor values'.
   * Aggregation and time interval must be adjusted according to the time period.
   * @param sensorId - The id of the sensor
   * @param from - Optional start date for the sensor data
   * @param to - Optional end date for the sensor data
   * @param timeInterval - The time interval in minutes for the aggregation
   * @returns {Promise<AggregatedSensorValue[]>}
   */
  async getAggregatedSensorValues(
    sensorId: number,
    from?: string,
    to?: string,
    timeInterval?: string,
  ): Promise<AggregatedSensorValue[]> {
    const params: { [key: string]: string } = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (timeInterval) params.timeIntervalInMinutes = timeInterval;
    return this.request(`/Sensors/${sensorId}/AggregatedValues`, {
      method: 'GET',
      params,
    });
  }

  /**
   * Get all sensor values from and to a specific date and time. Use this endpoint for getting historical sensor data for a shorter period of time (ie minutes/hours back to maximum 3 days).
   * Please use the aggregatedvalues endpoint for sensor data spanning longer periods of time.
   * The maximum limit of sensor values returned is 10000, and requests resulting in more than this, will return a BadRequest with the message 'Too many sensor values'.
   * @param sensorId - The id of the sensor
   * @param from - Optional start date for the sensor data
   * @param to - Optional end date for the sensor data
   * @returns {Promise<SensorValue[]>}
   */
  async getSensorValues(
    sensorId: number,
    from: string = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    to: string = new Date().toISOString(),
  ): Promise<SensorValue[]> {
    const params: { [key: string]: string } = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.request(`/Sensors/${sensorId}/Values`, {
      method: 'GET',
      params,
    });
  }

  /**
   * Get the latest sensor value.
   * @param {number} sensorId - The id of the sensor
   * @returns {Promise<SensorValue>}
   */
  async getLatestSensorValue(sensorId: number): Promise<SensorValue> {
    return this.request(`/Sensors/${sensorId}/LatestValue`, { method: 'GET' });
  }
}

export default SeacloudClient;
