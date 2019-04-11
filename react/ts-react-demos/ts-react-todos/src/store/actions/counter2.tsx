import * as types from "../action-types";
export interface Add2 {
  type: types.ADD2;
}
export interface Subtract2 {
  type: types.SUBTRACT2;
}
export type Action = Add2 | Subtract2;
export default {
  add(): Add2 {
    // 需要返回一个action对象
    // type为动作的类型
    return { type: types.ADD };
  },
  subtract(): Subtract2 {
    // 需要返回一个action对象
    // type为动作的类型
    return { type: types.SUBTRACT };
  },
  addAsync():any{
    return function(dispatch:any,getState:any){
      setTimeout(() => {
        dispatch({type:types.ADD2})
      }, 1000);
    }
  }
};
