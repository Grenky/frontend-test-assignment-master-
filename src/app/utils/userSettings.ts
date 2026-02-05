import { storage } from "../../engine/utils/storage";
import { engine } from "../getEngine";

// Keys for saved items in storage
const KEY_VOLUME_MASTER = "volume-master";
const KEY_VOLUME_BGM = "volume-bgm";
const KEY_VOLUME_SFX = "volume-sfx";
const KEY_BALANCE = "user-balance";
const KEY_LAST_WIN = "last-win";

/**
 * Persistent user settings of volumes.
 */
class UserSettings {
  public init() {
    engine().audio.setMasterVolume(this.getMasterVolume());
    engine().audio.bgm.setVolume(this.getBgmVolume());
    engine().audio.sfx.setVolume(this.getSfxVolume());
  }

  public getBalance(): number {
    return storage.getNumber(KEY_BALANCE) ?? 1000.00
  }

  public setBalance(value: number) {
    storage.setNumber(KEY_BALANCE, value);
    console.log(`[Storage] Balance saved: ${value}`);
  }
  
  public addBalance(amount: number) {
    const oldBalance = this.getBalance();
    const newBalance = oldBalance + amount;
    this.setBalance(newBalance);
    console.log(`[Balance Updated] ${oldBalance} + ${amount} = ${newBalance}`)
  }

  public getLastWin(): number {
    return storage.getNumber(KEY_LAST_WIN) ?? 0;
  }

  public setLastWin(value: number) {
    storage.setNumber(KEY_LAST_WIN, value);
  }

  /** Get overall sound volume */
  public getMasterVolume() {
    return storage.getNumber(KEY_VOLUME_MASTER) ?? 0.5;
  }

  /** Set overall sound volume */
  public setMasterVolume(value: number) {
    engine().audio.setMasterVolume(value);
    storage.setNumber(KEY_VOLUME_MASTER, value);
  }

  /** Get background music volume */
  public getBgmVolume() {
    return storage.getNumber(KEY_VOLUME_BGM) ?? 1;
  }

  /** Set background music volume */
  public setBgmVolume(value: number) {
    engine().audio.bgm.setVolume(value);
    storage.setNumber(KEY_VOLUME_BGM, value);
  }

  /** Get sound effects volume */
  public getSfxVolume() {
    return storage.getNumber(KEY_VOLUME_SFX) ?? 1;
  }

  /** Set sound effects volume */
  public setSfxVolume(value: number) {
    engine().audio.sfx.setVolume(value);
    storage.setNumber(KEY_VOLUME_SFX, value);
  }
}

/** SHared user settings instance */
export const userSettings = new UserSettings();
