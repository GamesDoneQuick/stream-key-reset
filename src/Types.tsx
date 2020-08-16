export type UserInfo = {
  username: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: Date | string | null;
};

export type Config = {
  TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;
  TWITCH_ACCESS_TOKEN?: string;
  OAUTH_HTTP_LISTEN_PORT: number;
  KNOWN_USERS: { [username: string]: UserInfo };
};
