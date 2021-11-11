import { environment } from './../environments/environment';
import { CounterState } from './store/counter.state';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NgxsModule } from '@ngxs/store';
import { NgxsAsyncStoragePluginModule } from '../../src/lib/async-storage.module';
import { StorageService } from './services/storage.service';
import { IonicStorageModule } from '@ionic/storage-angular';

import { NgxsResetPluginModule } from 'ngxs-reset-plugin';

import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

export function migration(state) {
  state = {
    count: 5,
    version: 1
  };
  return state;
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    NgxsModule.forRoot([CounterState], {
      developmentMode: !environment.production
    }),
    NgxsResetPluginModule.forRoot(),
    NgxsAsyncStoragePluginModule.forRoot(StorageService, {
      key: ['counter'],
      migrations: [
        {
          version: 0,
          key: 'counter',
          migrate: migration
        }
      ]
    }),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
