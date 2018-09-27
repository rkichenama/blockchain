import sha256 from 'sha256';
import uuid from 'uuid/v1';

const [ , , port, url ] = process.argv;
module.exports = class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = `${url}:${port}`;
    this.networkNodes = [];
    this.createNewBlock(100, '0', '0');
  }

  createNewBlock = (nonce, previousBlockHash, hash) => {
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      hash,
      previousBlockHash,
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  };

  getLastBlock = () => this.chain.slice(-1)[0];

  createNewTransaction = (amount, sender, recipient) => {
    return {
      amount,
      sender,
      recipient,
      id: uuid().replace(/-/g, '')
    };
  };

  addTransaction = transaction => {
    this.pendingTransactions.push(transaction);
    return this.getNextIndex();
  }

  getNextIndex = ({ index } = this.getLastBlock()) => (index + 1);

  hashBlock = (previousBlockHash, currentBlockData, nonce) =>
    sha256(`${previousBlockHash}${nonce}${JSON.stringify(currentBlockData)}`);

  proofOfWork = (previousBlockHash, currentBlockData) => {
    let nonce = 0;
    let hash;
    do {
      hash = this.hashBlock(previousBlockHash, currentBlockData, ++nonce);
    } while (!/^0000/.test(hash));
    return nonce;
  };
};
