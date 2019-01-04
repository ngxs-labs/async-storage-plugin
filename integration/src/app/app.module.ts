import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AsyncStoragePluginModule } from 'dist/async-storage-plugin';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AsyncStoragePluginModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
