# stream-key-reset

A command line utility for quickly fetching and reseting stream keys for any number of Twitch channels.

## Installation

This program is built using NodeJS. Any version higher than `10.0.0` should work fine.

After downloading this repository, run `yarn install` (or `npm install` if you prefer) to bring in all of the necessary dependencies, then run `yarn build` to compile the program into a runnable state (a `dist` folder should appear after running this command).

## Setup

You will need some initial configuration to be able to run the utility at all. Namely a Client ID and Client Secret from [Twitch's documentation](https://dev.twitch.tv/docs/v5#getting-a-client-id).

Copy `config/development.example.json` to a new file called `config/production.json` and replace `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` with the information from your Twitch application.

That's it for setup!

## Usage

This project includes a bash script wrapper for the utility, so if you are on a Unix-like shell, you should be able to invoke the utility just by running:

```shell
./stream-key-reset
```

On Windows, you will have to run the utility through the `node` executable:

```shell
node ./stream-key-reset
```

With that command alone, it will give you usage instructions as a help document.

#### `auth`

To start managing the stream keys for a user, you will need to authorize them first. The utility provides an `auth` command to do this automatically:

```
./stream-key-reset auth my_username
```

Running this will open a browser window to the Twitch authorization page. Make sure you are logged in as the correct user before authorizing! After you click the Authorize button, you will get redirect, and then you can close the window.

When you come back to the terminal, you should see a success message saying the application can now manage stream keys for that user.

#### `revoke`

If you no longer need to manage the stream keys for a user, run the `revoke` command to remove the application's authorization to that account. Authorizations will naturally expire after some period of time, but it is safer to manually revoke them when you know they will no longer be needed.

```
./stream-key-reset revoke my_username
```

This will also remove the local user information to avoid trying to reset or fetch stream keys for that user in the future.

#### `reset`

To force Twitch to reset the stream key for a user, run the `reset` command. Immediately after success, the previously existing stream key will no longer work.

```
./stream-key-reset reset my_username
```

This command will also return the new stream key for that user and display it in the terminal.

#### `fetch`

To quickly retrieve the current key for a user, run the `fetch` command.

```
./stream-key-reset fetch my_username
```

This will print out the stream key in the terminal.

## Development

Run `yarn install` (or `npm install` if you prefer) to pick up all of the development dependencies, and then you should be good to go!

You can run `yarn build --watch` to have the typescript compiler watch your files as you change them and immediately recompile. Since the `./stream-key-reset` script is just a wrapper, you can quickly compile and then use the command like normal with new code.

For testing purposes, you can also run `NODE_ENV=development ./stream-key-reset ...` to use a development environment configuration instead and avoid populating production data while working on features.
