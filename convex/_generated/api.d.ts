/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as availability from "../availability.js";
import type * as files from "../files.js";
import type * as migrations_removeOldFields from "../migrations/removeOldFields.js";
import type * as migrations_updateDiscountFields from "../migrations/updateDiscountFields.js";
import type * as seed from "../seed.js";
import type * as seedAltaiTour from "../seedAltaiTour.js";
import type * as seedSpaceTypes from "../seedSpaceTypes.js";
import type * as seedSpaces from "../seedSpaces.js";
import type * as seedTourDaysAndActivities from "../seedTourDaysAndActivities.js";
import type * as seedUpdateTourPrice from "../seedUpdateTourPrice.js";
import type * as spaceTypes from "../spaceTypes.js";
import type * as spaces from "../spaces.js";
import type * as tourDays from "../tourDays.js";
import type * as tours from "../tours.js";
import type * as updateSpaceImages from "../updateSpaceImages.js";
import type * as uploadAction from "../uploadAction.js";
import type * as uploadImages from "../uploadImages.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  availability: typeof availability;
  files: typeof files;
  "migrations/removeOldFields": typeof migrations_removeOldFields;
  "migrations/updateDiscountFields": typeof migrations_updateDiscountFields;
  seed: typeof seed;
  seedAltaiTour: typeof seedAltaiTour;
  seedSpaceTypes: typeof seedSpaceTypes;
  seedSpaces: typeof seedSpaces;
  seedTourDaysAndActivities: typeof seedTourDaysAndActivities;
  seedUpdateTourPrice: typeof seedUpdateTourPrice;
  spaceTypes: typeof spaceTypes;
  spaces: typeof spaces;
  tourDays: typeof tourDays;
  tours: typeof tours;
  updateSpaceImages: typeof updateSpaceImages;
  uploadAction: typeof uploadAction;
  uploadImages: typeof uploadImages;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
