import { BehaviorSubject, Observable } from 'rxjs';

export class Store<T> {
  private state$: BehaviorSubject<T>;
  private localStorageKey: string;

  protected constructor(initialState: T, localStorageKey: string) {
     // Setting the default state
     this.localStorageKey = localStorageKey;
     const localStorageState = localStorage.getItem(localStorageKey);

     if (localStorageState) {
      this.state$ = new BehaviorSubject(JSON.parse(localStorageState));
     } else {
       localStorage.setItem(localStorageKey, JSON.stringify(initialState));
       this.state$ = new BehaviorSubject(initialState);
     }
  }

  getValue(): T {
    return this.state$.getValue();
  }

  getState(): Observable<T> {
    return this.state$.asObservable();
  }

  setState(nextState: T): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(nextState));
    this.state$.next(nextState);
  }

}
