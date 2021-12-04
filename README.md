# SteelSeries Spotify Integration
Hello, if you've reached this page, than that probably means you have a steelseries screened device and would like to integrate your spotify songs.

A little bit about me: I'm a software developer who loves games! That makes me able to create stuff like this and try to make it easier as possible for non-developer to run this apps.

## Spotify Setup

So, the first thing you need to do is create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications). If there is any help you need, here's a [Guide from Spotify](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/) on how to create it.

Please take note of the `Client ID` and the `Client Secret` from the Application Dashboard.

On the setup you'll also have add to following Redirect URI: `http://localhost:3000/callback`. This is so when you're done authenticating it take you back to your local website.

## Credentials Setup

Alright, next step is to copy and paste the file named [`credentials-template.json`](https://github.com/IgnacioPinedo/SteelSeries-Spotify-Integration/blob/main/credentials-template.json) and change it's name to `credentials.json`. After that go inside tha file and replace the `CLIENTE ID HERE` and the `CLIENTE SECRET HERE` strings with the credentials you got from the Application Dashboard in the step above.

## App Setup

Almost there, now open the command line, navigate to the folder the files are at and run the following commands:

```
npm i
```

```
npm run setup
```

If you need any help in using the command line, here's a [quick guide](https://towardsdatascience.com/a-quick-guide-to-using-command-line-terminal-96815b97b955).

This command will open a local website on your machine so you can authenticate to your app and get the user credentials.

Head over to your browser and and go to [`http://localhost:3000/`](http://localhost:3000/) and click the `Log in with Spotify` button. It should take you to the spotify login, if you're not already logged in, and then to a page to authorize the app to get your currently playing track. Just allow it head back to the command line and stop the local website by clicking `Ctrl + C`.

## Running

Alright, now everything is ready. The only thing left to do is actually run the program and listen you your music!

Just run the following command:

```
npm run start
```

## Shutting down and re-running the app

To shut the app down, you have have to close the app by going back to the command line and clicking `Ctrl + C`.

To re-run the app, since we already have all the credentials stored in your folder, just go ahead and navigate back to the folder on the command line and run the following command:

```
npm run start
```