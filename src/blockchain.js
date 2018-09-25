const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

module.exports = class Blockchain {
  constructor () {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
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
      previousBlockHash
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  }

  getLastBlock = () => this.chain.slice(-1)[0]

  createNewTransaction = (amount, sender, recipient) => {
    this.pendingTransactions.push({ amount, sender, recipient });
    const { index } = this.getLastBlock();
    return (index + 1)
  }
}
