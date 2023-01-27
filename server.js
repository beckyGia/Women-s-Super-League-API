// REQUIRED DEPENDENCIES
const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 4000;

// ACCESS TO API DATA
const { wslGeneralInfo } = require("./wsl-general-info");
const { wslGeneralClubInfo } = require("./general-wsl-clubs-info");
const { generalWslStats } = require("./general-wsl-stats");
const { clubWslStats } = require("./specific-club-stats");
const { specificPlayerStats } = require("./specific-player-stats");

// MIDDLEWARE
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());

//// ROUTES

app.get("/", (req, res) => {
  res.json("This is my webscraper");
});

//General Information About WSL and its history
app.get("/api/info", (req, res) => {
  res.json(wslGeneralInfo);
});

//General Information of Current WSL Clubs and their players
app.get("/api/clubs", (req, res) => {
  res.json(wslGeneralClubInfo);
});

app.get("/api/clubs/:name", (req, res) => {
  let matchingClubs = [];
  const queryText = req.params.name.toLowerCase();
  for (let name in wslGeneralClubInfo) {
    if (name.includes(queryText)) matchingClubs.push(wslGeneralClubInfo[name]);
  }
  res.json(matchingClubs);
});

app.get("/api/clubs/:name/playerInfo", (req, res) => {
  let matchingClubs = [];
  const queryText = req.params.name.toLowerCase();
  for (let name in wslGeneralClubInfo) {
    if (name.includes(queryText))
      matchingClubs.push(wslGeneralClubInfo[name].playerInfo);
  }
  res.json(matchingClubs);
});

//General Information about current WSL Clubs Stats
app.get("/api/stats", (req, res) => {
  res.json(generalWslStats);
});

app.get("/api/stats/:name", (req, res) => {
  let matchingClubs = [];
  let words = req.params.name.split(" ");
  const queryText = words
    .map((w) => w[0].toUpperCase() + w.substring(1))
    .join(" ");

  generalWslStats.find((o) => {
    if (o.clubName.includes(queryText)) {
      matchingClubs.push(o);
    }
  });
  res.json(matchingClubs);
});

//get general stats about current wsl players based on clubs
app.get("/api/clubstats", (req, res) => {
  res.json(clubWslStats);
});

app.get("/api/clubstats/:name", (req, res) => {
  let matchingClubs = [];
  const queryText = req.params.name.toLowerCase();
  for (let name in clubWslStats) {
    if (name.includes(queryText)) matchingClubs.push(clubWslStats[name]);
  }
  res.json(matchingClubs);
});

app.get("/api/clubstats/:name/player", (req, res) => {
  let matchingClubs = [];
  const queryText = req.params.name.toLowerCase();
  for (let name in clubWslStats) {
    if (name.includes(queryText)) matchingClubs.push(clubWslStats[name].player);
  }
  res.json(matchingClubs);
});

app.get("/api/clubstats/:name/player/:pName", (req, res) => {
  let matchingClubs;
  const queryText = req.params.name.toLowerCase();
  for (let name in clubWslStats) {
    if (name.includes(queryText)) matchingClubs = clubWslStats[name].player;
  }

  let words = req.params.pName.split(" ");
  const pName = words.map((w) => w[0].toUpperCase() + w.substring(1)).join(" ");

  let player = [];
  matchingClubs.find((o) => {
    if (o.name.includes(pName)) {
      player.push(o);
    }
  });

  res.json(player);
});

//get specific player stats in comparison to other players in the same position
app.get("/api/specific", (req, res) => {
  res.json(specificPlayerStats);
});

app.get("/api/specific/:name", (req, res) => {
  let matchingPlayers = [];
  let words = req.params.name.split(" ");
  const queryText = words
    .map((w) => w[0].toUpperCase() + w.substring(1))
    .join(" ");

  specificPlayerStats.find((o) => {
    if (o.name.includes(queryText)) {
      matchingPlayers.push(o);
    }
  });

  res.json(matchingPlayers);
});

