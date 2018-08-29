const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {

  // Setup Puppeteer
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();

  // Go to URL
  const url = 'https://steamcommunity.com/id/lawrencek/';
  await page.goto(url);

  // Begin page scraping
  const gameInfo = await page.evaluate(() => {

    // Page element selectors
    const nonSteamGame = document.querySelector('.profile_in_game.in-game');
    const steamGame    = document.querySelector('.recent_games');


    ///////////////////////
    // If non-Steam game //
    ///////////////////////
    if (nonSteamGame) {

      // Get game name
      const gameName = document.querySelector('.profile_in_game_name').textContent;

      // Set game play date
      const gameDate = 'Currently playing';

      // Return game name and play date
      const gameInfo = {
        name: gameName,
        date: gameDate
      };
      const gameInfoStr = JSON.stringify(gameInfo);
      return gameInfoStr;

    }


    ///////////////////
    // If Steam game //
    ///////////////////
    else if (steamGame) {

      // Get game play date
      const gameDateSelector = document.querySelector('.recent_game:first-child .game_info_details').textContent;
      let gameDate;

      // If not currently playing a game
      if (gameDateSelector.includes('last played')) {
        const gameDateRegex = /(last played on+.*)[^\t]/g;
        gameDate = gameDateSelector.match(gameDateRegex);
        gameDate = JSON.stringify(gameDate);
        gameDate = gameDate.replace(/(\["|"\])/g, '');

      // If currently playing a game
      } else {
        gameDate = 'Currently playing';
      }

      // Get game name
      const gameName = document.querySelector('.recent_game:first-child .game_name a:first-child').textContent;

      // Return game name and play date
      const gameInfo = {
        name: gameName,
        date: gameDate
      };
      const gameInfoStr = JSON.stringify(gameInfo);
      return gameInfoStr;


    ////////////////
    // If no game //
    ////////////////
    } else {

      // Return game name and play date
      const gameInfo = {
        name: '',
        date: ''
      };
      const gameInfoStr = JSON.stringify(gameInfo);
      return gameInfoStr;

    }

  })

  // Log game info to terminal
  console.log(gameInfo);

  // Write content to JSON file
  fs.writeFile('output.json', gameInfo, _ => console.log('Content saved to output.json'));

  // Close Puppeteer
  await browser.close();

})();
