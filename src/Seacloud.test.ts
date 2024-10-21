import SeacloudClient from "./Seacloud";

require('dotenv').config()

const username = process.env.username as string;
const password = process.env.password as string;


test('authenticate method should set tokens', async () => {
  
  const client = new SeacloudClient();
  await client.authenticate(username, password);
  expect(client.idToken).not.toBeNull();
  expect(client.refreshToken).not.toBeNull();
});