// LISTEN
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server now running on port ${PORT}`);
});

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////// WEB SCRAPER

//stores info about the clubs currently in the Women's Super League(WSL) and general info about the WSL
const clubInfo = {};
let clubTeamNamesUrl = [];
let teams;
let teamsArr = [];
let generalData;

//stores team and play stats
let clubTeamNamesStatsUrl = [];
let clubStats = {};
let generalWSLStats;
let WSLStats;

//stores individualized stats
let individualPlayerStatsUrl = [];
let clubPlayers = {};
let clubPlayersComparison = [];

///UNCOMMENT FUNCTION TO SCAPE VARIOUS SITES FOR WSL LEAGUE DATA

// scrapeData();

async function scrapeData() {
  // let data = await buildGeneralWSLInfo();
  // let done = await buildClubInfoUrl();
  // let log = await buildClubInfo();
  // let lag = await buildGeneralWslStats();
  // let lang = await buildWslStatsURL();
  // let same = await buildClubPlayerStats();
  // let dam = await buildIndividualPlayerStatsURL();
  // let build = await buildIndividualComparisonPlayerStats();
  writeDataIntoFile();
  console.log("SCRAPING COMPLETE!");
}

// buildIndividualPlayerStatsURL();
// buildIndividualComparisonPlayerStats();
// writeDataIntoFile();

//build out the club team names array
async function buildGeneralWSLInfo() {
  const teamNamesURL = "https://en.wikipedia.org/wiki/Women%27s_Super_League";
  try {
    //axois gets html data from a website
    let res = await axios(teamNamesURL);
    const html = res.data;
    //cheerio allows us to parse through html pick out elements
    const $ = cheerio.load(html);
    //get elements with general info about the WS
    let firstPara = $(
      "#mw-content-text > div.mw-parser-output > p:nth-child(8)"
    )
      .text()
      .trim();
    let secondPara = $(
      " #mw-content-text > div.mw-parser-output > p:nth-child(9)"
    )
      .text()
      .trim();
    let thirdPara = $(
      "#mw-content-text > div.mw-parser-output > p:nth-child(10)"
    )
      .text()
      .trim();
    let fourthPara = $(
      " #mw-content-text > div.mw-parser-output > p:nth-child(11)"
    )
      .text()
      .trim();
    let fifthPara = $(
      "#mw-content-text > div.mw-parser-output > p:nth-child(12)"
    )
      .text()
      .trim();
    let paragraph = [firstPara, secondPara, thirdPara, fourthPara, fifthPara];

    let generalFacts = {};

    generalFacts.generalInfo = paragraph;

    let logo = $(
      "#mw-content-text > div.mw-parser-output > table.infobox > tbody > tr:nth-child(1) > td"
    )
      .find("a")
      .attr("href");

    generalFacts.wslLogo = `https://en.wikipedia.org${logo}`;

    $(
      " #mw-content-text > div.mw-parser-output > table.infobox > tbody > tr",
      html
    ).each(function () {
      let headings = $(this).find("th").first().text();

      if (headings.includes("Founded")) {
        let found = $(this).find("td").text();
        generalFacts.founded = found;
      } else if (headings.includes("First season")) {
        let found = $(this).find("td").text();
        generalFacts.firstSeason = found;
      } else if (headings.includes("Country")) {
        let found = $(this).find("td").text();
        generalFacts.country = found;
      } else if (headings.includes("Confederation")) {
        let found = $(this).find("td").text();
        generalFacts.confederation = found;
      } else if (headings.includes("Number of teams")) {
        let found = $(this).find("td").text();
        generalFacts.numberOfTeams = found;
      } else if (headings.includes("Level on pyramid")) {
        let found = $(this).find("td").text();
        generalFacts.levelOnPyramid = found;
      } else if (headings.includes("Relegation to")) {
        let found = $(this).find("td").text();
        generalFacts.relegationTo = found;
      } else if (headings.includes("Domestic cup(s)")) {
        let found = $(this).find("td").text();
        generalFacts.domesticCups = found;
      } else if (headings.includes("League cup(s)")) {
        let found = $(this).find("td").text();
        generalFacts.leagueCups = found;
      } else if (headings.includes("International cup(s)")) {
        let found = $(this).find("td").text();
        generalFacts.internationalCups = found;
      } else if (headings.includes("Current champions")) {
        let found = $(this).find("td").text();
        generalFacts.currentChampions = found;
      } else if (headings.includes("Most championships")) {
        let found = $(this)
          .find("td")
          .find("a")
          .attr("href")
          .replace("/wiki/", "")
          .replace(/_/gi, " ");
        generalFacts.mostChampionships = found;
      } else if (headings.includes("Website")) {
        let found = $(this).find("td").find("a").attr("href");
        generalFacts.website = found;
      }
    });
    generalData = generalFacts;
    // console.log(generalData);
  } catch (err) {
    console.log(err);
  }
}

