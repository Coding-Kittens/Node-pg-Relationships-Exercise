/** Server startup for BizTime. */

const app = require("./app");

app.listen(3000, function () {
  console.log("Listening on http://127.0.0.1:3000");
});
