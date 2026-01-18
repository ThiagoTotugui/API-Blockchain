import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pairs from "./pairs.js";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// Página inicial
app.get("/", (req, res) => {
  console.log(pairs);
  res.render("index.ejs", { pairs, marketData: null, error: null });
});
// Rota Market
app.post("/market", async (req, res) => {
  const symbolSelected = req.body.symbol;
  console.log(symbolSelected);

  try {
    const response = await axios.get(
      `https://api.blockchain.com/v3/exchange/l2/${symbolSelected}`,
    );
    if (
      !response.data ||
      !response.data.bids ||
      !response.data.asks ||
      response.data.bids.length === 0 ||
      response.data.asks.length === 0
    ) {
      res.render("index.ejs", {
        error:
          "Não foi possível obter dados de mercado para este par no momento.",
        pairs,
        marketData: null,
      });
      return;
    }
    const bestBid = response.data.bids[0];
    const bestAsk = response.data.asks[0];
    const marketData = {
      symbol: symbolSelected,
      bid: {
        price: Number(bestBid.px),
        quantity: Number(bestBid.qty),
      },
      ask: {
        price: Number(bestAsk.px),
        quantity: Number(bestAsk.qty),
      },
      midPrice: (Number(bestBid.px) + Number(bestAsk.px)) / 2,
    };

    res.render("index.ejs", { pairs, marketData, error: null });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: "Par não suportado neste exchange.",
      pairs,
      marketData: null,
    });
  }
});

// Port listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 🔹 Melhor bid = maior preço
// 🔹 Melhor ask = menor preço
// // mid-price = (melhor bid + melhor ask) / 2
// Na documentação da Blockchain Exchange API (endpoint /exchange/l2/{symbol}), o padrão é:
// bids → ordenados do maior para o menor preço (descendente)
// asks → ordenados do menor para o maior preço (ascendente)
// Ou seja, conceitualmente:
// bids[0] → melhor bid
// asks[0] → melhor ask
// Já foi feito npm init npm i express npm i axios npm i body-parser npm i ejs changed type to module
