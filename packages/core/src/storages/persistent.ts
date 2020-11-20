import { Agile, StorageKey } from "../internal";

export class Persistent<ValueType = any> {
  public agileInstance: () => Agile;

  public _key: StorageKey = "unknown";
  public ready: boolean = false;
  public isPersisted: boolean = false; // If Value is stored in Agile Storage
  public onLoad: ((success: boolean) => void) | undefined; // Gets called if PersistValue got loaded for the first Time
  public storageKeys?: StorageKey[]; // StorageKeys in which the Persist Value gets saved

  /**
   * @internal
   * Persistent - Handles storing of Agile Instances
   * @param agileInstance - An instance of Agile
   * @param storageKeys - Key/Name of Storages in which the Persist Value gets saved
   */
  constructor(agileInstance: Agile, storageKeys?: StorageKey[]) {
    this.agileInstance = () => agileInstance;
    this.storageKeys = storageKeys;
  }

  /**
   * @internal
   * Set Key/Name of Persistent
   */
  public set key(value: StorageKey) {
    this.setKey(value);
  }

  /**
   * @internal
   * Get Key/Name of Persistent
   */
  public get key(): StorageKey {
    return this._key;
  }

  //=========================================================================================================
  // Set Key
  //=========================================================================================================
  /**
   * @public
   * Sets Key/Name of Persistent
   * @param value - New Key/Name of Persistent
   */
  public setKey(value: StorageKey): void {
    this._key = value;
  }

  //=========================================================================================================
  // Init Persistent
  //=========================================================================================================
  /**
   * @internal
   * Inits Persistent (this class)
   * -> Sometimes this class needs to be instantiated after some properties have been set in extended class
   * @param key - Key of Storage property
   */
  public async instantiatePersistent(key?: StorageKey): Promise<boolean> {
    // Validate Key
    const finalKey = this.validateKey(key);
    if (!finalKey) {
      Agile.logger.error("No persist Key found!");
      return false;
    }
    this._key = finalKey;

    this.agileInstance().storages.persistentInstances.add(this);
    this.ready = true;

    // Load/Store persisted Value/s for the first Time
    await this.initialLoading(finalKey);

    return true;
  }

  //=========================================================================================================
  // Initial Loading
  //=========================================================================================================
  /**
   * @internal
   * Loads/Saves Storage Value for the first Time
   * @param key -  Key of Storage property
   */
  public async initialLoading(key: StorageKey) {
    const success = await this.loadValue();
    if (this.onLoad) this.onLoad(success);
    if (!success) await this.updateValue();
  }

  //=========================================================================================================
  // Load Value
  //=========================================================================================================
  /**
   * @internal
   * Loads Value from Storage
   * @return Success?
   */
  public async loadValue(): Promise<boolean> {
    Agile.logger.error(
      `Didn't set loadValue function in Persistent '${this.key}'`
    );
    return false;
  }

  //=========================================================================================================
  // Update Value
  //=========================================================================================================
  /**
   * @internal
   * Saves/Updates Value in Storage
   * @return Success?
   */
  public async updateValue(): Promise<boolean> {
    Agile.logger.error(
      `Didn't set setValue function in Persistent '${this.key}'`
    );
    return false;
  }

  //=========================================================================================================
  // Remove Value
  //=========================================================================================================
  /**
   * @internal
   * Removes Value form Storage
   * @return Success?
   */
  public async removeValue(): Promise<boolean> {
    Agile.logger.error(
      `Didn't set removeValue function in Persistent '${this.key}'`
    );
    return false;
  }

  //=========================================================================================================
  // Validate Key
  //=========================================================================================================
  /**
   * @internal
   * Validates Storage Key
   * @param key - Key that gets validated
   */
  public validateKey(key?: StorageKey): StorageKey | null {
    Agile.logger.error(
      `Didn't set validateKey function in Persistent '${this.key}'`
    );
    return null;
  }
}