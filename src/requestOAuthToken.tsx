// This file will only work in Node.
import http from "http";
import querystring from "querystring";
import url from "url";

import chalk from "chalk";
import got from "got";
import open from "open";

const makeCodeUrl = (clientId: string, redirectPort: number) => {
  const queryParams = querystring.stringify({
    client_id: clientId,
    redirect_uri: `http://localhost:${redirectPort}`,
    response_type: "code",
    scope: "channel_stream user_read channel_read",
  });
  return `https://id.twitch.tv/oauth2/authorize?${queryParams}`;
};

const makeAuthUrl = (
  code: string,
  redirectPort: number,
  clientId: string,
  clientSecret: string,
) => {
  const queryParams = querystring.stringify({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: `http://localhost:${redirectPort}`,
  });
  return `https://id.twitch.tv/oauth2/token?${queryParams}`;
};

async function getTokenFromAuthCode(authUrl: string) {
  const response: any = await got.post(authUrl, { responseType: "json" }).json();
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiryDate: new Date(Date.now() + response.expires_in),
  };
}

export default async function requestOAuthToken(
  clientId: string,
  clientSecret: string,
  listenPort: number,
) {
  return new Promise<{ accessToken: string; refreshToken: string; expiryDate: Date | null }>(
    (resolve) => {
      const server = http
        .createServer(async (req, res) => {
          const { query } = url.parse(req.url!, true);
          // unsafe because url.parse thinks this could be an array
          const code = query.code as string;

          resolve(
            await getTokenFromAuthCode(makeAuthUrl(code, listenPort, clientId, clientSecret)),
          );

          res.writeHead(200);
          res.write(
            "You've successfully authenticated this user. You can close this window now and return to the CLI",
          );
          res.end();
          req.connection.end();
          req.connection.destroy();
          server.close();
        })
        .listen(listenPort);

      console.log(
        chalk.green(
          "Opening Twitch Authorization Page. Make sure you are logged in with the requested account before verifying",
        ),
      );
      open(makeCodeUrl(clientId, listenPort));
    },
  );
}
