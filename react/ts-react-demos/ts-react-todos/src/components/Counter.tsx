// ./src/components/Counter.tsx
// import React from "react"; // 之前的写法
// 在ts中引入的写法
import * as React from "react";
import { connect } from "react-redux";
// 写一个接口对name进行类型校验
// 如果我们不写校验的话，在外部传name进来会报错的
import actions from "../store/actions/counter";
import { Store, Counter1 } from "../types";
interface IProps {
  name: string;
  add: any;
  subtract: any;
  number: number;
  addAsync: any;
  goto: any;
}
// 我们还可以用接口约束state的状态
interface IState {
  number: number;
}
// 把接口约束的规则写在这里
// 如果传入的name不符合类型会报错
// 如果state的number属性不符合类型也会报错
class CounterComponent extends React.Component<IProps, IState> {
  // 状态state
  state = {
    number: 0
  };
  render() {
    let { number, add, subtract, name, addAsync, goto } = this.props;
    return (
      <div>
        <p>{number}</p>
        <p>{name}</p>
        <button onClick={add}>+</button>
        <br />
        <button onClick={subtract}>-</button>
        <br />
        <button onClick={addAsync}>异步+1</button>
        {/* 增加一个按钮,并且点击的时候执行goto方法实现跳转 */}
        <button onClick={() => goto("/counter2")}>跳转到/counter2</button>
      </div>
    );
  }
}
// 这个connect需要执行两次，第二次需要我们把这个组件CounterComponent传进去
// connect第一次执行，需要两个参数，

// 需要传给connect的函数
let mapStateToProps = function(state: Store): Counter1 {
  console.log(state);
  return state.counter;
};

export default connect(
  mapStateToProps,
  actions
)(CounterComponent);
