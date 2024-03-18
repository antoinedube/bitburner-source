export const HacknetNodeConstants = {
  MoneyGainPerLevel: 1.5,

  BaseCost: 1000,
  LevelBaseCost: 500,
  RamBaseCost: 30e3,
  CoreBaseCost: 500e3,

  PurchaseNextMult: 1.42,
  UpgradeLevelMult: 1.02,
  UpgradeRamMult: 1.14,
  UpgradeCoreMult: 1.24,

  MaxLevel: 200,
  MaxRam: 64,
  MaxCores: 16,
};

export const PurchaseMultipliers: {
  [key: string]: number | "MAX" | undefined;
  x1: number;
  x5: number;
  x10: number;
  MAX: "MAX";
} = {
  x1: 1,
  x5: 5,
  x10: 10,
  MAX: "MAX",
};

export const HacknetServerConstants = {
  HashesPerLevel: 0.001,

  BaseCost: 50e3,
  RamBaseCost: 200e3,
  CoreBaseCost: 1e6,
  CacheBaseCost: 10e6,

  PurchaseMult: 2.1,
  UpgradeLevelMult: 1.05,
  UpgradeRamMult: 1.2,
  UpgradeCoreMult: 1.13,
  UpgradeCacheMult: 1.43,

  MaxServers: 30,

  MaxLevel: 300,
  MaxRam: 8192,
  MaxCores: 128,
  MaxCache: 15,
};
