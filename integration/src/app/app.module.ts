import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxsAsyncStoragePluginModule } from 'dist/async-storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { CounterState } from './store/counter.state';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxsModule.forRoot([CounterState]),
    NgxsAsyncStoragePluginModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
