const express = require("express");
const yahooFinance = require("yahoo-finance");
const SuperTrend = require("supertrend-indicator");
const app = express();
const port = 3000;
let signal = 2;

app.get("/", async (req, res) => {
  let data = [];
  await yahooFinance.historical(
    {
      symbol: "HEKTS.IS",
      from: "2015-01-01",
      to: new Date().toISOString().slice(0, 10),
      period: "d",
    },
    function (err, quotes) {
      let superTrendData = SuperTrend(quotes.reverse(), 3, 10);

      superTrendData.forEach((element, key) => {
        superTrendData[key].price = quotes[key]["close"];
        superTrendData[key].date = quotes[key]["date"];

        if (signal == 2 && element.trendDirection == 1) {
          superTrendData[key].signal = "AL";
          signal = 1;
          data.push({
            al: superTrendData[key].price,
            tarih: superTrendData[key].date,
          });
        } else if (signal == 1 && element.trendDirection == -1) {
          superTrendData[key].signal = "SAT";
          signal = 2;
          data.push({
            sat: superTrendData[key].price,
            tarih: superTrendData[key].date,
          });
        } else {
          superTrendData[key].signal = "BEKLE";
        }
      });

      res.send(data);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
