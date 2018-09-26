import express from 'express';
import uuid from 'uuid/v1';
import Blockchain from './blockchain';
import { json, urlencoded } from 'body-parser';

const nodeAddress = uuid().replace(/-/g, '');

const app = express();

app.use(json());
app.use(urlencoded({ extended: false }));

const port = 8089;
const coin = new Blockchain();

app.get('/', (req, res) => {
  res.send('Hello World');
});

/* fetch entire blockchain */
app.get('/blockchain', (req, res) => {
  res.send(JSON.stringify(coin, null, 2));
});

/* create a new transaction */
app.post('/transaction', (req, res) => {
  const {
    body: { amount, sender, recipient },
  } = req;
  const expectedBlockIndex = coin.createNewTransaction(amount, sender, recipient);
  res.json({ expectedBlockIndex });
});

/* mine a new block */
app.get('/mine', (req, res) => {
  const { index: previousIndex, hash: previousBlockHash } = coin.getLastBlock();
  const currentBlockData = {
    transactions: coin.pendingTransactions,
    index: previousIndex + 1,
  };
  const nonce = coin.proofOfWork(previousBlockHash, currentBlockData);
  const hash = coin.hashBlock(previousBlockHash, currentBlockData, nonce);

  coin.createNewTransaction(12.5, '00', nodeAddress);

  const block = coin.createNewBlock(nonce, previousBlockHash, hash);
  res.json({
    result: 'success',
    block,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
