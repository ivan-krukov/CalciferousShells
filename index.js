var express = require("express"),
async = require("async"),
request = require("request"),
cheerio = require("cheerio"),
config = require("./config"),
app = express();

app.get("/scrape", function (localRequest, localResponse) {
  request(config.baseURL + "/search/apa", function (err, res, html) {
    if (!err) {
      var $ = cheerio.load(html);
      var items = $("a[data-id]").map(function (i,e) {
        return $(e).attr("href");
      }).get();
      async.map(items, function (itemURL, callback) {
        request(config.baseURL + itemURL, function (err, res, html) {
          if (err) {
            return callback(err);
          } else {
            var $ = cheerio.load(html);
            console.log("Processing " + itemURL);
            var description = $(".housing").text();
            callback(null, {
              price: $(".price").text(),
              bedrooms: /(\d+)br/g.exec(description)[1],
              area: /(\d+)ft2/g.exec(description)[1],
              latitude: $("#map").attr("data-latitude"),
              longitude: $("#map").attr("data-longitude")
            });
          }
        });
      }, function (err, results) {
        if (err) {
          console.log(err);
        } else {
          console.log("Processed " + results.length + " postings");
          localResponse.send(results);
        }
      });
    } else {
      console.log("Error: " + err);
    }
  });
});

app.listen(config.port);
