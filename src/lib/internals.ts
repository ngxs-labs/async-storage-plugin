import { StateClass } from '@ngxs/store/internals';
import { NgxsStoragePluginOptions } from './symbols';
/**
 * If the `key` option is not provided then the below constant
 * will be used as a default key
 */
export const DEFAULT_STATE_KEY = '@@STATE';

/**
 * Internal type definition for the `key` option provided
 * in the `forRoot` method when importing module
 */
export type StorageKey = string | StateClass | (string | StateClass)[];

/**
 * This key is used to retrieve static metadatas on state classes.
 * This constant is taken from the core codebase
 */
const META_OPTIONS_KEY = 'NGXS_OPTIONS_META';

function transformKeyOption(key: StorageKey): string[] {
  if (!Array.isArray(key)) {
    key = [key];
  }

  return key.map((token: string | StateClass) => {
    if (typeof token === 'string') {
      return token;
    }

    const options = (token as any)[META_OPTIONS_KEY];
    return options.name;
  });
}

export function storageOptionsFactory(
  options: NgxsStoragePluginOptions | undefined
): NgxsStoragePluginOptions {
  if (options !== undefined && options.key) {
    options.key = transformKeyOption(options.key);
  }
  return {
    key: [DEFAULT_STATE_KEY],
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    ...options
  };
}
