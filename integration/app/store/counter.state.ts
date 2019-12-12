import { State, Action, StateContext } from '@ngxs/store';
export class Increment {
  public static readonly type = '[Counter] Increment';
}
export class Decrement {
  public static readonly type = '[Counter] Decrement';
}

export interface CounterStateModel {
  count: number;
  version: number;
}

@State<CounterStateModel>({
  name: 'counter',
  defaults: {
    count: 0,
    version: 0
  }
})
export class CounterState {
  @Action(Increment)
  public increment({ patchState, getState }: StateContext<CounterStateModel>) {
    patchState({ count: getState().count + 1 });
  }

  @Action(Decrement)
  public decrement({ patchState, getState }: StateContext<CounterStateModel>) {
    patchState({ count: getState().count - 1 });
  }
}
