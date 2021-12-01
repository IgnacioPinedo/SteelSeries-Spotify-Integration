'use strict';

var express = require('express');
var axios = require('axios');
const fs = require('fs');

let rawCredentialsData = fs.readFileSync('credentials.json');
let credentials = JSON.parse(rawCredentialsData);

var redirect_uri = 'http://localhost:3000/callback';

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/login', function (req, res) {
  var scope = 'user-read-currently-playing user-read-playback-state';

  return res.redirect(
    'https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: credentials.clientId,
        scope: scope,
        redirect_uri: redirect_uri,
      }).toString(),
  );
});

app.get('/callback', async (req, res) => {
  var code = req.query.code || null;

  const params = new URLSearchParams({
    code: code,
    redirect_uri: redirect_uri,
    grant_type: 'authorization_code',
  });

  const axiosOptions = {
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    auth: {
      username: credentials.clientId,
      password: credentials.clientSecret,
    },
    data: params.toString(),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  };

  try {
    const response = await axios(axiosOptions);

    fs.writeFileSync(
      'tokens.json',
      JSON.stringify({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      }),
    );

    return res.redirect(
      '/?' +
        new URLSearchParams({
          success: true,
        }).toString(),
    );
  } catch (error) {
    return res.redirect(
      '/#' +
        new URLSearchParams({
          success: false,
          error: 'invalid_token',
        }).toString(),
    );
  }
});

app.listen(3000);
