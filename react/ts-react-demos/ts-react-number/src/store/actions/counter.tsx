import * as types from "../action-types";
// 引入push方法
import { push } from "connected-react-router";

export interface Add {
  type: types.ADD;
}
export interface Subtract {
  type: types.SUBTRACT;
}
export type Action = Add | Subtract;
export default {
  add(): Add {
    // 需要返回一个action对象
    // type为动作的类型
    return { type: types.ADD };
  },
  subtract(): Subtract {
    // 需要返回一个action对象
    // type为动作的类型
    return { type: types.SUBTRACT };
  },
  addAsync():any{
    return function(dispatch:any,getState:any){
      setTimeout(() => {
        dispatch({type:types.ADD})
      }, 1000);
    }
  },
  goto(path:string){
    return push(path)
  }
};
