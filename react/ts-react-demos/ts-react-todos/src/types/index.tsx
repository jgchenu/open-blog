export interface Store {
  counter: Counter1;
  counter2: Counter2;
  todos: Todos;
}
export interface Counter1 {
  number: number;
}
export interface Counter2 {
  number: number;
}
export interface Todos {
  todos: Array<Todo>;
}
export interface Todo {
  text: string;
  index: number;
}
