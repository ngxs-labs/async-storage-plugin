<p align="center">
    <img src="https://raw.githubusercontent.com/ngxs-labs/async-storage-plugin/master/docs/assets/logo.png">
</p>

---

> Supports custom storage engine with async access

## 🔨 Usage
Import the module into your root application module:

```typescript
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsAsyncStoragePluginModule } from '@ngxs-labs/async-storage-plugin';

@NgModule({
    imports: [
        NgxsModule.forRoot(states),
        NgxsAsyncStoragePluginModule.forRoot()
    ]
})
export class AppModule {}
```

## Custom Async Storage Engine
You can implement your own async storage engine by providing an engine that implements `AsyncStorageEngine`:

```typescript
export class MyAsyncStorageEngine implements AsyncStorageEngine {
  constructor(private storage: YourStorage) { }

  length(): Observable<number> {
    // Your logic here
  }

  getItem(key: any): Observable<any> {
    // Your logic here
  }

  setItem(key: any, val: any): void {
    // Your logic here
  }

  removeItem(key: any): void {
    // Your logic here
  }

  clear(): void {
    // Your logic here
  }

  key(val: number): Observable<string> {
    // Your logic here
  }

}

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsAsyncStoragePluginModule.forRoot()
  ],
  providers: [
    {
      provide: STORAGE_ENGINE,
      useClass: MyAsyncStorageEngine
    }
  ]
})
export class AppModule {}
```

You can find an example implementation of the `AsyncStorageEngine` using the Ionic Storage in the integration project: see [StorageService](/integration/app/services/storage.service.ts).

If your async storage returns a `Promise` you can wrap calls with `from(storage.length())` from `rxjs`.

## Options and Migrations
This plugin provides the same options and migration settings as the [Storage Plugin](https://ngxs.gitbook.io/ngxs/plugins/storage). See [Options](https://ngxs.gitbook.io/ngxs/plugins/storage#options) and [Migrations](https://ngxs.gitbook.io/ngxs/plugins/storage#migrations) here.