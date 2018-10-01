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
const fileOpts = {
  root: __dirname,
  maxAge: 0,
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true,
  },
};

app.get('/', (req, res) => {
  res.sendFile('./index.html', fileOpts);
});

/* fetch entire blockchain */
app.get('/blockchain', (req, res) => {
  res.send(JSON.stringify(coin, null, 2));
});

/* create a new transaction */
app.post('/transaction', (req, res) => {
  const {
    body: { transaction },
  } = req;
  coin.addTransaction(transaction);
  res.json({
    result: 'success',
    transaction
  });
});
app.post(
  '/transaction/broadcast',
  [
    (req, res, next) => {
      const {
        body: { amount, sender, recipient },
      } = req;
      const transaction = coin.createNewTransaction(amount, sender, recipient);
      coin.addTransaction(transaction);
      req.transaction = transaction;
    },
    async (req, res, next) => {
      const { transaction } = req;
      try {
        await Promise.all(
          coin.networkNodes.map(url =>
            rp({
              uri: `${url}/transaction`,
              method: 'POST',
              body: { transaction },
              json: true,
            })
          )
        );
      } catch (error) {
        /* */
      }
      next();
    },
  ],
  ({ transaction }, res) => {
    res.json({
      result: 'success',
      transaction
    });
  }
);

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
const myUrl = `http://${coin.currentNodeUrl}`;
app.post(
  '/register-and-broadcast-node',
  [
    (req, res, next) => {
      // skip it if it is this url or a known url
      const {
        body: { newNodeUrl },
      } = req;
      const { networkNodes } = coin;
      if (newNodeUrl in [...networkNodes, myUrl]) {
        return;
      }
      next();
    },
    async (req, res, next) => {
      // actually add and broadcast
      const {
        body: { newNodeUrl },
      } = req;
      const { networkNodes } = coin;
      const existingNodes = [...networkNodes];
      coin.networkNodes.push(newNodeUrl);
      try {
        await Promise.all([
          // tell everyone known
          ...existingNodes.map(url =>
            rp({
              uri: `${url}/register-node`,
              method: 'POST',
              body: { newNodeUrl },
              json: true,
            })
          ),
          // tell the new one
          rp({
            uri: `${newNodeUrl}/register-nodes-bulk`,
            method: 'POST',
            body: { allNetworkNodes: [...existingNodes, myUrl] },
            json: true,
          });
        ]);
      } catch (error) {
        /* */
      }
      next();
    },
  ],
  (req, res) => {
    // signal done-ness
    res.json({
      result: 'success',
    });
  }
);

/* register a node with the network */
app.post('/register-node', (req, res) => {
  const {
    body: { newNodeUrl },
  } = req;
  coin.networkNodes.push(newNodeUrl);
  res.json({
    result: 'success',
  });
});

/* register bulk nodes */
app.post('/register-nodes-bulk', (req, res) => {
  const {
    body: { allNetworkNodes },
  } = req;
  const { networkNodes: currentNodes } = coin;
  coin.networkNodes = [...currentNodes, ...allNetworkNodes];
  res.json({
    result: 'success',
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
