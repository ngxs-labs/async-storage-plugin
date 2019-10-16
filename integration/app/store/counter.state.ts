import { State, Action, StateContext } from '@ngxs/store';
export class Increment {
  public static readonly type = '[Counter] Increment';
}
export class Decrement {
  public static readonly type = '[Counter] Decrement';
}
@State<number>({
  name: 'counter',
  defaults: 0
})
export class CounterState {
  @Action(Increment)
  public increment({ setState, getState }: StateContext<number>) {
    setState(getState() + 1);
  }
  @Action(Decrement)
  public decrement({ setState, getState }: StateContext<number>) {
    setState(getState() - 1);
  }
}
