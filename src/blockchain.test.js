const Blockchain = require('./blockchain');

describe('Blockchain', () => {
  let coin;

  const initialBlock = expect.objectContaining({
    index: 1,
    timestamp: expect.any(Number),
    transactions: [],
    nonce: 100,
    hash: '0',
    previousBlockHash: '0'
  });

  beforeEach(() => {
    coin = new Blockchain();
  });

  it('should exist', () => {
    expect(coin).toBeDefined();
    expect(coin).toMatchObject(
      expect.objectContaining({
        pendingTransactions: [],
        networkNodes: [],
        currentNodeUrl: expect.any(String),
        chain: expect.arrayContaining([
          initialBlock
        ])
      })
    );
    expect(coin.chain).toHaveLength(1);
  });

  it('should return last block in chain', () => {
    const block = coin.getLastBlock();
    expect(block).toMatchObject(
      initialBlock
    );
  });

  it('should create a new block', () => {
    const block = coin.createNewBlock(2389, 'OINA90SDNF90N', '90ANSD9F0N9009N');
    expect(block).toMatchObject(
      expect.objectContaining({
        index: 2,
        timestamp: expect.any(Number),
        transactions: [],
        nonce: 2389,
        hash: '90ANSD9F0N9009N',
        previousBlockHash: 'OINA90SDNF90N'
      })
    );
    expect(coin.chain).toHaveLength(2);
    expect(coin.getLastBlock()).toEqual(block);
  });

  it('should create a new transaction', () => {
    const blockID = coin.createNewTransaction(50, 'send', 'recip');
    const { index } = coin.getLastBlock();
    expect(blockID).toEqual(index + 1);
    expect(coin.pendingTransactions).toHaveLength(1);
    expect(coin.pendingTransactions[0]).toMatchObject(
      expect.objectContaining({
        amount: 50,
        sender: 'send',
        recipient: 'recip'
      })
    );
  });
});
