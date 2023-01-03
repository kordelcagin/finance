const express = require("express");
const yahooFinance = require("yahoo-finance");
const yahooFinance2 = require("yahoo-finance2").default; // NOTE the .default
//const SuperTrend = require("supertrend-indicator");
const { SuperTrend, EMA } = require("@debut/indicators");
const axios = require("axios");
const app = express();
const port = 3000;

app.get("/2", async (req, res) => {
  let buySymbols = "";
  let sellSymbols = "";
  let symbols = await getData();
  //let symbols = ["SASA.IS", "AHGAZ.IS", "TERA.IS"];

  await Promise.all(
    symbols.map(async (element) => {
      try {
        const queryOptions = { period1: "2018-01-01" };
        const datas = await yahooFinance2.historical(element, queryOptions);
        if (datas.length > 0) {
          const lastDatas = await getStData(datas);
          if (lastDatas.length > 1) {
            //console.log(lastDatas);
            if (lastDatas[0].direction === 1 && lastDatas[1].direction === -1) {
              sellSymbols += "<br>-" + element.replace(".IS", "");
              console.log(element + " SAT");
            } else if (lastDatas[0].direction === -1 && lastDatas[1].direction === 1) {
              buySymbols += "<br>-" + element.replace(".IS", "");
              console.log(element + " AL");
            } else {
              console.log(element);
            }
          }
        }
      } catch (err) {
        console.log(element + " - " + err);
      }
    })
  );

  res.send("AL: " + buySymbols + "<br> SAT: " + sellSymbols);
});

app.get("/", async (req, res) => {
  let buySymbols = "";
  let sellSymbols = "";
  let buy = 0;
  let sell = 0;
  await yahooFinance.historical(
    {
      symbols: await getData(),
      from: "2019-01-01",
    },
    async function (err, result) {
      await Promise.all(
        Object.values(result).map(async (element) => {
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
        })
      );
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

const getStData = async (datas) => {
  let st = [];
  const supertrend = new SuperTrend();
  await Promise.all(
    datas.map(async (element) => {
      st.push(supertrend.nextValue(element.high, element.low, element.close));
    })
  );
  return st.reverse();
};

const getEma = async (datas) => {
  let emaData = [];
  let closeData = [];
  const ema = new EMA(200);
  await Promise.all(
    datas.map(async (element) => {
      closeData.push(element.close);
      emaData.push(ema.nextValue(element.close));
    })
  );
  console.log(emaData.reverse().pop());
};

const getData = async () => {
  let allSymbols = [];
  const config = {
    headers: {
      authorization: "apikey 7b6rCk0TJL7E5T1EFCPegb:5NFlyoPdzEJg5xqAaQNv0l",
    },
  };
  const url = "https://api.collectapi.com/economy/hisseSenedi";
  await axios
    .get(url, config)
    .then((res) => {
      res.data.result.forEach((element) => {
        allSymbols.push(element.text.split(" - ")[0] + ".IS");
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
