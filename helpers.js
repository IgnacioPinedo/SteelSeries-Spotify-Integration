'use strict';

const axios = require('axios');
const fs = require('fs');

let rawCredentialsData = fs.readFileSync('credentials.json');
let credentials = JSON.parse(rawCredentialsData);

const DEFAULT_MUSIC_NAME = 'Waiting for some awesome music!';
const DEFAULT_AUTHOR_NAME = '';

let currentMusicName = null;
let currentAuthorName = null;

let lastMusicName = null;
let lastAuthorName = null;

let rawTokensData = fs.readFileSync('tokens.json');
let tokens = JSON.parse(rawTokensData);

const isSameName = (S1, S2) => {
  if (S1.length != S2.length) {
    return false;
  }

  let n = S1.length;

  if (n == 0) {
    return true;
  }

  if (S1 == S2) {
    return true;
  }

  let tempArray1 = S1.split('');
  let tempArray2 = S2.split('');

  tempArray1.sort();
  tempArray2.sort();

  let copy_S1 = tempArray1.join('');
  let copy_S2 = tempArray2.join('');

  if (copy_S1 != copy_S2) {
    return false;
  }

  for (let i = 1; i < n; i++) {
    if (
      isSameName(S1.substring(0, i), S2.substring(0, i)) &&
      isSameName(S1.substring(i, i + n), S2.substring(i, i + n))
    ) {
      return true;
    }

    if (
      isSameName(S1.substring(n - i, n - i + n), S2.substring(0, i)) &&
      isSameName(S1.substring(0, n - i), S2.substring(i, i + n))
    ) {
      return true;
    }
  }
};

let helpers = {};

helpers.request = async (options) => {
  try {
    const res = await axios({
      ...options,
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    return res;
  } catch (err) {
    if (err.response.status === 401) {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
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

      const res2 = await axios(axiosOptions);
      tokens.accessToken = res2.data.access_token;
      fs.writeFileSync('tokens.json', JSON.stringify(tokens));
      return await request(options);
    } else throw err;
  }
};

helpers.getNames = (setMusicName, setAuthorName) => {
  let musicName = setMusicName || currentMusicName || DEFAULT_MUSIC_NAME;
  let authorName = setAuthorName || currentAuthorName || DEFAULT_AUTHOR_NAME;

  if (
    lastMusicName === null ||
    (setMusicName && !isSameName(`${musicName}  `, lastMusicName)) ||
    (!setMusicName && !isSameName(musicName, lastMusicName))
  ) {
    currentMusicName = `${musicName}  `;
    lastMusicName = currentMusicName;
  } else {
    lastMusicName = lastMusicName.substr(1) + lastMusicName.substr(0, 1);
    musicName = lastMusicName;
  }
  if (
    lastAuthorName === null ||
    (setAuthorName && !isSameName(`${authorName}  `, lastAuthorName)) ||
    (!setAuthorName && !isSameName(authorName, lastAuthorName))
  ) {
    currentAuthorName = `${authorName}  `;
    lastAuthorName = currentAuthorName;
  } else {
    lastAuthorName = lastAuthorName.substr(1) + lastAuthorName.substr(0, 1);
    authorName = lastAuthorName;
  }

  return {
    musicName,
    authorName,
  };
};

module.exports = helpers;
