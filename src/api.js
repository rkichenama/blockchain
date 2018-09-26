import express from 'express';
import uuid from 'uuid/v1';
import Blockchain from './blockchain';
import { json, urlencoded } from 'body-parser';
import rp from 'request-promise';

const nodeAddress = uuid().replace(/-/g, '');

const app = express();

app.use(json());
app.use(urlencoded({ extended: false }));

const port = process.argv[2];
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
  const transaction = coin.createNewTransaction(amount, sender, recipient);
  res.json({ transaction });
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

/* register a node and broadcast it to the network */
app.post('/register-and-broadcast-node', (req, res) => {
  const { body: { newNodeUrl } } = req;
  const { networkNodes } = coin;
  const existingNodes = [ ...networkNodes ];

  if (!(newNodeUrl in networkNodes)) { coin.networkNodes.push(newNodeUrl) }
  Promise.all(
    existingNodes.map(url => (
      rp({
        uri: `${url}/register-node`,
        method: 'POST',
        body: { newNodeUrl },
        json: true
      })
    ))
  ).then(data => (
    rp({
      uri: `${newNodeUrl}/register-nodes-bulk`,
      method: 'POST',
      body: { allNetworkNodes: [ ...existingNodes, `http://${coin.currentNodeUrl}` ] },
      json: true
    })
  )).then(data => {
    res.json({
      result: 'success'
    });
  });
});

/* register a node with the network */
app.post('/register-node', (req, res) => {
  const { body: { newNodeUrl } } = req;
  coin.networkNodes.push(newNodeUrl);
  res.json({
    result: 'success'
  });
});

/* register abulk nodes */
app.post('/register-nodes-bulk', (req, res) => {
  const { body: { allNetworkNodes } } = req;
  const { networkNodes: currentNodes } = coin;
  coin.networkNodes = [ ...currentNodes, ...allNetworkNodes ];
  res.json({
    result: 'success'
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
