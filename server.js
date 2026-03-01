const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_WEBHOOK = "COLE_SEU_WEBHOOK_AQUI";
const PIX_KEY = "SUA_CHAVE_PIX_AQUI";
const ADMIN_PASSWORD = "1234"; // MUDE ISSO

let pedidos = [];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/comprar", async (req, res) => {
    const { id, email, quantidade } = req.body;
    const valor = quantidade * 1;

    const pedido = {
        idConta: id,
        email,
        quantidade,
        valor,
        status: "Aguardando",
        numero: pedidos.length + 1
    };

    pedidos.push(pedido);

    await axios.post(DISCORD_WEBHOOK, {
        content: `🛒 NOVO PEDIDO #${pedido.numero}
ID: ${id}
Email: ${email}
Cash: ${quantidade}
Valor: R$${valor}
Status: Aguardando`
    });

    res.json({
        sucesso: true,
        valor,
        pix: PIX_KEY
    });
});

app.get("/pedidos", (req, res) => {
    res.json(pedidos);
});

app.post("/aprovar", (req, res) => {
    const { numero, senha } = req.body;

    if (senha !== ADMIN_PASSWORD) {
        return res.status(401).json({ erro: "Senha incorreta" });
    }

    const pedido = pedidos.find(p => p.numero == numero);
    if (pedido) {
        pedido.status = "Aprovado";
        return res.json({ sucesso: true });
    }

    res.status(404).json({ erro: "Pedido não encontrado" });
});

app.listen(PORT, () => {
    console.log("Servidor rodando...");
});