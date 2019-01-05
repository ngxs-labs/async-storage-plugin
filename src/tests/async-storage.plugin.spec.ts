import { TestBed } from '@angular/core/testing';

import { Action, NgxsModule, State, Store, NgxsOnInit } from '@ngxs/store';

import { StateContext } from '@ngxs/store';
import { AsyncStorageEngine, NgxsAsyncStoragePluginModule, StorageOption, StorageEngine, STORAGE_ENGINE } from '../public_api';
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

  it('should get initial data from localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyStore]), NgxsAsyncStoragePluginModule.forRoot()]
    });

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(state.count).toBe(100);
      });
  });

  it('should save data to localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyStore]), NgxsAsyncStoragePluginModule.forRoot()]
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

        expect(localStorage.getItem('@@STATE')).toBe(
          JSON.stringify({ counter: { count: 105 } })
        );
      });
  });

  describe('when blank values are returned from localstorage', () => {
    it('should use default data if null retrieved from localstorage', () => {
      localStorage.setItem('@@STATE', <any>null);

      @State<StateModel>({ name: 'counter', defaults: { count: 123 } })
      class TestStore { }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestStore]), NgxsAsyncStoragePluginModule.forRoot()]
      });

      const store = TestBed.get(Store);

      store
        .select((state: any) => state.counter)
        .subscribe((state: StateModel) => {
          expect(state.count).toBe(123);
        });
    });

    it('should use default data if undefined retrieved from localstorage', () => {
      localStorage.setItem('@@STATE', <any>undefined);

      @State<StateModel>({ name: 'counter', defaults: { count: 123 } })
      class TestStore { }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestStore]), NgxsAsyncStoragePluginModule.forRoot()]
      });

      const store = TestBed.get(Store);

      store
        .select((state: any) => state.counter)
        .subscribe((state: StateModel) => {
          expect(state.count).toBe(123);
        });
    });

    it(`should use default data if the string 'undefined' retrieved from localstorage`, () => {
      localStorage.setItem('@@STATE', 'undefined');

      @State<StateModel>({ name: 'testStore', defaults: { count: 123 } })
      class TestStore { }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestStore]), NgxsAsyncStoragePluginModule.forRoot()]
      });

      const store = TestBed.get(Store);

      store
        .select((state: any) => state.counter)
        .subscribe((state: StateModel) => {
          expect(state.count).toBe(123);
        });
    });
  });

  it('should migrate global localstorage', () => {
    const data = JSON.stringify({ counter: { count: 100, version: 1 } });
    localStorage.setItem('@@STATE', data);

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsAsyncStoragePluginModule.forRoot({
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

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(localStorage.getItem('@@STATE')).toBe(
          JSON.stringify({ counter: { counts: 100, version: 2 } })
        );
      });
  });

  it('should migrate single localstorage', () => {
    const data = JSON.stringify({ count: 100, version: 1 });
    localStorage.setItem('counter', data);

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsAsyncStoragePluginModule.forRoot({
          key: 'counter',
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

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(localStorage.getItem('counter')).toBe(
          JSON.stringify({ counts: 100, version: 2 })
        );
      });
  });

  it('should get initial data from session storage', () => {
    sessionStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsAsyncStoragePluginModule.forRoot({
          storage: StorageOption.SessionStorage
        })
      ]
    });

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(state.count).toBe(100);
      });
  });

  it('should save data to sessionStorage', () => {
    sessionStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsAsyncStoragePluginModule.forRoot({
          storage: StorageOption.SessionStorage
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

        expect(sessionStorage.getItem('@@STATE')).toBe(
          JSON.stringify({ counter: { count: 105 } })
        );
      });
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
        NgxsAsyncStoragePluginModule.forRoot({
          serialize(val) {
            return val;
          },
          deserialize(val) {
            return val;
          }
        })
      ],
      providers: [
        {
          provide: STORAGE_ENGINE,
          useClass: CustomStorage
        }
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

  it('should merge unloaded data from feature with local storage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsAsyncStoragePluginModule.forRoot(),
        NgxsModule.forFeature([LazyLoadedStore])
      ]
    });

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state)
      .subscribe((state: { counter: StateModel; lazyLoaded: StateModel }) => {
        expect(state.lazyLoaded).toBeDefined();
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
              NgxsAsyncStoragePluginModule.forRoot({
                serialize(val) {
                  return val;
                },
                deserialize(val) {
                  return val;
                }
              })
            ],
            providers: [
              {
                provide: STORAGE_ENGINE,
                useClass: IndexedDBStorage
              }
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
              NgxsAsyncStoragePluginModule.forRoot({
                serialize(val) {
                  return val;
                },
                deserialize(val) {
                  return val;
                }
              })
            ],
            providers: [
              {
                provide: STORAGE_ENGINE,
                useClass: IndexedDBStorage
              }
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
                NgxsAsyncStoragePluginModule.forRoot({
                  serialize(val) {
                    return val;
                  },
                  deserialize(val) {
                    return val;
                  }
                })
              ],
              providers: [
                {
                  provide: STORAGE_ENGINE,
                  useClass: IndexedDBStorage
                }
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
                NgxsAsyncStoragePluginModule.forRoot({
                  serialize(val) {
                    return val;
                  },
                  deserialize(val) {
                    return val;
                  }
                })
              ],
              providers: [
                {
                  provide: STORAGE_ENGINE,
                  useClass: IndexedDBStorage
                }
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
                NgxsAsyncStoragePluginModule.forRoot({
                  serialize(val) {
                    return val;
                  },
                  deserialize(val) {
                    return val;
                  }
                })
              ],
              providers: [
                {
                  provide: STORAGE_ENGINE,
                  useClass: IndexedDBStorage
                }
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
              NgxsAsyncStoragePluginModule.forRoot({
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
            ],
            providers: [
              {
                provide: STORAGE_ENGINE,
                useClass: IndexedDBStorage
              }
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
              NgxsAsyncStoragePluginModule.forRoot({
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
            ],
            providers: [
              {
                provide: STORAGE_ENGINE,
                useClass: IndexedDBStorage
              }
            ]
          });

          TestBed.get(Store);
        };
      };
    };
  });

});
