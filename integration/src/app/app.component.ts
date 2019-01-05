import { Component } from '@angular/core';
import { CounterState, Increment, Decrement } from './store/counter.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'integration';

  @Select(CounterState)
  public counter$: Observable<number>;

  constructor(private store: Store) {

  }

  increment() {
    this.store.dispatch(new Increment());
  }

  decrement() {
    this.store.dispatch(new Decrement());
  }
}
