var express = require("express"),
async = require("async"),
request = require("request"),
cheerio = require("cheerio"),
app = express();

app.get("/scrape", function (localRequest, localResponse) {
  var baseURL = "http://vancouver.craigslist.ca";

  var searchURL = baseURL;

  var results = [];

  request(baseURL + "/search/apa", function (err, res, html) {
    if (!err) {
      var $ = cheerio.load(html);
      var items = $("a[data-id]").map(function (i,e) {
        return $(e).attr("href");
      }).get();
      // console.log(items);
      async.map(items, function (itemURL, callback) {
        request(baseURL + itemURL, function (err, res, html) {
          if (err) {
            return callback(err);
          } else {
            var $ = cheerio.load(html);
            console.log("Processing " + itemURL);
            callback(null, {
              price: $(".price").text(),
              latitude: $("#map").attr("data-latitude"),
              longitude: $("#map").attr("data-longitude")
            });
          }
        });
      }, function (err, results) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success!");
          localResponse.send(results);
        }
      });
      // $("a[data-id]").filter(function () {
      //   var itemURL = baseURL + $(this).attr("href");
      //   request(itemURL, function (err, res, html) {
      //     var $ = cheerio.load(html);
      //     results.push({
      //       price: $(".price").text(),
      //       latitude: $("#map[data-latitude]").text(),
      //       longitude: $("#map[data-longitude]").text()
      //     });
      //   });
      // });

      // localResponse.send(results);

    } else {
      console.log("Error: " + err);
    }
  });
});

app.listen(8081);