//Build the Website URLs for looking up basic data
async function buildClubInfoUrl() {
  const teamNamesURL = "https://en.wikipedia.org/wiki/Women%27s_Super_League";
  try {
    let res = await axios(teamNamesURL);
    const html = res.data;
    const $ = cheerio.load(html);

    $(
      "#mw-content-text > div.mw-parser-output > table:nth-child(34) > tbody > tr",
      html
    ).each(function () {
      let found = $(this).next().find("a").attr("href");
      clubTeamNamesUrl.push(found);
    });
    clubTeamNamesUrl = clubTeamNamesUrl.slice(0, -1);
    // console.log(clubTeamNamesUrl);
  } catch (err) {
    console.log(err);
  }
}

//build out the clubInfo object with the history and common facts about each club in the WSL
async function buildClubInfo() {
  try {
    let before = await buildClubInfoUrl();
    for (const url of clubTeamNamesUrl) {
      let clubURL = `https://en.wikipedia.org${url}`;
      let res = await axios(clubURL);
      const html = res.data;
      const $ = cheerio.load(html);
      let club = {};
      let clubData = {};
      let cleanName;
      let players = [];
      let numbers = [];
      let position = [];
      let nation = [];
      let playersArr = [];
      let stan = {};

      $("#mw-content-text > div.mw-parser-output > table.infobox.vcard").each(
        function () {
          let name = $(this).find("caption").text();
          cleanName = name.toLowerCase();

          club.clubName = name;
          let logo = $(this).find("a").find("img").attr("src");
          club.clubLogo = logo;
        }
      );

      $(
        "#mw-content-text > div.mw-parser-output > table.infobox.vcard > tbody > tr"
      ).each(function () {
        let headings = $(this).find("th").first().text();
        if (headings.includes("Nickname(s)")) {
          let found = $(this).find("td").text();
          club.nickNames = [found];
        } else if (headings.includes("Founded")) {
          let found = $(this).find("td").text();
          club.founded = [found];
        } else if (headings.includes("Ground")) {
          let found = $(this).find("td").text();
          club.ground = [found];
        } else if (headings.includes("Capacity")) {
          let found = $(this).find("td").text();
          club.capacity = [found];
        } else if (headings.includes("Owner")) {
          let found = $(this).find("td").text();
          club.owner = [found];
        } else if (headings.includes("Head coach")) {
          let found = $(this).find("td").text();
          club.headCoach = [found];
        } else if (headings.includes("League")) {
          let found = $(this).find("td").text();
          club.league = [found];
        } else if (headings.includes("Website")) {
          let found = $(this).find("td").find("a").attr("href");
          club.website = [found];
        }
      });

      $(
        "#mw-content-text > div.mw-parser-output > table > tbody > tr > td > table > tbody > tr > td"
      ).each((index, elem) => {
        const play = $(elem);
        const name = play
          .find("span.fn")
          .find("a")
          .toArray()
          .forEach((el) => {
            let text = $(el).text();
            players.push(text);
          });

        const nat = play.find("span").find(".flagicon").find("img").attr("alt");
        nation.push(nat);

        const pos = play.find("a").find("abbr").attr("title");
        position.push(pos);
      });

      $(
        "#mw-content-text > div.mw-parser-output > table > tbody > tr > td > table > tbody > tr > td:nth-child(1)"
      ).each((index, elem) => {
        const nums = $(elem)
          .first()
          .text()
          .replace(/\n/gi, "")
          .replace(/[A-Za-z]/gi, "")
          .replace(/[^0-9]/gi, "");
        nums.split("/n");
        // console.log(nums);

        // const num = nums.find().text();

        numbers.push(nums);
      });

      const cleanArray = numbers.filter((x) => x);

      const nationFil = nation.filter((el) => el !== undefined);

      const posFil = position.filter((el) => el !== undefined);

      //   console.log(posFil);

      let playerDetails = players.map((name, index) => ({
        playerName: name,
        playerNation: nationFil[index],
        playerPosition: posFil[index],
        playerNumber: cleanArray[index],
      }));

      club.playerInfo = playerDetails;
      clubData[cleanName] = club;

      teamsArr.push(clubData);
      teams = teamsArr.reduce((a, b) => Object.assign(a, b), {});
      // console.log(cleanName);
      //   console.log(JSON.stringify(club, null, 4));
    }
  } catch (err) {
    console.log(err);
  }
}

