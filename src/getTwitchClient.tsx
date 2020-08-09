import chalk from "chalk";
import TwitchClient, { AccessToken, RefreshableAuthProvider, StaticAuthProvider } from "twitch";

import writeConfig from "./writeConfig";

import type { Config, UserInfo } from "./Types";

const clients: {
  [username: string]: TwitchClient;
} = {};

function updateUserConfig(userInfo: UserInfo, config: Config, configPath: string) {
  console.log(chalk.bold.yellow("User access tokens refreshed to avoid expiry."));
  config.KNOWN_USERS[userInfo.username] = userInfo;
  writeConfig(configPath, config);
}

/**
 * Return a Twitch API Client with the given authorization credentials. The client
 * will automatically update access tokens if the user's credentials have expired.
 */
export default function getTwitchClient(config: Config, configPath: string, username: string) {
  if (clients[username] != null) return clients[username];

  const userInfo = config.KNOWN_USERS[username];
  if (userInfo == null) {
    console.error(chalk.bold.red(`User '${username}' is not currently known.`));
    return false;
  }
  const { userId } = userInfo;

  const { accessToken, refreshToken } = userInfo;
  if (accessToken == null) {
    console.error(
      chalk.bold.red(
        `User '${username}' is missing an accessToken. Re-authorize the user before continuing`,
      ),
    );
    return false;
  }
  if (refreshToken == null) {
    console.error(
      chalk.bold.red(
        `User '${username}' is missing a refreshToken. Re-authorize the user before continuing`,
      ),
    );
    return false;
  }

  const clientId = config.TWITCH_CLIENT_ID;
  const clientSecret = config.TWITCH_CLIENT_SECRET;

  const authProvider = new RefreshableAuthProvider(new StaticAuthProvider(clientId, accessToken), {
    clientSecret,
    refreshToken,
    onRefresh: ({ accessToken, refreshToken }) => {
      updateUserConfig({ username, userId, accessToken, refreshToken }, config, configPath);
    },
  });
  const client = new TwitchClient({ authProvider });

  clients[username] = client;
  return client;
}