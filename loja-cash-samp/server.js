const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ Webhook do Discord
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1477744047991816193/jb9YgwaCPWRNdFgBTpgDbk7OvCLaP-PVy-IIoNgCd_iCzg1K1a5vB1aAQbsaWyn_nVut";

// ⚠️ Chave PIX
const PIX_KEY = "ruanf7627@gmail.com";

// ⚠️ Senha admin
const ADMIN_PASSWORD = "1234";

let pedidos = [];

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Rota principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Comprar Cash
app.post("/comprar", async (req, res) => {
    const { id, email, quantidade } = req.body;
    if (!id || !email || !quantidade) return res.status(400).json({ erro: "Preencha todos os campos." });

    const valor = quantidade * 1;

    const pedido = {
        numero: pedidos.length + 1,
        idConta: id,
        email,
        quantidade,
        valor,
        status: "Aguardando"
    };

    pedidos.push(pedido);

    await axios.post(DISCORD_WEBHOOK, {
        content: `🛒 PEDIDO #${pedido.numero}
ID: ${id}
Email: ${email}
Cash: ${quantidade}
Valor: R$${valor}
Status: Aguardando`
    });

    res.json({ sucesso: true, valor, pix: PIX_KEY });
});

// Listar pedidos para admin
app.get("/pedidos", (req, res) => res.json(pedidos));

// Aprovar pedido
app.post("/aprovar", (req, res) => {
    const { numero, senha } = req.body;
    if (senha !== ADMIN_PASSWORD) return res.status(401).json({ erro: "Senha incorreta" });

    const pedido = pedidos.find(p => p.numero == numero);
    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" });

    pedido.status = "Aprovado";
    res.json({ sucesso: true });
});

app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));