//Build the website URLs for looking up basic WSL statistics
async function buildGeneralWslStats() {
  const teamsNamesURL =
    "https://fbref.com/en/comps/189/Womens-Super-League-Stats";
  try {
    let res = await axios(teamsNamesURL);
    const html = res.data;
    const $ = cheerio.load(html);

    let ranking = [];
    let club = [];
    //get the general stats for the WSL
    //retrieve the ranking
    $("#results2022-20231891_overall > tbody > tr > th", html).each(
      function () {
        let load = $(this).attr("csk");
        ranking.push(load);
      }
    );

    //retrieve the squad name
    $("#results2022-20231891_overall > tbody > tr > td.left > a", html).each(
      function () {
        let found = $(this).first().text();
        club.push(found);
      }
    );

    //retrieve the squad stats
    let mP = [];
    let w = [];
    let d = [];
    let l = [];
    let gF = [];
    let gA = [];
    let gD = [];
    let pts = [];
    let ptsPerMP = [];
    let xG = [];
    let xGA = [];
    let xGD = [];
    let xGD90 = [];
    let last5 = [];
    let att = [];

    //retrieve club stats
    $("#results2022-20231891_overall > tbody > tr", html).each(
      (index, elem) => {
        //   headings = $(this).find("td").attr("data-stat");
        const mat = $(elem).find("td:nth-child(3)").text();
        mP.push(mat);

        const win = $(elem).find("td:nth-child(4)").text();
        w.push(win);

        const draws = $(elem).find("td:nth-child(5)").text();
        d.push(draws);

        const loss = $(elem).find("td:nth-child(6)").text();
        l.push(loss);

        const gamF = $(elem).find("td:nth-child(7)").text();
        gF.push(gamF);

        const gamA = $(elem).find("td:nth-child(8)").text();
        gA.push(gamA);

        const gamD = $(elem).find("td:nth-child(9)").text();
        gD.push(gamD);

        const pTS = $(elem).find("td:nth-child(10)").text();
        pts.push(pTS);

        const ptsMP = $(elem).find("td:nth-child(11)").text();
        ptsPerMP.push(ptsMP);

        const xg = $(elem).find("td:nth-child(12)").text();
        xG.push(xg);

        const xga = $(elem).find("td:nth-child(13)").text();
        xGA.push(xga);

        const xgd = $(elem).find("td:nth-child(14)").text();
        xGD.push(xgd);

        const xgd90 = $(elem).find("td:nth-child(15)").text();
        xGD90.push(xgd90);

        const l5 = $(elem).find("td:nth-child(16)").text();
        last5.push(l5);

        const attendance = $(elem).find("td:nth-child(17)").text();
        att.push(attendance);
      }
    );

    // console.log(clubTeamNamesStatsUrl);
    generalWSLStats = ranking.map((elem, i) => ({
      clubRanking: elem,
      clubName: club[i],
      matchesPlayed: mP[i],
      wins: w[i],
      draws: d[i],
      losses: l[i],
      goalsFor: gF[i],
      goalsAgainst: gA[i],
      goalDifference: gD[i],
      points: pts[i],
      pointsPerMatchesPlayed: ptsPerMP[i],
      expectedGoals: xG[i],
      expectedGoalsAllowed: xGA[i],
      expectedGoalDifference: xGD[i],
      expectedGoalDifferencePer90: xGD90[i],
      lastFiveMatches: last5[i],
      attendancePerGame: att[i],
    }));
    // console.log(clubStats);
    // generalWSLStats.push(clubGenStats);

    // console.log(generalWSLStats);
  } catch (err) {
    console.log(err);
  }
}

