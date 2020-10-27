// TODO OLD SELECTOR
// Will be removed if 'selector.new' got finished

import {
  Collection,
  DefaultItem,
  ItemKey,
  Computed,
  Item,
  StorageKey,
  copy,
  defineConfig,
  StatePersistent,
} from "../internal";

export class SelectorOLD<DataType = DefaultItem> extends Computed<
  DataType | undefined
> {
  public collection: () => Collection<DataType>;
  public _id: ItemKey;

  constructor(
    collection: Collection<DataType>,
    id: ItemKey,
    config?: SelectorConfigInterface
  ) {
    // If no key provided set it to dummy (dummyKey)
    if (!id) id = "dummy";

    // Instantiate Computed with 'computed' function
    super(collection.agileInstance(), () => findData<DataType>(collection, id));

    if (config?.key) this._key = config?.key;

    this.collection = () => collection;
    this._id = id;

    // Set type of State to object because a collection item is always an object
    this.type(Object);
  }

  public set id(val: ItemKey) {
    this.select(val);
  }

  public get id() {
    return this._id;
  }

  //=========================================================================================================
  // Select
  //=========================================================================================================
  /**
   * Changes the id on which the selector is watching
   */
  public select(
    id: ItemKey,
    options?: { background?: boolean; sideEffects?: boolean }
  ) {
    // Assign defaults to config
    options = defineConfig(options, {
      background: false,
      sideEffects: true,
    });

    // Remove item if its a placeholder because if so it won't be needed without being selected by this selector
    if (this.collection().data[this.id]?.isPlaceholder)
      delete this.collection().data[this.id];

    // Set _id to new id
    this._id = id;

    // Update Computed Function with new key(id)
    this.updateComputeFunction(
      () => findData<DataType>(this.collection(), id),
      [],
      options
    );

    return this;
  }

  //=========================================================================================================
  // Overwrite Persist (because in computed we overwrite it)
  //=========================================================================================================
  /**
   * @public
   * Saves Selector Value into Agile Storage permanently
   * @param key - Storage Key (Note: not needed if Selector has key/name)
   */
  public persist(key?: StorageKey): this {
    if (this.isPersisted && this.persistent) {
      console.warn(`Agile: The State ${this.key} is already persisted!`);

      // Update Key in Persistent
      if (key) this.persistent.key = key;
      return this;
    }

    // Create new StatePersistent instance
    this.persistent = new StatePersistent(this.agileInstance(), this, key);
    return this;
  }

  //=========================================================================================================
  // Overwrite getPerstiableValue
  //=========================================================================================================
  /**
   * @internal
   * Returns persistable Value of State
   */
  public getPersistableValue() {
    return this.id;
  }
}

//=========================================================================================================
// Find Data
//=========================================================================================================
/**
 * Computed function for the Selector
 */
function findData<DataType>(collection: Collection<DataType>, id: ItemKey) {
  // Find data by id in collection
  let item = collection.getItemById(id);

  // If data is not found, create placeholder item, so that when real data is collected it maintains connection and causes a rerender
  if (!item) {
    const newItem = new Item<DataType>(collection, { id: id } as any);
    newItem.isPlaceholder = true;
    collection.data[id] = newItem;
    item = newItem;
  }

  // If initial State is still {id: id}.. because of placeholder item and the value isn't {id: id} -> had got real value.. set the initial State to this first real value
  if (
    JSON.stringify(item.initialStateValue) === JSON.stringify({ id: id }) &&
    JSON.stringify(item.nextStateValue) !== JSON.stringify({ id: id })
  ) {
    item.initialStateValue = copy(item.nextStateValue);
    item.previousStateValue = copy(item.nextStateValue);
  }

  // Have to create the final Value here, to get added to the track states also if the item doesn't exist yet.. (otherwise auto tracking state wouldn't work -> this won't get called if the item changes )
  const finalValue = item.value;

  // If item doesn't exist return undefined.. otherwise it would return {id: id}
  if (!item.exists) return undefined;

  return finalValue;
}

export type SelectorKey = string | number;

/**
 * @param key - Key/Name of Selector
 */
export interface SelectorConfigInterface {
  key?: SelectorKey;
}