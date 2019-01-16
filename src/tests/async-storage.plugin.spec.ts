import { TestBed } from '@angular/core/testing';

import { Action, NgxsModule, State, Store, NgxsOnInit } from '@ngxs/store';

import { StateContext } from '@ngxs/store';
import { AsyncStorageEngine, NgxsAsyncStoragePluginModule, StorageEngine } from '../public_api';
import { Observable } from 'rxjs';

describe('NgxsAsyncStoragePlugin', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  class Decrement {
    static type = 'DECREMENT';
  }

  interface StateModel {
    count: number;
  }

  @State<StateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  class MyStore {
    @Action(Increment)
    increment({ getState, setState }: StateContext<StateModel>) {
      setState({
        count: Number(getState().count) + 1
      });
    }

    @Action(Decrement)
    decrement({ getState, setState }: StateContext<StateModel>) {
      setState({
        count: Number(getState().count) - 1
      });
    }
  }

  @State<StateModel>({
    name: 'lazyLoaded',
    defaults: { count: 0 }
  })
  class LazyLoadedStore { }

  afterEach(() => {
    localStorage.removeItem('@@STATE');
    sessionStorage.removeItem('@@STATE');
  });

  it('should use a custom storage engine', () => {
    class CustomStorage implements StorageEngine {
      static Storage: any = {
        '@@STATE': {
          counter: {
            count: 100
          }
        }
      };

      get length() {
        return Object.keys(CustomStorage.Storage).length;
      }

      getItem(key: string) {
        return CustomStorage.Storage[key];
      }

      setItem(key: string, val: any) {
        CustomStorage.Storage[key] = val;
      }

      removeItem(key: string) {
        delete CustomStorage.Storage[key];
      }

      clear() {
        CustomStorage.Storage = {};
      }

      key(index: number) {
        return Object.keys(CustomStorage.Storage)[index];
      }
    }

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsAsyncStoragePluginModule.forRoot(CustomStorage, {
          serialize(val) {
            return val;
          },
          deserialize(val) {
            return val;
          }
        })
      ]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(state.count).toBe(105);

        expect(CustomStorage.Storage['@@STATE']).toEqual({ counter: { count: 105 } });
      });
  });

  it('should get initial data from custom async storage using IndexedDB as storage engine', done => {
    let db;
    const objectStore = 'store';

    @State<StateModel>({
      name: 'counter',
      defaults: { count: 0 }
    })
    class AsyncStore extends MyStore implements NgxsOnInit {
      ngxsOnInit() {
        const store = TestBed.get(Store);

        store
          .select(state => state.counter)
          .subscribe((state: StateModel) => {
            expect(state.count).toBe(100);

            const request = db
              .transaction(objectStore, 'readonly')
              .objectStore(objectStore)
              .get('@@STATE');
            request.onsuccess = () => {
              expect(request.result).toEqual({ counter: { count: 100 } });
              done();
            };
          });
      }
    }

    class IndexedDBStorage implements AsyncStorageEngine {
      getItem(key): Observable<any> {
        const request = db
          .transaction(objectStore, 'readonly')
          .objectStore(objectStore)
          .get(key);
        return Observable.create(observer => {
          request.onerror = err => observer.error(err);
          request.onsuccess = () => {
            observer.next(request.result);
            observer.complete();
          };
        });
      }

      setItem(key, val) {
        db.transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .put(val, key);
      }

      clear(): void { }

      key(val: number): Observable<string> {
        return undefined;
      }

      length(): Observable<number> {
        return undefined;
      }

      removeItem(key): void { }
    }

    const dbInit = window.indexedDB.open('initialTestStorage', 1);
    dbInit.onupgradeneeded = (event: any) => {
      db = event.target.result;
      const objectStoreInit = db.createObjectStore(objectStore, { autoIncrement: true });
      objectStoreInit.transaction.oncomplete = () => {
        const stateInit = db
          .transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .add({ counter: { count: 100 } }, '@@STATE');
        stateInit.onsuccess = () => {
          TestBed.configureTestingModule({
            imports: [
              NgxsModule.forRoot([AsyncStore]),
              NgxsAsyncStoragePluginModule.forRoot(IndexedDBStorage, {
                serialize(val) {
                  return val;
                },
                deserialize(val) {
                  return val;
                }
              })
            ]
          });

          TestBed.get(Store);
        };
      };
    };
  });

  it('should save data to custom async storage using IndexedDB as storage engine', done => {

    let db;
    const objectStore = 'store';

    @State<StateModel>({
      name: 'counter',
      defaults: { count: 0 }
    })
    class AsyncStore extends MyStore implements NgxsOnInit {
      ngxsOnInit() {
        const store = TestBed.get(Store);

        store.dispatch(new Increment());
        store.dispatch(new Increment());
        store.dispatch(new Increment());
        store.dispatch(new Increment());
        store.dispatch(new Increment());

        store
          .select(state => state.counter)
          .subscribe((state: StateModel) => {
            expect(state.count).toBe(105);

            const request = db
              .transaction(objectStore, 'readonly')
              .objectStore(objectStore)
              .get('@@STATE');
            request.onsuccess = () => {
              expect(request.result).toEqual({ counter: { count: 105 } });
              done();
            };
          });
      }
    }

    class IndexedDBStorage implements AsyncStorageEngine {
      getItem(key): Observable<any> {
        const request = db
          .transaction(objectStore, 'readonly')
          .objectStore(objectStore)
          .get(key);
        return Observable.create(observer => {
          request.onerror = err => observer.error(err);
          request.onsuccess = () => {
            observer.next(request.result);
            observer.complete();
          };
        });
      }

      setItem(key, val) {
        db.transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .put(val, key);
      }

      clear(): void { }

      key(val: number): Observable<string> {
        return undefined;
      }

      length(): Observable<number> {
        return undefined;
      }

      removeItem(key): void { }
    }

    const dbInit = window.indexedDB.open('saveDateTestStorage', 1);
    dbInit.onupgradeneeded = (event: any) => {
      db = event.target.result;
      const objectStoreInit = db.createObjectStore(objectStore, { autoIncrement: true });
      objectStoreInit.transaction.oncomplete = () => {
        const stateInit = db
          .transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .add({ counter: { count: 100 } }, '@@STATE');
        stateInit.onsuccess = () => {
          TestBed.configureTestingModule({
            imports: [
              NgxsModule.forRoot([AsyncStore]),
              NgxsAsyncStoragePluginModule.forRoot(IndexedDBStorage, {
                serialize(val) {
                  return val;
                },
                deserialize(val) {
                  return val;
                }
              })
            ]
          });

          TestBed.get(Store);
        };
      };
    };
  });

  describe('when blank values are returned from custom async storage using IndexedDB as storage engine', () => {
    it('should use default data if null retrieved from custom async storage using IndexedDB as storage engine', done => {
      let db;
      const objectStore = 'store';

      @State<StateModel>({
        name: 'counter',
        defaults: { count: 1337 }
      })
      class AsyncStore extends MyStore implements NgxsOnInit {
        ngxsOnInit() {
          const store = TestBed.get(Store);

          store
            .select(state => state.counter)
            .subscribe((state: StateModel) => {
              expect(state.count).toBe(1337);

              const request = db
                .transaction(objectStore, 'readonly')
                .objectStore(objectStore)
                .get('@@STATE');
              request.onsuccess = () => {
                expect(request.result).toEqual(null);
                done();
              };
            });
        }
      }

      class IndexedDBStorage implements AsyncStorageEngine {
        getItem(key): Observable<any> {
          const request = db
            .transaction(objectStore, 'readonly')
            .objectStore(objectStore)
            .get(key);
          return Observable.create(observer => {
            request.onerror = err => observer.error(err);
            request.onsuccess = () => {
              observer.next(request.result);
              observer.complete();
            };
          });
        }

        setItem(key, val) {
          db.transaction(objectStore, 'readwrite')
            .objectStore(objectStore)
            .put(val, key);
        }

        clear(): void { }

        key(val: number): Observable<string> {
          return undefined;
        }

        length(): Observable<number> {
          return undefined;
        }

        removeItem(key): void { }
      }

      const dbInit = window.indexedDB.open('nullValueTestStorage', 1);
      dbInit.onupgradeneeded = (event: any) => {
        db = event.target.result;
        const objectStoreInit = db.createObjectStore(objectStore, { autoIncrement: true });
        objectStoreInit.transaction.oncomplete = () => {
          const stateInit = db
            .transaction(objectStore, 'readwrite')
            .objectStore(objectStore)
            .add(<any>null, '@@STATE');
          stateInit.onsuccess = () => {
            TestBed.configureTestingModule({
              imports: [
                NgxsModule.forRoot([AsyncStore]),
                NgxsAsyncStoragePluginModule.forRoot(IndexedDBStorage, {
                  serialize(val) {
                    return val;
                  },
                  deserialize(val) {
                    return val;
                  }
                })
              ]
            });

            TestBed.get(Store);
          };
        };
      };
    });

    it('should use default data if undefined retrieved from custom async storage using IndexedDB as storage engine', done => {
      let db;
      const objectStore = 'store';

      @State<StateModel>({
        name: 'counter',
        defaults: { count: 1337 }
      })
      class AsyncStore extends MyStore implements NgxsOnInit {
        ngxsOnInit() {
          const store = TestBed.get(Store);

          store
            .select(state => state.counter)
            .subscribe((state: StateModel) => {
              expect(state.count).toBe(1337);

              const request = db
                .transaction(objectStore, 'readonly')
                .objectStore(objectStore)
                .get('@@STATE');
              request.onsuccess = () => {
                expect(request.result).toEqual(undefined);
                done();
              };
            });
        }
      }

      class IndexedDBStorage implements AsyncStorageEngine {
        getItem(key): Observable<any> {
          const request = db
            .transaction(objectStore, 'readonly')
            .objectStore(objectStore)
            .get(key);
          return Observable.create(observer => {
            request.onerror = err => observer.error(err);
            request.onsuccess = () => {
              observer.next(request.result);
              observer.complete();
            };
          });
        }

        setItem(key, val) {
          db.transaction(objectStore, 'readwrite')
            .objectStore(objectStore)
            .put(val, key);
        }

        clear(): void { }

        key(val: number): Observable<string> {
          return undefined;
        }

        length(): Observable<number> {
          return undefined;
        }

        removeItem(key): void { }
      }

      const dbInit = window.indexedDB.open('undefinedValueTestStorage', 1);
      dbInit.onupgradeneeded = (event: any) => {
        db = event.target.result;
        const objectStoreInit = db.createObjectStore(objectStore, { autoIncrement: true });
        objectStoreInit.transaction.oncomplete = () => {
          const stateInit = db
            .transaction(objectStore, 'readwrite')
            .objectStore(objectStore)
            .add(<any>undefined, '@@STATE');
          stateInit.onsuccess = () => {
            TestBed.configureTestingModule({
              imports: [
                NgxsModule.forRoot([AsyncStore]),
                NgxsAsyncStoragePluginModule.forRoot(IndexedDBStorage, {
                  serialize(val) {
                    return val;
                  },
                  deserialize(val) {
                    return val;
                  }
                })
              ]
            });

            TestBed.get(Store);
          };
        };
      };
    });

    it(`should use default data if the string 'undefined' retrieved from  custom async storage using IndexedDB as storage engine`, done => {
      let db;
      const objectStore = 'store';

      @State<StateModel>({
        name: 'counter',
        defaults: { count: 1337 }
      })
      class AsyncStore extends MyStore implements NgxsOnInit {
        ngxsOnInit() {
          const store = TestBed.get(Store);

          store
            .select(state => state.counter)
            .subscribe((state: StateModel) => {
              expect(state.count).toBe(1337);

              const request = db
                .transaction(objectStore, 'readonly')
                .objectStore(objectStore)
                .get('@@STATE');
              request.onsuccess = () => {
                expect(request.result).toEqual('undefined');
                done();
              };
            });
        }
      }

      class IndexedDBStorage implements AsyncStorageEngine {
        getItem(key): Observable<any> {
          const request = db
            .transaction(objectStore, 'readonly')
            .objectStore(objectStore)
            .get(key);
          return Observable.create(observer => {
            request.onerror = err => observer.error(err);
            request.onsuccess = () => {
              observer.next(request.result);
              observer.complete();
            };
          });
        }

        setItem(key, val) {
          db.transaction(objectStore, 'readwrite')
            .objectStore(objectStore)
            .put(val, key);
        }

        clear(): void { }

        key(val: number): Observable<string> {
          return undefined;
        }

        length(): Observable<number> {
          return undefined;
        }

        removeItem(key): void { }
      }

      const dbInit = window.indexedDB.open('undefinedStringValueTestStorage', 1);
      dbInit.onupgradeneeded = (event: any) => {
        db = event.target.result;
        const objectStoreInit = db.createObjectStore(objectStore, { autoIncrement: true });
        objectStoreInit.transaction.oncomplete = () => {
          const stateInit = db
            .transaction(objectStore, 'readwrite')
            .objectStore(objectStore)
            .add('undefined', '@@STATE');
          stateInit.onsuccess = () => {
            TestBed.configureTestingModule({
              imports: [
                NgxsModule.forRoot([AsyncStore]),
                NgxsAsyncStoragePluginModule.forRoot(IndexedDBStorage, {
                  serialize(val) {
                    return val;
                  },
                  deserialize(val) {
                    return val;
                  }
                })
              ]
            });

            TestBed.get(Store);
          };
        };
      };
    });
  });

  it('should migrate global custom async storage using IndexedDB as storage engine', done => {

    let db;
    const objectStore = 'store';

    @State<StateModel>({
      name: 'counter',
      defaults: { count: 0 }
    })
    class AsyncStore extends MyStore implements NgxsOnInit {
      ngxsOnInit() {
        const store = TestBed.get(Store);

        store
          .select(state => state.counter)
          .subscribe((state: StateModel) => {

            const request = db
              .transaction(objectStore, 'readonly')
              .objectStore(objectStore)
              .get('@@STATE');
            request.onsuccess = () => {
              expect(request.result).toEqual({ counter: { counts: 100, version: 2 } });
              done();
            };
          });
      }
    }

    class IndexedDBStorage implements AsyncStorageEngine {
      getItem(key): Observable<any> {
        const request = db
          .transaction(objectStore, 'readonly')
          .objectStore(objectStore)
          .get(key);
        return Observable.create(observer => {
          request.onerror = err => observer.error(err);
          request.onsuccess = () => {
            observer.next(request.result);
            observer.complete();
          };
        });
      }

      setItem(key, val) {
        db.transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .put(val, key);
      }

      clear(): void { }

      key(val: number): Observable<string> {
        return undefined;
      }

      length(): Observable<number> {
        return undefined;
      }

      removeItem(key): void { }
    }

    const dbInit = window.indexedDB.open('migrateGlobalTestStorage', 1);
    dbInit.onupgradeneeded = (event: any) => {
      db = event.target.result;
      const objectStoreInit = db.createObjectStore(objectStore, { autoIncrement: true });
      objectStoreInit.transaction.oncomplete = () => {
        const stateInit = db
          .transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .add({ counter: { count: 100, version: 1 } }, '@@STATE');
        stateInit.onsuccess = () => {
          TestBed.configureTestingModule({
            imports: [
              NgxsModule.forRoot([AsyncStore]),
              NgxsAsyncStoragePluginModule.forRoot(IndexedDBStorage, {
                serialize(val) {
                  return val;
                },
                deserialize(val) {
                  return val;
                },
                migrations: [
                  {
                    version: 1,
                    versionKey: 'counter.version',
                    migrate: (state: any) => {
                      state.counter = {
                        counts: state.counter.count,
                        version: 2
                      };
                      return state;
                    }
                  }
                ]
              })
            ]
          });

          TestBed.get(Store);
        };
      };
    };
  });

  it('should migrate single custom async storage using IndexedDB as storage engine', done => {

    let db;
    const objectStore = 'store';

    @State<StateModel>({
      name: 'counter',
      defaults: { count: 0 }
    })
    class AsyncStore extends MyStore implements NgxsOnInit {
      ngxsOnInit() {
        const store = TestBed.get(Store);

        store
          .select(state => state)
          .subscribe((state: StateModel) => {

            const request = db
              .transaction(objectStore, 'readonly')
              .objectStore(objectStore)
              .get('counter');
            request.onsuccess = () => {
              expect(request.result).toEqual({ counts: 100, version: 2 });
              done();
            };
          });
      }
    }

    class IndexedDBStorage implements AsyncStorageEngine {
      getItem(key): Observable<any> {
        const request = db
          .transaction(objectStore, 'readonly')
          .objectStore(objectStore)
          .get(key);
        return Observable.create(observer => {
          request.onerror = err => observer.error(err);
          request.onsuccess = () => {
            observer.next(request.result);
            observer.complete();
          };
        });
      }

      setItem(key, val) {
        db.transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .put(val, key);
      }

      clear(): void { }

      key(val: number): Observable<string> {
        return undefined;
      }

      length(): Observable<number> {
        return undefined;
      }

      removeItem(key): void { }
    }

    const dbInit = window.indexedDB.open('migrateSingleTestStorage', 1);
    dbInit.onupgradeneeded = (event: any) => {
      db = event.target.result;
      const objectStoreInit = db.createObjectStore(objectStore, { autoIncrement: true });
      objectStoreInit.transaction.oncomplete = () => {
        const stateInit = db
          .transaction(objectStore, 'readwrite')
          .objectStore(objectStore)
          .add({ count: 100, version: 1 }, 'counter');
        stateInit.onsuccess = () => {
          TestBed.configureTestingModule({
            imports: [
              NgxsModule.forRoot([AsyncStore]),
              NgxsAsyncStoragePluginModule.forRoot(IndexedDBStorage, {
                key: 'counter',
                serialize(val) {
                  return val;
                },
                deserialize(val) {
                  return val;
                },
                migrations: [
                  {
                    version: 1,
                    key: 'counter',
                    versionKey: 'version',
                    migrate: (state: any) => {
                      state = {
                        counts: state.count,
                        version: 2
                      };
                      return state;
                    }
                  }
                ]
              })
            ]
          });

          TestBed.get(Store);
        };
      };
    };
  });

});
