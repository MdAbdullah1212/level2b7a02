import app from "./app";
import config from "./config";
import { initDB } from "./db";

const main = () => {
  return app.listen(5000, () => {
    initDB();
    console.log(`Example app listening on port 5000`);
  });
};
main()
