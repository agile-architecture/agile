import { State, Collection, DefaultItem, StateKey } from "../internal";

export class Item<DataType = DefaultItem> extends State<DataType> {
  private collection: () => Collection;

  /**
   * @public
   * Item of Collection
   * @param collection - Collection to which the Item belongs
   * @param data - Data that the Item holds
   */
  constructor(collection: Collection, data: DataType) {
    super(collection.agileInstance(), data);
    this.collection = () => collection;

    // Setting primaryKey of Data to Key/Name of Item
    this.key = data[collection.config?.primaryKey || "id"];
  }

  /**
   * @public
   * Set Key/Name of Item
   */
  public set key(value: StateKey | undefined) {
    // Note can't use 'super.key' because of 'https://github.com/Microsoft/TypeScript/issues/338'
    this.setKey(value);
    if (!value) return;

    // Update rebuildGroupThatIncludePrimaryKey SideEffect
    this.removeSideEffect("rebuildGroup");
    this.addSideEffect("rebuildGroup", (properties: any) =>
      this.collection().rebuildGroupsThatIncludePrimaryKey(value, properties)
    );
  }

  /**
   * @public
   * Get Key/Name of Item
   */
  public get key(): StateKey | undefined {
    // Note can't use 'super.key' because of 'https://github.com/Microsoft/TypeScript/issues/338'
    // Can't remove this getter function.. since the setter function is set in this class -> Error if not setter and getter function set

    return this._key;
  }
}
