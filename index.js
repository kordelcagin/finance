const express = require("express");
const yahooFinance = require("yahoo-finance");
const SuperTrend = require("supertrend-indicator");
const axios = require("axios");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  let buySymbols = "";
  let sellSymbols = "";
  //let standSymbols = "";
  await yahooFinance.historical(
    {
      symbols: await getData(),
      from: "2015-01-01",
      to: new Date().toISOString().slice(0, 10),
      period: "d",
    },
    function (err, result) {
      //console.log(err, result);
      Object.values(result).forEach((element, key) => {
        if (element.length > 0) {
          let superTrendData = SuperTrend(element.reverse(), 3, 10).reverse();
          const lastDatas = superTrendData.slice(0, 2);
          if (lastDatas[0].trendDirection > lastDatas[1].trendDirection) {
            buySymbols += "-" + element[0].symbol.replace(".IS", "") + "\r\n";
            //console.log(element[0].symbol + " AL");
          } else if (lastDatas[0].trendDirection < lastDatas[1].trendDirection) {
            sellSymbols += "-" + element[0].symbol.replace(".IS", "") + "\r\n";
            //console.log(element[0].symbol + " SAT");
          } else {
            //standSymbols += "- " + element[0].symbol.replace(".IS", "") + "\r\n";
            console.log(element[0].symbol + " BEKLE");
          }
        } else {
          console.log("Data alınamadı");
        }
      });
    }
  );

  if (buySymbols.length > 1 || sellSymbols.length > 1) {
    sendSignal("ALINACAK HİSSELER:  \r\n" + buySymbols + "SATILACAK HİSSELER:  \r\n" + sellSymbols);
  } else {
    sendSignal("Bugün rahat olun dostlar, bir aksiyonumuz bulunmamaktadır. Takipte kalın 😎");
  }

  res.send("OK");
});

const getData = async () => {
  let allSymbols = [];
  const config = {
    headers: {
      authorization: "apikey 7uttd9gDUtjxB8jjB5GSNn:2nLKrZP25W5K5iyu0waoz2",
    },
  };
  const url = "https://api.collectapi.com/economy/hisseSenedi";
  await axios
    .get(url, config)
    .then((res) => {
      res.data.result.forEach((element) => {
        allSymbols.push(element.code.replace("https:", "") + ".IS");
      });
    })
    .catch((err) => console.log(err));
  return allSymbols;
};

const sendSignal = async (text) => {
  let apiKey = "5774265140:AAHu7f6z3XdOgnSFs-BTYBz4FF8zhcaNS24";
  let chatId = "@bilbist";
  let message = encodeURIComponent(text);
  const url = "https://api.telegram.org/bot" + apiKey + "/sendMessage?chat_id=" + chatId + "&text=" + message;
  await axios
    .get(url)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  return;
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
