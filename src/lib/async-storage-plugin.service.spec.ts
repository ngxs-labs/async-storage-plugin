import { TestBed } from '@angular/core/testing';

import { AsyncStoragePluginService } from './async-storage-plugin.service';

describe('AsyncStoragePluginService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AsyncStoragePluginService = TestBed.get(AsyncStoragePluginService);
    expect(service).toBeTruthy();
  });
});
