import querystring from "querystring";

import got from "got";

export default async function revokeOAuthToken(clientId: string, token: string) {
  const queryParams = querystring.stringify({
    client_id: clientId,
    token,
  });
  const response = await got.post(`https://id.twitch.tv/oauth2/revoke?${queryParams}`);
  return response.statusCode === 200;
}
