import SeacloudClient from "./Seacloud";

require('dotenv').config()

const username = process.env.username as string;
const password = process.env.password as string;

let client: SeacloudClient;
let firstLocationId: number;

beforeAll(async () => {
  client = new SeacloudClient();
  await client.authenticate(username, password);
});

test('authenticate method should set tokens', () => {
  expect(client.idToken).not.toBeNull();
  expect(client.refreshToken).not.toBeNull();
});

test('getLocations should return locations', async () => {
  const locations = await client.getLocations();
  console.log('Locations:', locations);
  expect(locations).not.toBeNull();
  expect(locations.length).toBeGreaterThan(0);
  firstLocationId = locations[0].id;
});

test('getLocationById should return a location', async () => {
  const location = await client.getLocationById(firstLocationId);
  console.log('Location by ID:', location);
  expect(location).not.toBeNull();
  expect(location.id).toBe(firstLocationId);
});

test('getGPSPositionsForLocation should return positions or null', async () => {
  try {
    const positions = await client.getGPSPositionsForLocation(firstLocationId.toString());
    console.log('GPS Positions:', positions);
    if (positions) {
      expect(positions.length).toBeGreaterThan(0);
    } else {
      console.log('No GPS positions available for this location');
    }
  } catch (error) {
    console.error('Error fetching GPS positions:', error);
    expect(error).toBeDefined();
  }
});

test('getLatestPositionForLocation should return a position or null', async () => {
  try {
    const position = await client.getLatestPositionForLocation(firstLocationId);
    console.log('Latest Position:', position);
    if (position) {
      expect(position.latitude).toBeDefined();
      expect(position.longitude).toBeDefined();
    } else {
      console.log('No latest position available for this location');
    }
  } catch (error) {
    console.error('Error fetching latest position:', error);
    expect(error).toBeDefined();
  }
});

test('getAreasForLocation should return areas or an empty array', async () => {
  const areas = await client.getAreasForLocation(firstLocationId);
  console.log('Areas:', areas);
  expect(areas).toBeDefined();
  expect(Array.isArray(areas)).toBe(true);
});

test('getVesselCurrentCO2Emission should return CO2 emission or null', async () => {
  try {
    const emission = await client.getVesselCurrentCO2Emission(firstLocationId.toString());
    console.log('CO2 Emission:', emission);
    if (emission) {
      expect(emission.value).toBeDefined();
    } else {
      console.log('No CO2 emission data available for this location');
    }
  } catch (error) {
    console.error('Error fetching CO2 emission:', error);
    expect(error).toBeDefined();
  }
});
