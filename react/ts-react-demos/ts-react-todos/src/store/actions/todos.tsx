import * as types from "../action-types";

export interface AddTodo {
  type: types.ADDTODO;
  text: string;
}
export interface RemoveTodo {
  type: types.REMOVETODO;
  index: number;
}
export interface ClearTodo {
  type: types.CLEARTODO;
}
export type Action = AddTodo | RemoveTodo | ClearTodo;
export default {
  addTodo(text: string): AddTodo {
    return {
      type: types.ADDTODO,
      text
    };
  },
  removeTodo(index: number): RemoveTodo {
    return {
      type: types.REMOVETODO,
      index
    };
  },
  clearTodo(): ClearTodo {
    return {
      type: types.CLEARTODO
    };
  }
};
