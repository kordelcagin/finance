const express = require("express");
const yahooFinance = require("yahoo-finance");
const SuperTrend = require("supertrend-indicator");
const axios = require("axios");
const app = express();
const port = 3000;

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

app.get("/coin", async (req, res) => {
  let datas = await getCoinData();
  let superTrendData = SuperTrend(datas, 3, 10).reverse();
  const lastDatas = superTrendData.slice(0, 2);

  if (lastDatas.length > 1) {
    if (lastDatas[0].trendDirection > lastDatas[1].trendDirection) {
      console.log(" AL");
    } else if (lastDatas[0].trendDirection < lastDatas[1].trendDirection) {
      console.log(" SAT");
    } else {
      console.log(" HOLD");
    }
  }

  res.send(lastDatas);
});

app.get("/", async (req, res) => {
  let buySymbols = "";
  let sellSymbols = "";
  let buy = 0;
  let sell = 0;
  await yahooFinance.historical(
    {
      symbols: ["VESTL.IS"], //await getData(),
      from: "2017-01-01",
      to: tomorrow.toISOString().slice(0, 10),
      period: "d",
    },
    function (err, result) {
      //console.log(err, result);
      Object.values(result).forEach((element, key) => {
        if (element.length > 0) {
          let superTrendData = SuperTrend(element.reverse(), 3, 10).reverse();
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
              console.log(element[0].symbol + " HOLD");
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

const getCoinData = async () => {
  let alldata = [];
  const url = "https://api.binance.me/api/v1/klines?symbol=ETHTRY&interval=4h&limit=1000";
  await axios
    .get(url)
    .then((res) => {
      res.data.forEach((element) => {
        alldata.push({
          //open: element[1],
          high: element[2] * 1,
          low: element[3] * 1,
          close: element[4] * 1,
        });
      });
    })
    .catch((err) => console.log(err));
  return alldata;
};

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
