import https from 'https';
import fs from 'fs';
import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type',
}));

app.use(express.json());

const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const PIX_KEY = process.env.EFI_PIX_KEY;

const httpsAgent = new https.Agent({
  pfx: fs.readFileSync('./certificado.p12'),
  passphrase: ''
});

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const response = await axios.post(
    'https://pix.api.efipay.com.br/oauth/token',
    { grant_type: 'client_credentials' },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      httpsAgent,
      timeout: 10000
    }
  );

  return response.data.access_token;
}

// 🧾 Criar pagamento Pix
const transacoes = {}; // mapeia txid -> productId

app.post('/create-payment', async (req, res) => {
  const { email, items } = req.body;

  if (!email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    const token = await getAccessToken();
    const total = items.reduce((acc, item) => acc + Number(item.preco || 0), 0).toFixed(2);

    const pixPayload = {
      calendario: { expiracao: 3600 },
      valor: { original: total },
      chave: PIX_KEY,
      solicitacaoPagador: `Pedido de ${email}`
    };

    const response = await axios.post(
      'https://pix.api.efipay.com.br/v2/cob',
      pixPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    // Verificação de estoque do produto
const produtoId = items[0]?.id;
if (!produtoId) {
  return res.status(400).json({ error: 'Produto inválido' });
}

const estoquePath = `./estoque-${produtoId}.txt`;
if (!fs.existsSync(estoquePath)) {
  return res.status(400).json({ error: 'Estoque não encontrado para o produto' });
}

const linhas = fs.readFileSync(estoquePath, 'utf-8').split('\n').filter(Boolean);
if (linhas.length === 0) {
  return res.status(400).json({ error: 'Produto esgotado no momento' });
}


    const data = response.data;
    transacoes[data.txid] = items[0].id; // salva o ID do produto

    const qrResponse = await axios.get(
      `https://pix.api.efipay.com.br/v2/loc/${data.loc.id}/qrcode`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        httpsAgent
      }
    );

    res.json({
      id: data.txid,
      qr_code_id: data.loc.id,
      pix_url: data.loc.location,
      qr_code: qrResponse.data.qrcode,
      qr_image: qrResponse.data.imagemQrcode
    });

  } catch (error) {
    console.error("Erro ao criar pagamento:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar pagamento',
      details: error.response?.data || error.message
    });
  }
});


// 🔁 Webhook de confirmação
const pagamentosConfirmados = new Set();

app.post('/webhook', async (req, res) => {
  const { pix } = req.body;

  if (pix && pix.length > 0) {
    const pagamento = pix[0];
    const txid = pagamento.txid;

    if (!pagamentosConfirmados.has(txid)) {
      pagamentosConfirmados.add(txid);
      console.log(`✅ Pagamento confirmado para TXID: ${txid}`);
    }
  }

  res.sendStatus(200);
});

app.get('/download/:id', async (req, res) => {
  const { id } = req.params;
  const token = await getAccessToken();

  try {
    const consulta = await axios.get(
      `https://pix.api.efipay.com.br/v2/cob/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        httpsAgent
      }
    );

    if (consulta.data.status !== 'CONCLUIDA') {
      return res.status(403).send('Pagamento ainda não foi confirmado');
    }

    const productId = transacoes[id];
    if (!productId) return res.status(400).send('Produto não identificado');

    const estoquePath = `./estoque-${productId}.txt`;
    if (!fs.existsSync(estoquePath)) {
      return res.status(500).send('Estoque esgotado');
    }

    let contas = fs.readFileSync(estoquePath, 'utf-8').split('\n').filter(Boolean);
    if (contas.length === 0) {
      return res.status(500).send('Estoque esgotado');
    }

    const randomIndex = Math.floor(Math.random() * contas.length);
    const contaSelecionada = contas[randomIndex];
    contas.splice(randomIndex, 1);
    fs.writeFileSync(estoquePath, contas.join('\n'));

    const fileContent = contaSelecionada;
    res.setHeader('Content-Disposition', 'attachment; filename=conta.txt');
    res.setHeader('Content-Type', 'text/plain');
    res.send(fileContent);

  } catch (err) {
    console.error('Erro ao verificar pagamento:', err.response?.data || err.message);
    res.status(500).send('Erro ao verificar status do pagamento');
  }
});


app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

app.post('/admin/estoque/:productId', (req, res) => {
  const { contas } = req.body;
  const { productId } = req.params;

  if (!Array.isArray(contas) || contas.length === 0) {
    return res.status(400).json({ error: 'Nenhuma conta fornecida' });
  }

  const path = `./estoque-${productId}.txt`;

  const linhas = contas
    .map(c => c.trim())
    .filter(c => c.includes(':') && c.length > 3);

  if (linhas.length === 0) {
    return res.status(400).json({ error: 'Formato de conta inválido' });
  }

  fs.appendFileSync(path, '\n' + linhas.join('\n'));
  res.json({ sucesso: true, adicionadas: linhas.length });
});