//get the urls for each clubs
async function buildWslStatsURL() {
  const teamsNamesURL =
    "https://fbref.com/en/comps/189/Womens-Super-League-Stats";
  try {
    let res = await axios(teamsNamesURL);
    const html = res.data;
    const $ = cheerio.load(html);

    //retrieve the end URL
    $("#results2022-20231891_overall > tbody > tr > td.left > a", html).each(
      function () {
        let found = $(this).first().attr("href");
        clubTeamNamesStatsUrl.push(found);
      }
    );
    return clubTeamNamesStatsUrl;
  } catch (err) {
    console.log(err);
  }
}

//Build Player Stats
async function buildClubPlayerStats() {
  try {
    let before = await buildWslStatsURL();
    for (const url of clubTeamNamesStatsUrl) {
      let clubURL = `https://fbref.com${url}`;

      let res = await axios(clubURL);
      const html = res.data;
      const $ = cheerio.load(html);

      let title = $("#meta > div:nth-child(2) > h1 > span:nth-child(1)")
        .text()
        .replace("Stats", "")
        .replace(/[0-9]/g, "")
        .replace(/-/, "")
        .replace(" ", "");
      clubPlayers.club = title;

      let playerNames = [];
      //retrieve the player name
      $("#stats_standard_189 > tbody > tr > th", html).each(function () {
        let load = $(this).find("a").text();
        playerNames.push(load);
      });

      //retrieve the squad stats
      let nation = [];
      let pos = [];
      let age = [];
      let mp = [];
      let starts = [];
      let min = [];
      let ninety = [];
      let gls = [];
      let ast = [];
      let gPK = [];
      let pk = [];
      let pkatt = [];
      let crdy = [];
      let crdr = [];
      let gls90 = [];
      let ast90 = [];
      let ga90 = [];
      let gpk90 = [];
      let gapk90 = [];
      let xg = [];
      let npxG = [];
      let xAG = [];
      let npxGxAG = [];
      let xg90 = [];
      let xag90 = [];
      let xgxag90 = [];
      let npxG90 = [];
      let npxGxAG90 = [];

      let headings = [];
      //retrieve individual player stats
      $("#stats_standard_189 > tbody > tr", html).each((index, elem) => {
        const local = $(elem)
          .find("td.left.poptip")
          .find("a")
          .find("span")
          .text()
          .replace(/[a-z]/g, "")
          .replace(" ", "");
        nation.push(local);

        const position = $(elem).find("td:nth-child(3)").text();
        pos.push(position);

        const playerAge = $(elem).find("td:nth-child(4)").text();
        age.push(playerAge);

        const temp = $(elem).find("td:nth-child(5)").text();
        mp.push(temp);

        //PLAYING TIME
        const a = $(elem).find("td:nth-child(6)").text();
        starts.push(a);

        const b = $(elem).find("td:nth-child(7)").text();
        min.push(b);

        const c = $(elem).find("td:nth-child(8)").text();
        ninety.push(c);

        //PERFORMANCE
        const d = $(elem).find("td:nth-child(9)").text();
        gls.push(d);

        const e = $(elem).find("td:nth-child(10)").text();
        ast.push(e);

        const f = $(elem).find("td:nth-child(11)").text();
        gPK.push(f);

        const g = $(elem).find("td:nth-child(12)").text();
        pk.push(g);

        const h = $(elem).find("td:nth-child(13)").text();
        pkatt.push(h);

        const rs = $(elem).find("td:nth-child(14)").text();
        crdy.push(rs);

        const tv = $(elem).find("td:nth-child(15)").text();
        crdr.push(tv);

        //PER 90 MINUTES
        const i = $(elem).find("td:nth-child(16)").text();
        gls90.push(i);

        const j = $(elem).find("td:nth-child(17)").text();
        ast90.push(j);

        const k = $(elem).find("td:nth-child(18)").text();
        ga90.push(k);

        const l = $(elem).find("td:nth-child(19)").text();
        gpk90.push(l);

        const m = $(elem).find("td:nth-child(20)").text();
        gapk90.push(m);

        //EXPECTED
        const n = $(elem).find("td:nth-child(21)").text();
        xg.push(n);

        const o = $(elem).find("td:nth-child(22)").text();
        npxG.push(o);

        const p = $(elem).find("td:nth-child(23)").text();
        xAG.push(p);

        const q = $(elem).find("td:nth-child(24)").text();
        npxGxAG.push(q);

        //EXPECTED PER 90 MINUTES
        const r = $(elem).find("td:nth-child(25)").text();
        xg90.push(r);

        const s = $(elem).find("td:nth-child(26)").text();
        xag90.push(s);

        const t = $(elem).find("td:nth-child(27)").text();
        xgxag90.push(t);

        const u = $(elem).find("td:nth-child(28)").text();
        npxG90.push(u);

        const v = $(elem).find("td:nth-child(29)").text();
        npxGxAG90.push(v);
      });

      // create object for Each Player
      generalFacts = playerNames.map((e, i) => ({
        name: e,
        nationality: nation[i],
        position: pos[i],
        age: age[i],
        matchesPlayed: mp[i],
        playingTime: {
          gamesStarted: starts[i],
          minutesPlayed: min[i],
          minsPlayedDivideBy90: ninety[i],
        },
        performance: {
          goalsScored: gls[i],
          assists: ast[i],
          nonPenaltyGoals: gPK[i],
          penaltyGoals: pk[i],
          penaltyGoalsAttempted: pkatt[i],
          yellowCards: crdy[i],
          redCards: crdr[i],
        },
        per90Min: {
          goalsScoredPer90: gls90[i],
          assistsPer90: ast90[i],
          goalsAndAssistsPer90: ga90[i],
          goalsMinusPenaltiesPer90: gpk90[i],
          goalsAndAssistsMinusPenaltiesPer90: gapk90[i],
        },
        expected: {
          expectedGoals: xg[i],
          nonPenaltyExpectedGoals: npxG[i],
          expectedAssistedGoals: xAG[i],
          nonPenaltyExpectedGoalsPlusAssistedGoals: npxGxAG[i],
        },
        xper90Min: {
          expectedGoalsPer90: xg90[i],
          expectedAssistedGoalsPer90: xag90[i],
          ExpectedGoalsPlusAssistedGoalsPer90: xgxag90[i],
          nonPenaltyExpectedGoalsPer90: npxG90[i],
          nonPenaltyExpectedGoalsPlusAssistedGoalsPer90: npxGxAG90[i],
        },
      }));

      clubPlayers.player = generalFacts;
      // console.log(clubPlayers);
    }
  } catch (err) {
    console.log(err);
  }
}

