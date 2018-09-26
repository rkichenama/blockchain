import Blockchain from './blockchain';
import sha256 from 'sha256';

describe('Blockchain', () => {
  let coin;

  const initialBlock = expect.objectContaining({
    index: 1,
    timestamp: expect.any(Number),
    transactions: [],
    nonce: 100,
    hash: '0',
    previousBlockHash: '0',
  });

  const previousBlockHash = 'OINAISDFN09N09ASDNF90N90ASNDF';
  const currentBlockData = [
    { amount: 10, sender: 'N90ANS90N90ANSDFN', recipient: '90NA90SNDF90ANSDF09N' },
    { amount: 30, sender: '09ANS09DFNA8SDNF', recipient: 'UIANSIUDFUIABSDUIFB' },
    { amount: 200, sender: '89ANS89DFN98ASNDF89', recipient: 'AUSDF89ANSD9FNASD' },
  ];

  beforeEach(() => {
    coin = new Blockchain();
  });

  it('should exist', () => {
    expect(coin).toBeDefined();
    expect(coin).toHaveProperty('currentNodeUrl');
    expect(coin).toMatchObject(
      expect.objectContaining({
        pendingTransactions: [],
        networkNodes: [],
        chain: expect.arrayContaining([initialBlock]),
      })
    );
    expect(coin.chain).toHaveLength(1);
  });

  it('should return last block in chain', () => {
    const block = coin.getLastBlock();
    expect(block).toMatchObject(initialBlock);
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
        previousBlockHash: 'OINA90SDNF90N',
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
        recipient: 'recip',
      })
    );
  });

  it('should return a sha256 hash', () => {
    const nonce = 100;

    expect(coin.hashBlock(previousBlockHash, currentBlockData, nonce)).toBe(
      sha256(`${previousBlockHash}${nonce}${JSON.stringify(currentBlockData)}`)
    );
  });

  it('should return a nonce to fit proofOfWork', done => {
    const nonce = coin.proofOfWork(previousBlockHash, currentBlockData);
    expect(coin.hashBlock(previousBlockHash, currentBlockData, nonce)).toMatch(/^0000/);
    done();
  });
});
