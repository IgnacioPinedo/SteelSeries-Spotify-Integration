'use strict';

const gamesense = require('gamesense-client');
const helpers = require('./helpers');

/*AUTH*/

const endpoint = new gamesense.ServerEndpoint();

endpoint.discoverUrl();

const game = new gamesense.Game(
  'SPOTIFY_INTEGRATION',
  'Spotify Integration',
  'Ignacio Pinedo',
  1000,
);

const client = new gamesense.GameClient(game, endpoint);

const PlayingMusicEvent = new gamesense.GameEvent('PLAYING');
PlayingMusicEvent.value_optional = true;
const PausedMusicEvent = new gamesense.GameEvent('PAUSED');
PausedMusicEvent.value_optional = true;

client
  .registerGame()
  .then(bindPlayingMusicHandler)
  .then(bindPausedMusicHandler)
  .then(startMusicEventUpdates)
  .catch(function (error) {
    console.log(error);
  });

function bindPlayingMusicHandler() {
  const screenEventHandler = new gamesense.ScreenEventHandler('screened');

  const musicNameLine = new gamesense.LineData(false);
  musicNameLine.context_frame_key = 'MUSIC_NAME';

  const authorNameLine = new gamesense.LineData(false);
  authorNameLine.context_frame_key = 'AUTHOR_NAME';

  const multiLineFrame = new gamesense.MultiLineFrame([musicNameLine, authorNameLine]);
  multiLineFrame.frame_modifiers = {
    icon_id: gamesense.EventIcon.PLAY,
  };

  screenEventHandler.datas = [multiLineFrame];

  return client.bindEvent(PlayingMusicEvent, [screenEventHandler]);
}

function bindPausedMusicHandler() {
  const screenEventHandler = new gamesense.ScreenEventHandler('screened');

  const musicNameLine = new gamesense.LineData(false);
  musicNameLine.context_frame_key = 'MUSIC_NAME';

  const authorNameLine = new gamesense.LineData(false);
  authorNameLine.context_frame_key = 'AUTHOR_NAME';

  const multiLineFrame = new gamesense.MultiLineFrame([musicNameLine, authorNameLine]);
  multiLineFrame.frame_modifiers = {
    icon_id: gamesense.EventIcon.PAUSE,
  };

  screenEventHandler.datas = [multiLineFrame];

  return client.bindEvent(PausedMusicEvent, [screenEventHandler]);
}

function startMusicEventUpdates() {
  setInterval(updateMusicEvent, 500);
}

async function updateMusicEvent() {
  const res = await helpers.request({
    method: 'get',
    url: 'https://api.spotify.com/v1/me/player',
  });

  let names;

  if (res.status === 204) {
    // NOT PLAYING ANYTHING
    names = helpers.getNames();
    PausedMusicEvent.frame = {
      MUSIC_NAME: names.musicName,
      AUTHOR_NAME: names.authorName,
    };
    client.sendGameEventUpdate(PausedMusicEvent);
  } else if (res.status === 200) {
    // PLAYING SOMETHING
    const data = res.data;
    const item = data.item;
    names = helpers.getNames(item.name, item.artists[0].name);
    if (data.is_playing) {
      PlayingMusicEvent.frame = {
        MUSIC_NAME: names.musicName,
        AUTHOR_NAME: names.authorName,
      };
      client.sendGameEventUpdate(PlayingMusicEvent);
    } else {
      PausedMusicEvent.frame = {
        MUSIC_NAME: names.musicName,
        AUTHOR_NAME: names.authorName,
      };
      client.sendGameEventUpdate(PausedMusicEvent);
    }
  }
}