//get URLS for individual player pages
async function buildIndividualPlayerStatsURL() {
  try {
    let before = await buildGeneralWslStats();
    for (const url of clubTeamNamesStatsUrl) {
      let clubURL = `https://fbref.com${url}`;
      let res = await axios(clubURL);
      const html = res.data;
      const $ = cheerio.load(html);

      //retrieve the individual player url
      $("#stats_standard_189 > tbody > tr > th", html).each(function () {
        let load = $(this).find("a").attr("href");
        individualPlayerStatsUrl.push(load);
      });
      return individualPlayerStatsUrl;
    }
  } catch (err) {
    console.log(err);
  }
}

//build individual Detailed Stats Comparing them to others in their position
async function buildIndividualComparisonPlayerStats() {
  try {
    let before = await buildIndividualPlayerStatsURL();
    for (const url of individualPlayerStatsUrl) {
      let individualURL = `https://fbref.com${url}`;

      let res = await axios(individualURL);
      const html = res.data;
      const $ = cheerio.load(html);
      let player;

      let image = $("#meta > div.media-item").find("img").attr("src");
      // console.log(image);
      let name = $("#meta > div:nth-child(2) > h1").find("span").text();

      let club = $("#meta > div:nth-child(2) > p:nth-child(6)")
        .find("a")
        .text();

      let ap90;
      let aP;

      let bp90;
      let bP;

      let cp90;
      let cP;

      let dp90;
      let dP;

      let ep90;
      let eP;

      let fp90;
      let fP;

      let gp90;
      let gP;

      let hp90;
      let hP;

      let ip90;
      let iP;

      let jp90;
      let jP;

      let kp90;
      let kP;

      let lp90;
      let lP;

      let mp90;
      let mP;

      let np90;
      let nP;

      let op90;
      let oP;

      let pp90;
      let pP;

      let qp90;
      let qP;

      let rp90;
      let rP;

      let sp90;
      let sP;

      let tp90;
      let tP;
      $("#scout_summary_AM > tbody", html).each((index, elem) => {
        ap90 = $(elem).find("tr:nth-child(1) > td.right").attr("csk");
        aP = $(elem).find("tr:nth-child(1) > td.left").attr("csk");

        bp90 = $(elem).find("tr:nth-child(2) > td.right").attr("csk");
        bP = $(elem).find("tr:nth-child(2) > td.left").attr("csk");

        cp90 = $(elem).find("tr:nth-child(3) > td.right").attr("csk");
        cP = $(elem).find("tr:nth-child(3) > td.left").attr("csk");

        dp90 = $(elem).find("tr:nth-child(4) > td.right").attr("csk");
        dP = $(elem).find("tr:nth-child(4) > td.left").attr("csk");

        ep90 = $(elem).find("tr:nth-child(5) > td.right").attr("csk");
        eP = $(elem).find("tr:nth-child(5) > td.left").attr("csk");

        fp90 = $(elem).find("tr:nth-child(6) > td.right").attr("csk");
        fP = $(elem).find("tr:nth-child(6) > td.left").attr("csk");

        gp90 = $(elem).find("tr:nth-child(7) > td.right").attr("csk");
        gP = $(elem).find("tr:nth-child(7) > td.left").attr("csk");

        ip90 = $(elem).find("tr:nth-child(9) > td.right").attr("csk");
        iP = $(elem).find("tr:nth-child(9) > td.left").attr("csk");

        jp90 = $(elem).find("tr:nth-child(10) > td.right").attr("csk");
        jP = $(elem).find("tr:nth-child(10) > td.left").attr("csk");

        kp90 = $(elem).find("tr:nth-child(11) > td.right").attr("csk");
        kP = $(elem).find("tr:nth-child(11) > td.left").attr("csk");

        lp90 = $(elem).find("tr:nth-child(12) > td.right").attr("csk");
        lP = $(elem).find("tr:nth-child(12) > td.left").attr("csk");

        mp90 = $(elem).find("tr:nth-child(13) > td.right").attr("csk");
        mP = $(elem).find("tr:nth-child(13) > td.left").attr("csk");

        np90 = $(elem).find("tr:nth-child(14) > td.right").attr("csk");
        nP = $(elem).find("tr:nth-child(14) > td.left").attr("csk");

        op90 = $(elem).find("tr:nth-child(15) > td.right").attr("csk");
        oP = $(elem).find("tr:nth-child(15) > td.left").attr("csk");

        pp90 = $(elem).find("tr:nth-child(16) > td.right").attr("csk");
        pP = $(elem).find("tr:nth-child(16) > td.left").attr("csk");

        qp90 = $(elem).find("tr:nth-child(17) > td.right").attr("csk");
        qP = $(elem).find("tr:nth-child(17) > td.left").attr("csk");

        rp90 = $(elem).find("tr:nth-child(18) > td.right").attr("csk");
        rP = $(elem).find("tr:nth-child(18) > td.left").attr("csk");

        sp90 = $(elem).find("tr:nth-child(19) > td.right").attr("csk");
        sP = $(elem).find("tr:nth-child(19) > td.left").attr("csk");

        tp90 = $(elem).find("tr:nth-child(20) > td.right").attr("csk");
        tP = $(elem).find("tr:nth-child(20) > td.left").attr("csk");
      });

      let goalKeepers = $("#all_scout > div.filter.switcher > div > a").text();

      // console.log(goalKeepers);

      if (goalKeepers.includes("vs. Goalkeepers")) {
        player = {
          name: name,
          image: image,
          club: club,
          position: "GK",
          postShotExpectedGoalsMinusGoalsAllowed: {
            per90: ap90,
            percentile: aP,
          },
          goalsAgainst: {
            per90: bp90,
            percentile: bP,
          },
          savePercentage: {
            per90: cp90,
            percentile: cP,
          },
          postShotExpectedGoalsPerShotOnTarget: {
            per90: dp90,
            percentile: dP,
          },
          penaltySavePercentage: {
            per90: dp90,
            percentile: dP,
          },
          cleanSheetPercentage: {
            per90: ep90,
            percentile: eP,
          },
          touches: {
            per90: gp90,
            percentile: gP,
          },
          percentageOfPassesLaunched: {
            per90: ip90,
            percentile: iP,
          },
          goalKicks: {
            per90: jp90,
            percentile: jP,
          },
          averageLengthOfGoalKicks: {
            per90: kp90,
            percentile: kP,
          },
          crossesStoppedPercentage: {
            per90: mp90,
            percentile: mP,
          },
          defensiveActionsOutsidePenaltyArea: {
            per90: np90,
            percentile: nP,
          },
          averageDistanceOfDefensiveActions: {
            per90: op90,
            percentile: oP,
          },
        };
      } else {
        player = {
          name: name,
          image: image,
          club: club,
          position: "",
          nonPenaltyGoals: {
            per90: ap90,
            percentile: aP,
          },
          nonPenaltyxG: {
            per90: bp90,
            percentile: bP,
          },
          shotsTotal: {
            per90: cp90,
            percentile: cP,
          },
          assists: {
            per90: dp90,
            percentile: dP,
          },
          expectedAssistedGoals: {
            per90: ep90,
            percentile: eP,
          },
          nonPenaltyExpectedGoalsPlusAssistedGoals: {
            per90: fp90,
            percentile: fP,
          },
          shotCreatingActions: {
            per90: gp90,
            percentile: gP,
          },
          passesAttempted: {
            per90: ip90,
            percentile: iP,
          },
          passCompletionPercentage: (j = {
            per90: jp90,
            percentile: jP,
          }),
          progressivePasses: (k = {
            per90: kp90,
            percentile: kP,
          }),
          dribblesCompleted: {
            per90: lp90,
            percentile: lP,
          },
          touchesInAttackingPenaltyBox: {
            per90: mp90,
            percentile: mP,
          },
          progressivePassesReceived: {
            per90: np90,
            percentile: nP,
          },
          tackles: {
            per90: pp90,
            percentile: pP,
          },
          interceptions: {
            per90: qp90,
            percentile: qP,
          },
          blocks: {
            per90: rp90,
            percentile: rP,
          },
          clearances: {
            per90: sp90,
            percentile: sP,
          },
          aerialsWon: {
            per90: tp90,
            percentile: tP,
          },
        };
      }
      clubPlayersComparison.push(player);
    }
  } catch (err) {
    console.log(err);
  }
}

