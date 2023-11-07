import { ProductorCustomer } from '../utils/tools/productor-customer';

describe('Productor-Customer', () => {
  let productor: ProductorCustomer<string>
  let key: string

  beforeEach(async () => {
    productor = new ProductorCustomer<string>()
  });

  describe('root', () => {
    it('pub should be work', () => {
      productor.on('pub', (task) => {
        key = task.key
        expect(task.value).toEqual('test')
      })
      productor.insert('test')
    });

    it('sub should be work', () => {
      productor.on('sub', (task) => {
        expect(task.key).toEqual(key)
      })
      productor.ack(key)
      expect(productor.vindicator()).toEqual(false)
    });
  });
});