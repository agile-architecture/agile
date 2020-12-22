import {
  Collection,
  Agile,
  Group,
  Selector,
  Item,
  CollectionPersistent,
} from "../../../src";

describe("Collection Tests", () => {
  interface ItemInterface {
    id: string;
    name: string;
  }
  let dummyAgile: Agile;

  beforeEach(() => {
    jest.clearAllMocks();
    dummyAgile = new Agile({ localStorage: false });

    jest.spyOn(Collection.prototype, "initSelectors");
    jest.spyOn(Collection.prototype, "initGroups");
  });

  it("should create Collection (default config)", () => {
    // Overwrite methods once to not call id
    jest
      .spyOn(Collection.prototype, "initSelectors")
      .mockReturnValueOnce(undefined);
    jest
      .spyOn(Collection.prototype, "initGroups")
      .mockReturnValueOnce(undefined);

    const collection = new Collection<ItemInterface>(dummyAgile);

    expect(collection.config).toStrictEqual({
      primaryKey: "id",
      defaultGroupKey: "default",
    });
    expect(collection.size).toBe(0);
    expect(collection.data).toStrictEqual({});
    expect(collection._key).toBeUndefined();
    expect(collection.isPersisted).toBeFalsy();
    expect(collection.persistent).toBeUndefined();
    expect(collection.groups).toStrictEqual({});
    expect(collection.selectors).toStrictEqual({});

    expect(Collection.prototype.initGroups).toHaveBeenCalledWith({});
    expect(Collection.prototype.initSelectors).toHaveBeenCalledWith({});
  });

  it("should create Collection (specific config)", () => {
    // Overwrite methods once to not call id
    jest
      .spyOn(Collection.prototype, "initSelectors")
      .mockReturnValueOnce(undefined);
    jest
      .spyOn(Collection.prototype, "initGroups")
      .mockReturnValueOnce(undefined);

    const collection = new Collection<ItemInterface>(dummyAgile, {
      defaultGroupKey: "general",
      groups: ["group1", "group2"],
      selectors: ["selector1", "selector2"],
      key: "dummyCollectionKey",
      primaryKey: "key",
    });

    expect(collection.config).toStrictEqual({
      primaryKey: "key",
      defaultGroupKey: "general",
    });
    expect(collection.size).toBe(0);
    expect(collection.data).toStrictEqual({});
    expect(collection._key).toBe("dummyCollectionKey");
    expect(collection.isPersisted).toBeFalsy();
    expect(collection.persistent).toBeUndefined();
    expect(collection.groups).toStrictEqual({});
    expect(collection.selectors).toStrictEqual({});

    expect(Collection.prototype.initGroups).toHaveBeenCalledWith([
      "group1",
      "group2",
    ]);
    expect(Collection.prototype.initSelectors).toHaveBeenCalledWith([
      "selector1",
      "selector2",
    ]);
  });

  it("should create Collection (specific config in function form)", () => {
    // Overwrite methods once to not call id
    jest
      .spyOn(Collection.prototype, "initSelectors")
      .mockReturnValueOnce(undefined);
    jest
      .spyOn(Collection.prototype, "initGroups")
      .mockReturnValueOnce(undefined);

    const collection = new Collection<ItemInterface>(
      dummyAgile,
      (collection) => ({
        defaultGroupKey: "general",
        groups: {
          group1: collection.Group(),
        },
        selectors: {
          selector1: collection.Selector("id1"),
        },
        key: "dummyCollectionKey",
        primaryKey: "key",
      })
    );

    expect(collection.config).toStrictEqual({
      primaryKey: "key",
      defaultGroupKey: "general",
    });
    expect(collection.size).toBe(0);
    expect(collection.data).toStrictEqual({
      id1: expect.any(Item), // Placeholder Item created by Selector
    });
    expect(collection._key).toBe("dummyCollectionKey");
    expect(collection.isPersisted).toBeFalsy();
    expect(collection.persistent).toBeUndefined();
    expect(collection.groups).toStrictEqual({});
    expect(collection.selectors).toStrictEqual({});

    expect(Collection.prototype.initGroups).toHaveBeenCalledWith({
      group1: expect.any(Group),
    });
    expect(Collection.prototype.initSelectors).toHaveBeenCalledWith({
      selector1: expect.any(Selector),
    });
  });

  describe("Collection Function Tests", () => {
    let collection: Collection<ItemInterface>;

    beforeEach(() => {
      collection = new Collection(dummyAgile, { key: "collectionKey" });
    });

    it("should call setKey with passed value", () => {
      collection.setKey = jest.fn();

      collection.key = "newKey";

      expect(collection.setKey).toHaveBeenCalledWith("newKey");
    });

    describe("key get function tests", () => {
      it("should return current State Key", () => {
        expect(collection.key).toBe("collectionKey");
      });
    });

    describe("setKey function tests", () => {
      beforeEach(() => {
        collection.persistent = new CollectionPersistent(collection);

        collection.persistent.setKey = jest.fn();
      });

      it("should update existing Key in all instances", () => {
        collection.persistent._key = "collectionKey";

        collection.setKey("newKey");

        expect(collection._key).toBe("newKey");
        expect(collection.persistent.setKey).toHaveBeenCalledWith("newKey");
      });

      it("should update existing Key in all instances except persistent if the CollectionKey and PersistKey aren't equal", () => {
        collection.persistent._key = "randomKey";

        collection.setKey("newKey");

        expect(collection._key).toBe("newKey");
        expect(collection.persistent.setKey).not.toHaveBeenCalled();
      });

      it("should update existing Key in all instances except persistent if new CollectionKey is undefined", () => {
        collection.persistent._key = "collectionKey";

        collection.setKey(undefined);

        expect(collection._key).toBeUndefined();
        expect(collection.persistent.setKey).not.toHaveBeenCalled();
      });
    });

    describe("Group function tests", () => {
      it("should create Group which belongs to Collection", () => {
        const response = collection.Group([1, 2], {
          key: "group1Key",
        });

        expect(response).toBeInstanceOf(Group);
        expect(response._key).toBe("group1Key");
        expect(response._value).toStrictEqual([1, 2]);
        expect(response.collection()).toBe(collection);
      });
    });

    describe("Selector function tests", () => {
      it("should create Selector which belongs to Collection", () => {
        const response = collection.Selector("id1", {
          key: "selector1Key",
        });

        expect(response).toBeInstanceOf(Selector);
        expect(response._key).toBe("selector1Key");
        expect(response._itemKey).toBe("id1");
        expect(response.collection()).toBe(collection);
      });
    });

    describe("initGroups function tests", () => {
      it("should create GroupsObject out of passed GroupKeys Array and add defaultGroup", () => {
        collection.initGroups(["group1", "group2"]);

        expect(collection.groups).toHaveProperty("group1");
        expect(collection.groups["group1"]._key).toBe("group1");
        expect(collection.groups["group1"]._value).toStrictEqual([]);
        expect(collection.groups["group1"].collection()).toBe(collection);

        expect(collection.groups).toHaveProperty("group2");
        expect(collection.groups["group2"]._key).toBe("group2");
        expect(collection.groups["group2"]._value).toStrictEqual([]);
        expect(collection.groups["group2"].collection()).toBe(collection);

        expect(collection.groups).toHaveProperty(
          collection.config.defaultGroupKey as any
        );
        expect(collection.groups[collection.config.defaultGroupKey]._key).toBe(
          "default"
        );
        expect(
          collection.groups[collection.config.defaultGroupKey]._value
        ).toStrictEqual([]);
        expect(
          collection.groups[collection.config.defaultGroupKey].collection()
        ).toBe(collection);
      });

      it("should create GroupsObject out of passed Groups Object and add default Group", () => {
        let dummyGroup1 = new Group(collection);
        let dummyGroup2 = new Group(collection, ["test1", "test2"], {
          key: "overwrittenKey",
        });

        collection.initGroups({
          dummyGroup1: dummyGroup1,
          dummyGroup2: dummyGroup2,
        });

        expect(collection.groups).toHaveProperty("dummyGroup1");
        expect(collection.groups["dummyGroup1"]._key).toBe("dummyGroup1");
        expect(collection.groups["dummyGroup1"]._value).toStrictEqual([]);
        expect(collection.groups["dummyGroup1"].collection()).toBe(collection);

        expect(collection.groups).toHaveProperty("dummyGroup2");
        expect(collection.groups["dummyGroup2"]._key).toBe("overwrittenKey");
        expect(collection.groups["dummyGroup2"]._value).toStrictEqual([
          "test1",
          "test2",
        ]);
        expect(collection.groups["dummyGroup2"].collection()).toBe(collection);

        expect(collection.groups).toHaveProperty(
          collection.config.defaultGroupKey as any
        );
        expect(collection.groups[collection.config.defaultGroupKey]._key).toBe(
          "default"
        );
        expect(
          collection.groups[collection.config.defaultGroupKey]._value
        ).toStrictEqual([]);
        expect(
          collection.groups[collection.config.defaultGroupKey].collection()
        ).toBe(collection);
      });
    });

    describe("initSelectors function tests", () => {
      it("should create SelectorsObject out of passed SelectorKeys Array", () => {
        collection.initSelectors(["selector1", "selector2"]);

        expect(collection.selectors).toHaveProperty("selector1");
        expect(collection.selectors["selector1"]._key).toBe("selector1");
        expect(collection.selectors["selector1"]._itemKey).toBe("selector1");
        expect(collection.selectors["selector1"].collection()).toBe(collection);

        expect(collection.selectors).toHaveProperty("selector2");
        expect(collection.selectors["selector2"]._key).toBe("selector2");
        expect(collection.selectors["selector2"]._itemKey).toBe("selector2");
        expect(collection.selectors["selector2"].collection()).toBe(collection);
      });

      it("should create SelectorsObject out of passed Selector Object", () => {
        let dummySelector1 = new Selector(collection, "1");
        let dummySelector2 = new Selector(collection, "2", {
          key: "overwrittenKey",
        });

        collection.initSelectors({
          dummySelector1: dummySelector1,
          dummySelector2: dummySelector2,
        });

        expect(collection.selectors).toHaveProperty("dummySelector1");
        expect(collection.selectors["dummySelector1"]._key).toBe(
          "dummySelector1"
        );
        expect(collection.selectors["dummySelector1"]._itemKey).toBe("1");
        expect(collection.selectors["dummySelector1"].collection()).toBe(
          collection
        );

        expect(collection.selectors).toHaveProperty("dummySelector2");
        expect(collection.selectors["dummySelector2"]._key).toBe(
          "overwrittenKey"
        );
        expect(collection.selectors["dummySelector2"]._itemKey).toBe("2");
        expect(collection.selectors["dummySelector2"].collection()).toBe(
          collection
        );
      });
    });
  });
});