function writeDataIntoFile() {
  // fs.writeFile(
  //   "wsl-general-info.js",
  //   `exports.wslGeneralInfo = ` + JSON.stringify(generalData, null, 2),
  //   (err) => {
  //     if (err) console.log(err);
  //     else console.log("File Creation Successful!");
  //   }
  // );
  // fs.writeFile(
  //   "general-wsl-clubs-info.js",
  //   `exports.wslGeneralClubInfo = ` + JSON.stringify(teams, null, 2),
  //   (err) => {
  //     if (err) console.log(err);
  //     else console.log("File Creation Successful!");
  //   }
  // );
  // fs.writeFile(
  //   "general-wsl-stats.js",
  //   `exports.generalWslStats = ` + JSON.stringify(generalWSLStats, null, 2),
  //   (err) => {
  //     if (err) console.log(err);
  //     else console.log("File Creation Successful!");
  //   }
  // );
  fs.writeFile(
    "specific-club-stats.js",
    `exports.clubWslStats = ` + JSON.stringify(clubPlayers, null, 2),
    (err) => {
      if (err) console.log(err);
      else console.log("File Creation Successful!");
    }
  );
  // fs.writeFile(
  //   "specific-player-stats.js",
  //   `exports.specificPlayerStats = ` +
  //     JSON.stringify(clubPlayersComparison, null, 2),
  //   (err) => {
  //     if (err) console.log(err);
  //     else console.log("File Creation Successful!");
  //   }
  // );
}
