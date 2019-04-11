import * as React from "react";
import { connect } from "react-redux";
import action from "../store/actions/todos";
import { Todos, Todo, Store } from "../types";
interface Iprops {
  todos: Array<Todo>;
  addTodo: any;
  removeTodo: any;
}
interface Istate {
  text: string;
}
class TodosComponent extends React.Component<Iprops, Istate> {
  handleOnchange(e: any) {
    this.setState({
      text: e.target.value
    });
  }
  handleOnKeyup(e: any) {
    if (e.keyCode === 13) {
      this.props.addTodo(this.state.text);
      this.setState({
        text: ""
      });
    }
  }
  handleOnClick(index: number) {
    this.props.removeTodo(index);
  }
  state = {
    text: ""
  };
  render() {
    const { todos } = this.props;
    return (
      <div>
        <ul>
          {todos.map((item, index) => (
            <li key={index} onClick={this.handleOnClick.bind(this, index)}>
              {item.text}
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder='回车添加-点击列表删除'
          value={this.state.text}
          onChange={this.handleOnchange.bind(this)}
          onKeyUp={this.handleOnKeyup.bind(this)}
        />
      </div>
    );
  }
}
let mapStateToProps = function(state: Store, getState: any): Todos {
  return state.todos;
};
export default connect(
  mapStateToProps,
  action
)(TodosComponent);
