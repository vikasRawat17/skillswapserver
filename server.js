import connectToDB from "./src/config/connectToDB.js";
import { server } from "./index.js";

server.listen(process.env.PORT, () => {
  connectToDB();
  console.log(`Server running on port ${process.env.PORT}`);
});
