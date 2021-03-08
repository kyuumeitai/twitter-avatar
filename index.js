const express = require("express");
const cheerio = require("cheerio");
const request = require("request");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
const port = 3000;

const cache = {};
const bannercache = {};

const getAvatar = (username) => {
  const url = "https://mobile.twitter.com/" + username;
  return new Promise((resolve) => {
    if (cache[username]) resolve(cache[username]);
    else
      request(
        {
          url,
          headers: {
            "User-Agent": "Twitterbot",
          },
        },
        (_, __, body) => {
          const $ = cheerio.load(body);
          // fs.writeFile("persona.html", body, function (err) {
          //   if (err) return console.log(err);
          // });
          const url = ($(".ProfileAvatar-image").attr("src") || "").replace(
            "_normal",
            ""
          );
          cache[username] = url;
          resolve(url);
        }
      );
  });
};

const getBanner = (username) => {
  const url = "https://mobile.twitter.com/" + username;
  return new Promise((resolve) => {
    if (bannercache[username]) resolve(bannercache[username]);
    else
      request(
        {
          url,
          headers: {
            "User-Agent": "Twitterbot",
          },
        },
        (_, __, body) => {
          const $ = cheerio.load(body);
          const url = $(".ProfileCanopy-headerBg img").attr("src") || "";
          bannercache[username] = url;
          resolve(url);
        }
      );
  });
};

app.get("/:user", async (req, res, next) => {
  const result = await getAvatar(req.params.user);
  if (!result) return res.status(404).send("Not Found");
  request(result).pipe(res);
});

app.get("/:user/banner", async (req, res, next) => {
  const result = await getBanner(req.params.user);
  if (!result) return res.status(404).send("Not Found");
  request(result).pipe(res);
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

module.exports = app;
