import {
  Agile,
  CollectionPersistent,
  Collection,
  Storage,
  Persistent,
  StatePersistent,
  Group,
  Item,
} from '../../../src';
import { LogMock } from '../../helper/logMock';

describe('CollectionPersistent Tests', () => {
  interface ItemInterface {
    id: string;
    name: string;
  }

  let dummyAgile: Agile;
  let dummyCollection: Collection<ItemInterface>;

  beforeEach(() => {
    jest.clearAllMocks();
    LogMock.mockLogs();

    dummyAgile = new Agile({ localStorage: false });
    dummyCollection = new Collection<ItemInterface>(dummyAgile, {
      key: 'dummyCollectionKey',
    });

    jest.spyOn(CollectionPersistent.prototype, 'instantiatePersistent');
    jest.spyOn(CollectionPersistent.prototype, 'initialLoading');
  });

  it('should create CollectionPersistent and should call initialLoading if Persistent is ready (default config)', () => {
    // Overwrite instantiatePersistent once to not call it
    jest
      .spyOn(CollectionPersistent.prototype, 'instantiatePersistent')
      .mockImplementationOnce(function () {
        // @ts-ignore
        this.ready = true;
      });

    const collectionPersistent = new CollectionPersistent(dummyCollection);

    expect(collectionPersistent).toBeInstanceOf(CollectionPersistent);
    expect(collectionPersistent.instantiatePersistent).toHaveBeenCalledWith({
      key: undefined,
      storageKeys: [],
      defaultStorageKey: null,
    });
    expect(collectionPersistent.initialLoading).toHaveBeenCalled();

    expect(collectionPersistent._key).toBe(CollectionPersistent.placeHolderKey);
    expect(collectionPersistent.ready).toBeTruthy();
    expect(collectionPersistent.isPersisted).toBeFalsy();
    expect(collectionPersistent.onLoad).toBeUndefined();
    expect(collectionPersistent.storageKeys).toStrictEqual([]);
    expect(collectionPersistent.config).toStrictEqual({
      defaultStorageKey: null, // is assigned in 'instantiatePersistent' which is mocked
    });
  });

  it('should create CollectionPersistent and should call initialLoading if Persistent is ready (specific config)', () => {
    // Overwrite instantiatePersistent once to not call it and set ready property
    jest
      .spyOn(CollectionPersistent.prototype, 'instantiatePersistent')
      .mockImplementationOnce(function () {
        // @ts-ignore
        this.ready = true;
      });

    const collectionPersistent = new CollectionPersistent(dummyCollection, {
      key: 'collectionPersistentKey',
      storageKeys: ['test1', 'test2'],
      defaultStorageKey: 'test2',
    });

    expect(collectionPersistent).toBeInstanceOf(CollectionPersistent);
    expect(collectionPersistent.instantiatePersistent).toHaveBeenCalledWith({
      key: 'collectionPersistentKey',
      storageKeys: ['test1', 'test2'],
      defaultStorageKey: 'test2',
    });
    expect(collectionPersistent.initialLoading).toHaveBeenCalled();

    expect(collectionPersistent._key).toBe(CollectionPersistent.placeHolderKey);
    expect(collectionPersistent.ready).toBeTruthy();
    expect(collectionPersistent.isPersisted).toBeFalsy();
    expect(collectionPersistent.onLoad).toBeUndefined();
    expect(collectionPersistent.storageKeys).toStrictEqual([]);
    expect(collectionPersistent.config).toStrictEqual({
      defaultStorageKey: null, // is assigned in 'instantiatePersistent' which is mocked
    });
  });

  it("should create CollectionPersistent and shouldn't call initialLoading if Persistent isn't ready", () => {
    // Overwrite instantiatePersistent once to not call it and set ready property
    jest
      .spyOn(CollectionPersistent.prototype, 'instantiatePersistent')
      .mockImplementationOnce(function () {
        // @ts-ignore
        this.ready = false;
      });

    const collectionPersistent = new CollectionPersistent(dummyCollection);

    expect(collectionPersistent).toBeInstanceOf(CollectionPersistent);
    expect(collectionPersistent.collection()).toBe(dummyCollection);
    expect(collectionPersistent.instantiatePersistent).toHaveBeenCalledWith({
      key: undefined,
      storageKeys: [],
      defaultStorageKey: null,
    });
    expect(collectionPersistent.initialLoading).not.toHaveBeenCalled();

    expect(collectionPersistent._key).toBe(CollectionPersistent.placeHolderKey);
    expect(collectionPersistent.ready).toBeFalsy();
    expect(collectionPersistent.isPersisted).toBeFalsy();
    expect(collectionPersistent.onLoad).toBeUndefined();
    expect(collectionPersistent.storageKeys).toStrictEqual([]);
    expect(collectionPersistent.config).toStrictEqual({
      defaultStorageKey: null,
    });
  });

  it("should create CollectionPersistent and shouldn't call initialLoading if Persistent is ready (config.instantiate = false)", () => {
    // Overwrite instantiatePersistent once to not call it and set ready property
    jest
      .spyOn(CollectionPersistent.prototype, 'instantiatePersistent')
      .mockImplementationOnce(function () {
        // @ts-ignore
        this.ready = true;
      });

    const collectionPersistent = new CollectionPersistent(dummyCollection, {
      instantiate: false,
    });

    expect(collectionPersistent).toBeInstanceOf(CollectionPersistent);
    expect(collectionPersistent.collection()).toBe(dummyCollection);
    expect(collectionPersistent.instantiatePersistent).toHaveBeenCalledWith({
      key: undefined,
      storageKeys: [],
      defaultStorageKey: null,
    });
    expect(collectionPersistent.initialLoading).not.toHaveBeenCalled();

    expect(collectionPersistent._key).toBe(CollectionPersistent.placeHolderKey);
    expect(collectionPersistent.ready).toBeTruthy();
    expect(collectionPersistent.isPersisted).toBeFalsy();
    expect(collectionPersistent.onLoad).toBeUndefined();
    expect(collectionPersistent.storageKeys).toStrictEqual([]);
    expect(collectionPersistent.config).toStrictEqual({
      defaultStorageKey: null,
    });
  });

  describe('CollectionPersistent Function Tests', () => {
    let collectionPersistent: CollectionPersistent<ItemInterface>;
    let dummyItem1: Item<ItemInterface>;
    let dummyItem2: Item<ItemInterface>;
    let dummyItem3: Item<ItemInterface>;
    let dummyItem4WithoutPersistent: Item<ItemInterface>;

    beforeEach(() => {
      collectionPersistent = new CollectionPersistent(dummyCollection, {
        key: 'collectionPersistentKey',
        storageKeys: ['dummyStorage'],
      });
      dummyAgile.registerStorage(
        new Storage({
          key: 'dummyStorage',
          methods: {
            get: jest.fn(),
            remove: jest.fn(),
            set: jest.fn(),
          },
        })
      );
      dummyItem1 = new Item<ItemInterface>(dummyCollection, {
        id: '1',
        name: 'frank',
      });
      dummyItem1.persistent = new StatePersistent(dummyItem1);
      dummyItem1.persist = jest.fn();

      dummyItem2 = new Item<ItemInterface>(dummyCollection, {
        id: '2',
        name: 'dieter',
      });
      dummyItem2.persistent = new StatePersistent(dummyItem2);
      dummyItem2.persist = jest.fn();

      dummyItem3 = new Item<ItemInterface>(dummyCollection, {
        id: '3',
        name: 'hans',
      });
      dummyItem3.persistent = new StatePersistent(dummyItem3);
      dummyItem3.persist = jest.fn();

      dummyItem4WithoutPersistent = new Item<ItemInterface>(dummyCollection, {
        id: '4',
        name: 'jeff',
      });
    });

    describe('setKey function tests', () => {
      beforeEach(() => {
        collectionPersistent.removePersistedValue = jest.fn();
        collectionPersistent.persistValue = jest.fn();
        collectionPersistent.initialLoading = jest.fn();
      });

      it('should update key with valid key in ready Persistent', async () => {
        collectionPersistent.ready = true;
        collectionPersistent._key = 'dummyKey';
        jest
          .spyOn(collectionPersistent, 'validatePersistent')
          .mockReturnValueOnce(true);

        await collectionPersistent.setKey('newKey');

        expect(collectionPersistent._key).toBe('newKey');
        expect(collectionPersistent.validatePersistent).toHaveBeenCalled();
        expect(collectionPersistent.initialLoading).not.toHaveBeenCalled();
        expect(collectionPersistent.persistValue).toHaveBeenCalledWith(
          'newKey'
        );
        expect(collectionPersistent.removePersistedValue).toHaveBeenCalledWith(
          'dummyKey'
        );
      });

      it('should update key with not valid key in ready Persistent', async () => {
        collectionPersistent.ready = true;
        collectionPersistent._key = 'dummyKey';
        jest
          .spyOn(collectionPersistent, 'validatePersistent')
          .mockReturnValueOnce(false);

        await collectionPersistent.setKey();

        expect(collectionPersistent._key).toBe(Persistent.placeHolderKey);
        expect(collectionPersistent.validatePersistent).toHaveBeenCalled();
        expect(collectionPersistent.initialLoading).not.toHaveBeenCalled();
        expect(collectionPersistent.persistValue).not.toHaveBeenCalled();
        expect(collectionPersistent.removePersistedValue).toHaveBeenCalledWith(
          'dummyKey'
        );
      });

      it('should update key with valid key in not ready Persistent', async () => {
        collectionPersistent.ready = false;
        collectionPersistent._key = 'dummyKey';
        jest
          .spyOn(collectionPersistent, 'validatePersistent')
          .mockReturnValueOnce(true);

        await collectionPersistent.setKey('newKey');

        expect(collectionPersistent._key).toBe('newKey');
        expect(collectionPersistent.validatePersistent).toHaveBeenCalled();
        expect(collectionPersistent.initialLoading).toHaveBeenCalled();
        expect(collectionPersistent.persistValue).not.toHaveBeenCalled();
        expect(
          collectionPersistent.removePersistedValue
        ).not.toHaveBeenCalled();
      });

      it('should update key with not valid key in not ready Persistent', async () => {
        collectionPersistent.ready = false;
        collectionPersistent._key = 'dummyKey';
        jest
          .spyOn(collectionPersistent, 'validatePersistent')
          .mockReturnValueOnce(false);

        await collectionPersistent.setKey();

        expect(collectionPersistent._key).toBe(Persistent.placeHolderKey);
        expect(collectionPersistent.validatePersistent).toHaveBeenCalled();
        expect(collectionPersistent.initialLoading).not.toHaveBeenCalled();
        expect(collectionPersistent.persistValue).not.toHaveBeenCalled();
        expect(
          collectionPersistent.removePersistedValue
        ).not.toHaveBeenCalled();
      });
    });

    describe('initialLoading function tests', () => {
      beforeEach(() => {
        jest.spyOn(Persistent.prototype, 'initialLoading');
      });

      it('should call initialLoad in parent and set Collection.isPersisted to true', async () => {
        await collectionPersistent.initialLoading();

        expect(Persistent.prototype.initialLoading).toHaveBeenCalled();
        expect(dummyCollection.isPersisted).toBeTruthy();
      });
    });

    describe('loadPersistedValue function tests', () => {
      let dummyDefaultGroup: Group<ItemInterface>;
      let placeholderItem1: Item<ItemInterface>;
      let placeholderItem2: Item<ItemInterface>;
      let placeholderItem3: Item<ItemInterface>;

      beforeEach(() => {
        collectionPersistent.config.defaultStorageKey = 'test';

        placeholderItem1 = dummyCollection.createPlaceholderItem('1');
        placeholderItem1.persist = jest.fn();
        placeholderItem2 = dummyCollection.createPlaceholderItem('2');
        placeholderItem2.persist = jest.fn();
        placeholderItem3 = dummyCollection.createPlaceholderItem('3');
        placeholderItem3.persist = jest.fn();

        dummyDefaultGroup = new Group(dummyCollection, ['1', '2', '3'], {
          key: 'default',
        });
        dummyDefaultGroup.persist = jest.fn();
        dummyDefaultGroup.persistent = new StatePersistent(dummyDefaultGroup);
        if (dummyDefaultGroup.persistent) {
          dummyDefaultGroup.persistent.ready = true;
          dummyDefaultGroup.persistent.initialLoading = jest.fn();
        }

        collectionPersistent.setupSideEffects = jest.fn();

        dummyCollection.getDefaultGroup = jest.fn(
          () => dummyDefaultGroup as any
        );
        dummyCollection.collectItem = jest.fn();

        dummyAgile.storages.get = jest.fn();
      });

      it('should load default Group and apply persisted value to Items that are already present in Collection (persistentKey)', async () => {
        collectionPersistent.ready = true;
        dummyCollection.data = {
          ['3']: dummyItem3,
        };
        dummyAgile.storages.get = jest
          .fn()
          .mockReturnValueOnce(Promise.resolve(true));
        dummyDefaultGroup._value = ['3'];

        const response = await collectionPersistent.loadPersistedValue();

        expect(response).toBeTruthy();
        expect(dummyAgile.storages.get).toHaveBeenCalledWith(
          collectionPersistent._key,
          collectionPersistent.config.defaultStorageKey
        );

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).toHaveBeenCalledWith(
          CollectionPersistent.getGroupStorageKey(
            dummyDefaultGroup._key,
            collectionPersistent._key
          ),
          {
            loadValue: false,
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );
        expect(dummyDefaultGroup.persistent?.initialLoading).toHaveBeenCalled();
        expect(dummyDefaultGroup.isPersisted).toBeTruthy();

        expect(dummyItem3.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            '3',
            collectionPersistent._key
          ),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );

        expect(collectionPersistent.setupSideEffects).toHaveBeenCalledWith(
          collectionPersistent._key
        );
      });

      it("should load default Group and create/add persisted Items that aren't present in Collection yet (persistentKey)", async () => {
        collectionPersistent.ready = true;
        dummyCollection.data = {};
        dummyAgile.storages.get = jest
          .fn()
          .mockReturnValueOnce(Promise.resolve(true));
        placeholderItem1.persist = jest.fn(function () {
          placeholderItem1.persistent = new StatePersistent(placeholderItem1);
          placeholderItem1.persistent.ready = true;
          placeholderItem1.persistent.loadPersistedValue = jest
            .fn()
            .mockReturnValueOnce(true);
          return null as any;
        });
        placeholderItem2.persist = jest.fn(function () {
          placeholderItem2.persistent = new StatePersistent(placeholderItem2);
          placeholderItem2.persistent.ready = false;
          placeholderItem2.persistent.loadPersistedValue = jest.fn();
          return null as any;
        });
        placeholderItem3.persist = jest.fn(function () {
          placeholderItem3.persistent = new StatePersistent(placeholderItem3);
          placeholderItem3.persistent.ready = true;
          placeholderItem3.persistent.loadPersistedValue = jest
            .fn()
            .mockReturnValueOnce(false);
          return null as any;
        });
        dummyCollection.createPlaceholderItem = jest
          .fn()
          .mockReturnValueOnce(placeholderItem1)
          .mockReturnValueOnce(placeholderItem2)
          .mockReturnValueOnce(placeholderItem3);
        dummyDefaultGroup._value = ['1', '2', '3'];

        const response = await collectionPersistent.loadPersistedValue();

        expect(response).toBeTruthy();
        expect(dummyAgile.storages.get).toHaveBeenCalledWith(
          collectionPersistent._key,
          collectionPersistent.config.defaultStorageKey
        );

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).toHaveBeenCalledWith(
          CollectionPersistent.getGroupStorageKey(
            dummyDefaultGroup._key,
            collectionPersistent._key
          ),
          {
            loadValue: false,
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );
        expect(dummyDefaultGroup.persistent?.initialLoading).toHaveBeenCalled();
        expect(dummyDefaultGroup.isPersisted).toBeTruthy();

        expect(dummyCollection.createPlaceholderItem).toHaveBeenCalledWith('1');
        expect(dummyCollection.createPlaceholderItem).toHaveBeenCalledWith('2');
        expect(dummyCollection.createPlaceholderItem).toHaveBeenCalledWith('3');
        expect(placeholderItem1.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            '1',
            collectionPersistent._key
          ),
          {
            loadValue: false,
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );
        expect(placeholderItem2.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            '2',
            collectionPersistent._key
          ),
          {
            loadValue: false,
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );
        expect(placeholderItem3.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            '3',
            collectionPersistent._key
          ),
          {
            loadValue: false,
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );
        expect(dummyCollection.collectItem).toHaveBeenCalledWith(
          placeholderItem1
        );
        expect(dummyCollection.collectItem).not.toHaveBeenCalledWith(
          placeholderItem2
        ); // Because Item persistent isn't ready
        expect(dummyCollection.collectItem).not.toHaveBeenCalledWith(
          placeholderItem3
        ); // Because Item persistent 'leadPersistedValue()' returned false -> Item properly doesn't exist in Storage

        expect(collectionPersistent.setupSideEffects).toHaveBeenCalledWith(
          collectionPersistent._key
        );
      });

      it(
        'should load default Group, ' +
          "create/add persisted Items that aren't present in Collection yet " +
          'and apply persisted value to Items that are already present in Collection (specific key)',
        async () => {
          collectionPersistent.ready = true;
          dummyCollection.data = {
            ['3']: dummyItem3,
          };
          dummyAgile.storages.get = jest
            .fn()
            .mockReturnValueOnce(Promise.resolve(true));
          placeholderItem1.persist = jest.fn(function () {
            placeholderItem1.persistent = new StatePersistent(placeholderItem1);
            placeholderItem1.persistent.ready = true;
            placeholderItem1.persistent.loadPersistedValue = jest
              .fn()
              .mockReturnValueOnce(true);
            return null as any;
          });
          dummyCollection.createPlaceholderItem = jest
            .fn()
            .mockReturnValueOnce(placeholderItem1);
          dummyDefaultGroup._value = ['1', '3'];

          const response = await collectionPersistent.loadPersistedValue(
            'dummyKey'
          );

          expect(response).toBeTruthy();
          expect(dummyAgile.storages.get).toHaveBeenCalledWith(
            'dummyKey',
            collectionPersistent.config.defaultStorageKey
          );

          expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
          expect(dummyDefaultGroup.persist).toHaveBeenCalledWith(
            CollectionPersistent.getGroupStorageKey(
              dummyDefaultGroup._key,
              'dummyKey'
            ),
            {
              loadValue: false,
              defaultStorageKey: collectionPersistent.config.defaultStorageKey,
              storageKeys: collectionPersistent.storageKeys,
            }
          );
          expect(
            dummyDefaultGroup.persistent?.initialLoading
          ).toHaveBeenCalled();
          expect(dummyDefaultGroup.isPersisted).toBeTruthy();

          expect(dummyItem3.persist).toHaveBeenCalledWith(
            CollectionPersistent.getItemStorageKey('3', 'dummyKey'),
            {
              defaultStorageKey: collectionPersistent.config.defaultStorageKey,
              storageKeys: collectionPersistent.storageKeys,
            }
          );

          expect(
            dummyCollection.createPlaceholderItem
          ).not.toHaveBeenCalledWith('3'); // Because Item 3 is already present in Collection
          expect(dummyCollection.createPlaceholderItem).toHaveBeenCalledWith(
            '1'
          );
          expect(placeholderItem1.persist).toHaveBeenCalledWith(
            CollectionPersistent.getItemStorageKey('1', 'dummyKey'),
            {
              loadValue: false,
              defaultStorageKey: collectionPersistent.config.defaultStorageKey,
              storageKeys: collectionPersistent.storageKeys,
            }
          );
          expect(dummyCollection.collectItem).toHaveBeenCalledWith(
            placeholderItem1
          );
          expect(dummyCollection.collectItem).not.toHaveBeenCalledWith(
            placeholderItem3
          ); // Because Item 3 is already present in Collection

          expect(collectionPersistent.setupSideEffects).toHaveBeenCalledWith(
            'dummyKey'
          );
        }
      );

      it("shouldn't load default Group and its Items if Collection flag isn't persisted", async () => {
        collectionPersistent.ready = true;
        dummyAgile.storages.get = jest
          .fn()
          .mockReturnValueOnce(Promise.resolve(undefined));

        const response = await collectionPersistent.loadPersistedValue();

        expect(response).toBeFalsy();
        expect(dummyAgile.storages.get).toHaveBeenCalledWith(
          collectionPersistent._key,
          collectionPersistent.config.defaultStorageKey
        );

        expect(dummyCollection.getDefaultGroup).not.toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).not.toHaveBeenCalled();

        expect(placeholderItem1.persist).not.toHaveBeenCalled();
        expect(placeholderItem2.persist).not.toHaveBeenCalled();
        expect(placeholderItem3.persist).not.toHaveBeenCalled();
        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem2.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();

        expect(collectionPersistent.setupSideEffects).not.toHaveBeenCalled();
      });

      it("shouldn't load default Group and its Items if Persistent isn't ready", async () => {
        collectionPersistent.ready = false;

        const response = await collectionPersistent.loadPersistedValue();

        expect(response).toBeFalsy();
        expect(dummyAgile.storages.get).not.toHaveBeenCalled();

        expect(dummyCollection.getDefaultGroup).not.toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).not.toHaveBeenCalled();

        expect(placeholderItem1.persist).not.toHaveBeenCalled();
        expect(placeholderItem2.persist).not.toHaveBeenCalled();
        expect(placeholderItem3.persist).not.toHaveBeenCalled();
        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem2.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();

        expect(collectionPersistent.setupSideEffects).not.toHaveBeenCalled();
      });

      it("shouldn't load default Group and its Items if Collection has no defaultGroup", async () => {
        collectionPersistent.ready = true;
        dummyAgile.storages.get = jest
          .fn()
          .mockReturnValueOnce(Promise.resolve(true));
        dummyCollection.getDefaultGroup = jest.fn(() => undefined);

        const response = await collectionPersistent.loadPersistedValue();

        expect(response).toBeFalsy();
        expect(dummyAgile.storages.get).toHaveBeenCalledWith(
          collectionPersistent._key,
          collectionPersistent.config.defaultStorageKey
        );

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).not.toHaveBeenCalled();

        expect(placeholderItem1.persist).not.toHaveBeenCalled();
        expect(placeholderItem2.persist).not.toHaveBeenCalled();
        expect(placeholderItem3.persist).not.toHaveBeenCalled();
        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem2.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();

        expect(collectionPersistent.setupSideEffects).not.toHaveBeenCalled();
      });
    });

    describe('persistValue function tests', () => {
      let dummyDefaultGroup: Group<ItemInterface>;

      beforeEach(() => {
        collectionPersistent.storageKeys = ['test1', 'test2'];
        collectionPersistent.isPersisted = undefined as any;

        dummyCollection.data = {
          ['1']: dummyItem1,
          ['3']: dummyItem3,
        };

        dummyDefaultGroup = new Group(dummyCollection, ['1', '2', '3'], {
          key: 'default',
        });
        dummyDefaultGroup.persist = jest.fn();

        dummyItem1.persist = jest.fn();
        dummyItem3.persist = jest.fn();

        collectionPersistent.setupSideEffects = jest.fn();

        dummyCollection.getDefaultGroup = jest.fn(
          () => dummyDefaultGroup as any
        );

        dummyAgile.storages.set = jest.fn();
      });

      it('should persist default Group and its Items (persistentKey)', async () => {
        collectionPersistent.ready = true;

        const response = await collectionPersistent.persistValue();

        expect(response).toBeTruthy();
        expect(dummyAgile.storages.set).toHaveBeenCalledWith(
          collectionPersistent._key,
          true,
          collectionPersistent.storageKeys
        );

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).toHaveBeenCalledWith(
          CollectionPersistent.getGroupStorageKey(
            dummyDefaultGroup._key,
            collectionPersistent._key
          ),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );

        expect(dummyItem1.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            dummyItem1._key,
            collectionPersistent._key
          ),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );
        expect(dummyItem3.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            dummyItem3._key,
            collectionPersistent._key
          ),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );

        expect(collectionPersistent.setupSideEffects).toHaveBeenCalled();
        expect(collectionPersistent.isPersisted).toBeTruthy();
      });

      it('should persist default Group and its Items (specific key)', async () => {
        collectionPersistent.ready = true;

        const response = await collectionPersistent.persistValue('dummyKey');

        expect(response).toBeTruthy();
        expect(dummyAgile.storages.set).toHaveBeenCalledWith(
          'dummyKey',
          true,
          collectionPersistent.storageKeys
        );

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).toHaveBeenCalledWith(
          CollectionPersistent.getGroupStorageKey(
            dummyDefaultGroup._key,
            'dummyKey'
          ),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );

        expect(dummyItem1.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(dummyItem1._key, 'dummyKey'),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );
        expect(dummyItem3.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(dummyItem3._key, 'dummyKey'),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );

        expect(collectionPersistent.setupSideEffects).toHaveBeenCalled();
        expect(collectionPersistent.isPersisted).toBeTruthy();
      });

      it("shouldn't persist default Group and its Items if Persistent isn't ready", async () => {
        collectionPersistent.ready = false;

        const response = await collectionPersistent.persistValue('dummyKey');

        expect(response).toBeFalsy();
        expect(dummyAgile.storages.set).not.toHaveBeenCalled();

        expect(dummyCollection.getDefaultGroup).not.toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).not.toHaveBeenCalled();

        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();

        expect(collectionPersistent.setupSideEffects).not.toHaveBeenCalled();
        expect(collectionPersistent.isPersisted).toBeUndefined();
      });

      it("shouldn't persist default Group and its Items if Collection has no default Group", async () => {
        collectionPersistent.ready = true;
        dummyCollection.getDefaultGroup = jest.fn(() => undefined as any);

        const response = await collectionPersistent.persistValue();

        expect(response).toBeFalsy();
        expect(dummyAgile.storages.set).not.toHaveBeenCalled();

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(dummyDefaultGroup.persist).not.toHaveBeenCalled();

        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();

        expect(collectionPersistent.setupSideEffects).not.toHaveBeenCalled();
        expect(collectionPersistent.isPersisted).toBeUndefined();
      });
    });

    describe('setupSideEffect function tests', () => {
      let dummyDefaultGroup: Group<ItemInterface>;

      beforeEach(() => {
        dummyDefaultGroup = new Group(dummyCollection, ['1', '2', '3'], {
          key: 'default',
        });
        jest.spyOn(dummyDefaultGroup, 'addSideEffect');

        collectionPersistent.rebuildStorageSideEffect = jest.fn();

        dummyCollection.getDefaultGroup = jest.fn(
          () => dummyDefaultGroup as any
        );
      });

      it("shouldn't add rebuild Storage side effect to default Group", () => {
        collectionPersistent.setupSideEffects();

        expect(
          dummyDefaultGroup.addSideEffect
        ).toHaveBeenCalledWith(
          CollectionPersistent.defaultGroupSideEffectKey,
          expect.any(Function),
          { weight: 0 }
        );
      });

      it("shouldn't add rebuild Storage side effect to default Group if Collection has no default Group", () => {
        dummyCollection.getDefaultGroup = jest.fn(() => undefined as any);

        collectionPersistent.setupSideEffects();

        expect(dummyDefaultGroup.addSideEffect).not.toHaveBeenCalled();
      });

      describe('test added sideEffect called CollectionPersistent.defaultGroupSideEffectKey', () => {
        beforeEach(() => {
          collectionPersistent.ready = true;

          collectionPersistent.rebuildStorageSideEffect = jest.fn();
          dummyCollection.getDefaultGroup = jest.fn(
            () => dummyDefaultGroup as any
          );
        });

        it('should call rebuildStorageSideEffect (persistentKey)', async () => {
          await collectionPersistent.persistValue();

          dummyDefaultGroup.sideEffects[
            CollectionPersistent.defaultGroupSideEffectKey
          ].callback(dummyDefaultGroup);

          expect(
            collectionPersistent.rebuildStorageSideEffect
          ).toHaveBeenCalledWith(dummyDefaultGroup, collectionPersistent._key);
        });

        it('should call rebuildStorageSideEffect (specific key)', async () => {
          await collectionPersistent.persistValue('dummyKey');

          dummyDefaultGroup.sideEffects[
            CollectionPersistent.defaultGroupSideEffectKey
          ].callback(dummyDefaultGroup);

          expect(
            collectionPersistent.rebuildStorageSideEffect
          ).toHaveBeenCalledWith(dummyDefaultGroup, 'dummyKey');
        });
      });
    });

    describe('removePersistedValue function tests', () => {
      let dummyDefaultGroup: Group<ItemInterface>;

      beforeEach(() => {
        collectionPersistent.storageKeys = ['test1', 'test2'];
        collectionPersistent.isPersisted = undefined as any;

        dummyCollection.data = {
          ['1']: dummyItem1,
          ['3']: dummyItem3,
        };

        dummyDefaultGroup = new Group(dummyCollection, ['1', '2', '3']);
        dummyDefaultGroup.persistent = new StatePersistent(dummyDefaultGroup);
        dummyDefaultGroup.removeSideEffect = jest.fn();

        if (dummyDefaultGroup.persistent)
          dummyDefaultGroup.persistent.removePersistedValue = jest.fn();

        dummyCollection.getDefaultGroup = jest.fn(
          () => dummyDefaultGroup as any
        );

        if (dummyItem1.persistent)
          dummyItem1.persistent.removePersistedValue = jest.fn();
        if (dummyItem3.persistent)
          dummyItem3.persistent.removePersistedValue = jest.fn();

        dummyAgile.storages.remove = jest.fn();
      });

      it('should remove persisted default Group and its Items from Storage (persistentKey)', async () => {
        collectionPersistent.ready = true;

        const response = await collectionPersistent.removePersistedValue();

        expect(response).toBeTruthy();
        expect(dummyAgile.storages.remove).toHaveBeenCalledWith(
          collectionPersistent._key,
          collectionPersistent.storageKeys
        );

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(
          dummyDefaultGroup.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getGroupStorageKey(
            dummyDefaultGroup._key,
            collectionPersistent._key
          )
        );
        expect(dummyDefaultGroup.removeSideEffect).toHaveBeenCalledWith(
          CollectionPersistent.defaultGroupSideEffectKey
        );

        expect(
          dummyItem1.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            dummyItem1._key,
            collectionPersistent._key
          )
        );
        expect(
          dummyItem3.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            dummyItem3._key,
            collectionPersistent._key
          )
        );

        expect(collectionPersistent.isPersisted).toBeFalsy();
      });

      it('should remove persisted default Group and its Items from Storage (specific key)', async () => {
        collectionPersistent.ready = true;

        const response = await collectionPersistent.removePersistedValue(
          'dummyKey'
        );

        expect(response).toBeTruthy();
        expect(dummyAgile.storages.remove).toHaveBeenCalledWith(
          'dummyKey',
          collectionPersistent.storageKeys
        );

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(
          dummyDefaultGroup.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getGroupStorageKey(
            dummyDefaultGroup._key,
            'dummyKey'
          )
        );
        expect(dummyDefaultGroup.removeSideEffect).toHaveBeenCalledWith(
          CollectionPersistent.defaultGroupSideEffectKey
        );

        expect(
          dummyItem1.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(dummyItem1._key, 'dummyKey')
        );
        expect(
          dummyItem3.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(dummyItem3._key, 'dummyKey')
        );

        expect(collectionPersistent.isPersisted).toBeFalsy();
      });

      it("shouldn't remove persisted default Group and its Items from Storage if Persistent isn't ready", async () => {
        collectionPersistent.ready = false;

        const response = await collectionPersistent.removePersistedValue();

        expect(response).toBeFalsy();
        expect(dummyAgile.storages.remove).not.toHaveBeenCalled();

        expect(dummyCollection.getDefaultGroup).not.toHaveBeenCalled();
        expect(
          dummyDefaultGroup.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(dummyDefaultGroup.removeSideEffect).not.toHaveBeenCalled();

        expect(
          dummyItem1.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(
          dummyItem3.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();

        expect(collectionPersistent.isPersisted).toBeUndefined();
      });

      it("shouldn't remove persisted default Group and its Items from Storage if Collection has no default Group", async () => {
        collectionPersistent.ready = true;
        dummyCollection.getDefaultGroup = jest.fn(() => undefined as any);

        const response = await collectionPersistent.removePersistedValue();

        expect(response).toBeFalsy();
        expect(dummyAgile.storages.remove).not.toHaveBeenCalled();

        expect(dummyCollection.getDefaultGroup).toHaveBeenCalled();
        expect(
          dummyDefaultGroup.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(dummyDefaultGroup.removeSideEffect).not.toHaveBeenCalled();

        expect(
          dummyItem1.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(
          dummyItem3.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();

        expect(collectionPersistent.isPersisted).toBeUndefined();
      });
    });

    describe('formatKey function tests', () => {
      it('should return key of Collection if no valid key got provided', () => {
        dummyCollection._key = 'coolKey';

        const response = collectionPersistent.formatKey(null);

        expect(response).toBe('coolKey');
      });

      it('should return provided key if key is valid', () => {
        dummyCollection._key = 'coolKey';

        const response = collectionPersistent.formatKey('awesomeKey');

        expect(response).toBe('awesomeKey');
      });

      it('should return and apply valid provided key to Collection if Collection has no own key', () => {
        dummyCollection._key = undefined;

        const response = collectionPersistent.formatKey('awesomeKey');

        expect(response).toBe('awesomeKey');
        expect(dummyCollection._key).toBe('awesomeKey');
      });

      it('should return undefined if no valid key got provided and Collection has no key', () => {
        dummyCollection._key = undefined;

        const response = collectionPersistent.formatKey(null);

        expect(response).toBeUndefined();
      });
    });

    describe('rebuildStorageSideEffects function tests', () => {
      let dummyGroup: Group<ItemInterface>;

      beforeEach(() => {
        dummyGroup = new Group(dummyCollection);
        dummyCollection.data = {
          ['1']: dummyItem1,
          ['2']: dummyItem2,
          ['3']: dummyItem3,
          ['4']: dummyItem4WithoutPersistent,
        };
        dummyCollection.persistent = collectionPersistent;

        dummyItem1.persist = jest.fn();
        dummyItem2.persist = jest.fn();
        dummyItem3.persist = jest.fn();
        dummyItem4WithoutPersistent.persist = jest.fn();

        if (dummyItem1.persistent)
          dummyItem1.persistent.removePersistedValue = jest.fn();
        if (dummyItem2.persistent)
          dummyItem2.persistent.removePersistedValue = jest.fn();
        if (dummyItem3.persistent)
          dummyItem3.persistent.removePersistedValue = jest.fn();
      });

      it('should return if no Item got added or removed', () => {
        dummyGroup.previousStateValue = ['1', '2', '3'];
        dummyGroup._value = ['1', '2', '3'];

        collectionPersistent.rebuildStorageSideEffect(dummyGroup);

        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem2.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();
        expect(dummyItem4WithoutPersistent.persist).not.toHaveBeenCalled();

        expect(
          dummyItem1.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(
          dummyItem2.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(
          dummyItem3.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
      });

      it('should call removePersistedValue() on Items that got removed from Group', () => {
        dummyGroup.previousStateValue = ['1', '2', '3'];
        dummyGroup._value = ['2'];

        collectionPersistent.rebuildStorageSideEffect(dummyGroup);

        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem2.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();
        expect(dummyItem4WithoutPersistent.persist).not.toHaveBeenCalled();

        expect(
          dummyItem1.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey('1', collectionPersistent._key)
        );
        expect(
          dummyItem2.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(
          dummyItem3.persistent?.removePersistedValue
        ).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey('3', collectionPersistent._key)
        );
      });

      it("should call persist on Items that got added to Group and hasn't been persisted yet", () => {
        dummyGroup.previousStateValue = ['1'];
        dummyGroup._value = ['1', '4', '3'];

        collectionPersistent.rebuildStorageSideEffect(dummyGroup);

        expect(dummyItem1.persist).not.toHaveBeenCalled();
        expect(dummyItem2.persist).not.toHaveBeenCalled();
        expect(dummyItem3.persist).not.toHaveBeenCalled();
        expect(dummyItem4WithoutPersistent.persist).toHaveBeenCalledWith(
          CollectionPersistent.getItemStorageKey(
            '4',
            collectionPersistent._key
          ),
          {
            defaultStorageKey: collectionPersistent.config.defaultStorageKey,
            storageKeys: collectionPersistent.storageKeys,
          }
        );

        expect(
          dummyItem1.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(
          dummyItem2.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
        expect(
          dummyItem3.persistent?.removePersistedValue
        ).not.toHaveBeenCalled();
      });
    });

    describe('getItemStorageKey function tests', () => {
      it('should build ItemStorageKey based on itemKey and collectionKey', () => {
        const response = CollectionPersistent.getItemStorageKey(
          'itemKey',
          'collectionKey'
        );

        expect(response).toBe('_collectionKey_item_itemKey');
        LogMock.hasNotLogged('warn');
      });

      it('should build ItemStorageKey based on only collectionKey with warning', () => {
        const response = CollectionPersistent.getItemStorageKey(
          undefined,
          'collectionKey'
        );

        expect(response).toBe('_collectionKey_item_unknown');
        LogMock.hasLoggedCode('1A:02:00');
      });

      it('should build ItemStorageKey based on only itemKey with warning', () => {
        const response = CollectionPersistent.getItemStorageKey(
          'itemKey',
          undefined
        );

        expect(response).toBe('_unknown_item_itemKey');
        LogMock.hasLoggedCode('1A:02:00');
      });

      it('should build ItemStorageKey based on nothing with warning', () => {
        const response = CollectionPersistent.getItemStorageKey(
          undefined,
          undefined
        );

        expect(response).toBe('_unknown_item_unknown');
        LogMock.hasLoggedCode('1A:02:00');
      });
    });

    describe('getGroupStorageKey function tests', () => {
      it('should build GroupStorageKey based on groupKey and collectionKey', () => {
        const response = CollectionPersistent.getGroupStorageKey(
          'groupKey',
          'collectionKey'
        );

        expect(response).toBe('_collectionKey_group_groupKey');
        LogMock.hasNotLogged('warn');
      });

      it('should build GroupStorageKey based on only collectionKey with warning', () => {
        const response = CollectionPersistent.getGroupStorageKey(
          undefined,
          'collectionKey'
        );

        expect(response).toBe('_collectionKey_group_unknown');
        LogMock.hasLoggedCode('1A:02:01');
      });

      it('should build GroupStorageKey based on only groupKey with warning', () => {
        const response = CollectionPersistent.getGroupStorageKey(
          'groupKey',
          undefined
        );

        expect(response).toBe('_unknown_group_groupKey');
        LogMock.hasLoggedCode('1A:02:01');
      });

      it('should build GroupStorageKey based on nothing with warning', () => {
        const response = CollectionPersistent.getGroupStorageKey(
          undefined,
          undefined
        );

        expect(response).toBe('_unknown_group_unknown');
        LogMock.hasLoggedCode('1A:02:01');
      });
    });
  });
});
