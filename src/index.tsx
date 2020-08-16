import chalk from "chalk";

import getTwitchClient from "./getTwitchClient";
import revokeOAuthToken from "./revokeOAuthToken";
import requestOAuthToken from "./requestOAuthToken";
import writeConfig from "./writeConfig";
import type { Config, UserInfo } from "./Types";

function getUserInfo(config: Config, username: string) {
  return config.KNOWN_USERS[username];
}

/**
 * Ensure that the program has usable credentials to create an API client.
 * Returns `true` if so, `false` if new credentials are needed.
 */
export async function ensureClient(config: Config, configPath: string, username: string) {
  console.log("Ensuring API credentials exist");
  const client = await getTwitchClient(config, configPath, username);
  if (client === false) {
    console.error(chalk.red("Could not create a Twitch API client"));
    process.exit(-1);
  }

  return client;
}

export async function authorize(config: Config, configPath: string, username: string) {
  const { accessToken, refreshToken, expiryDate } = await requestOAuthToken(
    config.TWITCH_CLIENT_ID,
    config.TWITCH_CLIENT_SECRET,
    config.OAUTH_HTTP_LISTEN_PORT,
  );

  console.log(chalk.blue("Verifying that the correct user was authorized"));
  const userConfig: UserInfo = { username, userId: "temp", accessToken, refreshToken, expiryDate };
  const tempConfig = {
    ...config,
    KNOWN_USERS: {
      [username]: userConfig,
    },
  };
  const client = await ensureClient(tempConfig, configPath, username);
  const { displayName, id } = await client.kraken.users.getMe();
  if (displayName !== username) {
    console.log(
      chalk.red(
        `Provided username (${chalk.bold(
          username,
        )}) does not match username from authorization token (${chalk.bold(displayName)}).\n` +
          `Check that you are logged in as the correct user before authorizing on Twitch.`,
      ),
    );
    return false;
  }
  userConfig.userId = id;

  config.KNOWN_USERS[username] = userConfig;
  writeConfig(configPath, config);

  console.log(
    chalk.bold(
      `Successfully authorized '${username}'. This app can now reset stream keys for them.`,
    ),
  );
}

export async function revoke(config: Config, configPath: string, username: string) {
  const userInfo = config.KNOWN_USERS[username];
  if (userInfo == null) {
    console.error(chalk.red(`User '${username}' is not currently known. Nothing to do`));
    return false;
  }
  const { accessToken } = userInfo;
  if (accessToken == null) {
    console.error(chalk.red(`User '${username}' has no saved token. Cannot revoke`));
    return false;
  }

  console.log(chalk.blue(`Revoking token for ${username}`));
  const succeeded = await revokeOAuthToken(config.TWITCH_CLIENT_ID, accessToken);
  if (!succeeded) {
    console.error(chalk.red(`Failed to revoke token for ${username}.`));
    return false;
  }

  console.log(chalk.green(`Successfully revoked token for '${username}'`));

  delete config.KNOWN_USERS[username];
  writeConfig(configPath, config);
}

export async function reset(config: Config, configPath: string, username: string) {
  const client = await ensureClient(config, configPath, username);
  const { userId } = getUserInfo(config, username);

  const channel = await client.kraken.channels.resetChannelStreamKey(userId).catch((err) => {
    console.log(chalk.red(`Failed to reset stream key for '${username}'`));
    console.error(err);
    return;
  });
  if (channel == null) return;

  console.log(chalk.green(`Successfully reset stream key for '${username}'`));
  console.log(`New stream key for '${username}' is: ${chalk.bold(channel.stream_key)}`);
}

export async function fetchStreamKey(config: Config, configPath: string, username: string) {
  const client = await ensureClient(config, configPath, username);

  const channel = await client.kraken.channels.getMyChannel().catch((err) => {
    console.log(chalk.red(`Failed to fetch stream key for '${username}'`));
    console.error(err);
    return;
  });
  if (channel == null) return;

  console.log(
    chalk.green(`Current stream key for '${username}' is: ${chalk.bold(channel.streamKey)}`),
  );
}
