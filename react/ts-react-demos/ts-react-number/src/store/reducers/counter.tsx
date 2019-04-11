// ./src/store/reducers/index.tsx
// 导入类型校验的接口
// 用来约束state的
import { Counter1 } from "../../types/index";
import { Action } from "../actions/counter";
import * as types from "../action-types";
// 我们需要给number赋予默认值
let initState: Counter1 = { number: 0 };
// 把接口写在state:Store
export default function(state: Counter1 = initState, action: Action) {
  // 拿到老的状态state和新的状态action
  // action是一个动作行为，而这个动作行为，在计数器中是具备 加 或 减 两个功能
  switch (action.type) {
    case types.ADD:
      return { number: state.number + 1 };
    case types.SUBTRACT:
      return { number: state.number - 1 };
    default:
      return state;
  }
}
