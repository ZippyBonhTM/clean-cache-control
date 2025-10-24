import { LocalSavePurchases } from '@/data/usecases/save-purchases/local-save-purchases';
import { CacheStore } from '@/data/protocols/cache/cache-store';
// sut = Sistem Under Test

class CacheStoreSpy implements CacheStore {
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey: string;
  insertKey: string;

  delete(key: string): void {
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert(key: string): void {
    this.insertCallsCount++;
    this.insertKey = key;
  };
}

type SutTypes = {
  sut: LocalSavePurchases;
  cacheStore: CacheStoreSpy;
};

const makeSut = (): SutTypes => {
  const cacheStore = new CacheStoreSpy();
  const sut = new LocalSavePurchases(cacheStore);
  return { cacheStore, sut };
};

describe('LocalSavePurchases', () => {
  test('Shold not delete cache on sut.init', () => {
    const { cacheStore } = makeSut();
    expect(cacheStore.deleteCallsCount).toBe(0);
  });

  test('Shold delete old cache on sut.save', async () => {
    const { cacheStore, sut } = makeSut();
    await sut.save();
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(cacheStore.deleteKey).toBe('purchases');
  });

  test('Shold not insert new cache if delete falils', async () => {
    const { cacheStore, sut } = makeSut();
    jest.spyOn(cacheStore, 'delete').mockImplementationOnce(() => { throw new Error(); });
    const promice = sut.save();
    expect(cacheStore.insertCallsCount).toBe(0);
    expect(promice).rejects.toThrow();
  });

  test('Shold insert new cache if delete succeeds', async () => {
    const { cacheStore, sut } = makeSut();
    sut.save();
    expect(cacheStore.insertCallsCount).toBe(1);
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(cacheStore.insertKey).toBe('purchases');
  });
});