const Koa = require("./my-koa/");
const app = new Koa();

app.use(async(ctx, next) => {
  console.log(1);
  ctx.body={
    a:1
  }
  const res=await new Promise(resolve=>{
    setTimeout(() => {
      console.log('settimeout 10')
      resolve('settimeout 10')
    }, 1000);
  })
  await next()
  console.log(2)
})
app.use(async(ctx, next) => {
  console.log(3)
  await next()
  console.log(4)
})
app.use(async(ctx, next) => {
  console.log(5)
  await next()
  console.log(6)
})
app.listen(3000, () => {
  console.log("listen to 3000");
});
