import { UserConfig } from "next-i18next";
export type { default as BaseRequest } from "./baseRequest";
export type { default as Driver } from "./driver";
export type { default as DriversRequest } from "./driversRequest";
export type { default as Race } from "./race";
export type { default as SeasonsRequest } from "./seasonsRequest";
export type { default as RacesRequest } from "./racesRequest";
export type { default as LapsRequest } from "./lapsRequest";
export type { default as Season } from "./season";
export interface I18nConfig extends UserConfig {}
export * from "./lapsRequest";
