import { combineReducers } from "redux";
import counter from "./counter";
import counter2 from "./counter2";
// 引入connectRouter
import { connectRouter } from "connected-react-router";
import history from "../../history";

let reducers = combineReducers({
  counter,
  counter2,
  // 把history传到connectRouter函数中
  router: connectRouter(history)
});
export default reducers;