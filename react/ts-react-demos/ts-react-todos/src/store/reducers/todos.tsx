import { Todos } from "../../types";
import { Action, AddTodo, RemoveTodo } from "../actions/todos";
import * as types from "../action-types";
let initState: Todos = {
  todos: []
};

export default function(state: Todos = initState, action: Action) {
  switch (action.type) {
    case types.ADDTODO:
      return {
        todos: [
          ...state.todos,
          { text: (action as AddTodo).text, index: state.todos.length }
        ]
      };

    case types.REMOVETODO:
      return {
        todos: [
          ...state.todos.slice(0, (action as RemoveTodo).index),
          ...state.todos.slice((action as RemoveTodo).index + 1)
        ]
      };
    case types.CLEARTODO:
      return {
        todos: []
      };
    default:
      return state;
  }
}
