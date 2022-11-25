const express = require("express");
const yahooFinance = require("yahoo-finance");
const SuperTrend = require("supertrend-indicator");
const axios = require("axios");
const app = express();
const port = 3000;

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

app.get("/", async (req, res) => {
  let buySymbols = "";
  let sellSymbols = "";
  let buy = 0;
  let sell = 0;
  await yahooFinance.historical(
    {
      symbols: await getData(),
      from: "2017-01-01",
      to: today.toISOString().slice(0, 10),
      period: "d",
    },
    function (err, result) {
      console.log(tomorrow.toISOString().slice(0, 10));
      Object.values(result).forEach((element, key) => {
        if (element.length > 0) {
          const superTrendData = SuperTrend(element.reverse(), 3, 10).reverse();
          const lastDatas = superTrendData.slice(0, 2);
          if (lastDatas.length > 1) {
            if (lastDatas[0].trendDirection > lastDatas[1].trendDirection) {
              buySymbols += "-" + element[0].symbol.replace(".IS", "") + "\r\n";
              buy = 1;
              console.log(element[0].symbol + " AL");
            } else if (lastDatas[0].trendDirection < lastDatas[1].trendDirection) {
              sellSymbols += "-" + element[0].symbol.replace(".IS", "") + "\r\n";
              sell = 1;
              console.log(element[0].symbol + " SAT");
            } else {
              console.log(element[0].symbol);
            }
          }
        }
      });
    }
  );

  if (buy == 1 || sell == 1) {
    console.log("AL: " + buySymbols + "SAT: " + sellSymbols);
    //sendSignal("ALINACAK HİSSELER:  \r\n" + buySymbols + "\r\nSATILACAK HİSSELER:  \r\n" + sellSymbols + "\r\n\r\nNot: Yatırım tavsiyesi değildir 😎");
  } else {
    console.log("YOK");
    //sendSignal("Bugün rahat olun dostlar, bir aksiyonumuz bulunmamaktadır. Takipte kalın 😎");
  }

  res.send("OK");
});

const getData = async () => {
  let allSymbols = [];
  const config = {
    headers: {
      authorization: "apikey 69TLINLlGOvKeH6Es8cGrC:6pIf9h7gByNjijN7kk1Vmm",
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
      //console.log(res);
    })
    .catch((err) => console.log(err));
  return;
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
