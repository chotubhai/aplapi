const express = require("express");
const path = require("path");
const Busboy = require("busboy");
const AWS = require("aws-sdk");
const mongoose = require("mongoose"); 
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { auth } = require("./middlewares/auth");
const passport = require("passport");
const session = require("express-session");
const multer = require("multer");
const cors = require("cors");
const AVATAR_PATH = path.join("/uploads/users/avatars");
const db = require("./config/config").get(process.env.NODE_ENV);
const formatMessage = require("./utils/messages");
const MongoStore = require("connect-mongodb-session")(session);
const app = express();
const auctionSocket = require("./controllers/auctionScoket");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
auctionSocket(io)

let botName = "ApnaIpl";
app.use(express.static(path.join(__dirname, "public")));
// const io = socketio(server);
// app use



const storage = multer.diskStorage({
  destination: "./uploads/users/avatars",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  }
});
app.use(cors());
const upload = multer({
  storage: storage
});
const store = new MongoStore({
  uri:
    "mongodb+srv://rudy17:rudy17@cluster0.9jinf.mongodb.net/apnaipl?retryWrites=true&w=majority",
  collection: "sessions"
});
app.use("/uploads", express.static(__dirname + "/uploads"));
app.post("/upload", upload.single("avatar"), (req, res) => {
  console.log(req.file);
});

app.use(passport.initialize());
app.use(passport.session());

dotenv.config({ path: "./config/config.env" });
connectDB();
require("./config/passport")(passport);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());

app.engine(".hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
//socket io
app.use((req, res, next) => {
  req.io = io;
  next();
});
//routing

// app.use("/",require("./routes/auth"))
app.use("/auth", require("./routes/auth"));
app.use("/messages", require("./routes/messages"));
app.use("/payment", require("./routes/payment"));
app.use("/auction", require("./routes/auction"));
app.use("/reset", require("./routes/resetpassword"));
app.use("/room", require("./routes/room"));
app.use("/settings", require("./routes/settings"));

// listening port
// const PORT=process.env.PORT||3000;
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`app is live at ${PORT}`);
});
