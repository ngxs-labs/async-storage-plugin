import {
  NgModule,
  ModuleWithProviders,
  InjectionToken,
  TypeProvider
} from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import { NgxsAsyncStoragePlugin } from './async-storage.plugin';
import {
  NgxsStoragePluginOptions,
  NGXS_STORAGE_PLUGIN_OPTIONS,
  STORAGE_ENGINE
} from './symbols';
import { storageOptionsFactory } from './internals';

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');

@NgModule()
export class NgxsAsyncStoragePluginModule {
  static forRoot(
    engine: TypeProvider,
    options?: NgxsStoragePluginOptions
  ): ModuleWithProviders<NgxsAsyncStoragePluginModule> {
    return {
      ngModule: NgxsAsyncStoragePluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsAsyncStoragePlugin,
          multi: true
        },
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_STORAGE_PLUGIN_OPTIONS,
          useFactory: storageOptionsFactory,
          deps: [USER_OPTIONS]
        },
        {
          provide: STORAGE_ENGINE,
          useClass: engine
        }
      ]
    };
  }
}
