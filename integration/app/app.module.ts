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
import {
  NgxsAsyncStoragePluginModule
} from '@ngxs-labs/async-storage-plugin';
import { StorageService } from './services/storage.service';
import { IonicStorageModule } from '@ionic/storage';

import { NgxsResetPluginModule } from 'ngxs-reset-plugin';

import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    NgxsModule.forRoot([CounterState]),
    NgxsResetPluginModule.forRoot(),
    NgxsAsyncStoragePluginModule.forRoot(StorageService),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
