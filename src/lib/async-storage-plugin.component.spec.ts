import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncStoragePluginComponent } from './async-storage-plugin.component';

describe('AsyncStoragePluginComponent', () => {
  let component: AsyncStoragePluginComponent;
  let fixture: ComponentFixture<AsyncStoragePluginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsyncStoragePluginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsyncStoragePluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
