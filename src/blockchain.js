import sha256 from 'sha256';

const [ , , port, url ] = process.argv;
console.log(url, port);
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
    this.pendingTransactions.push({ amount, sender, recipient });
    const { index } = this.getLastBlock();
    return index + 1;
  };

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
