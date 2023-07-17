require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);

// ========================= Configuration ========================
const port = process.env.PORT || 3500;

// ========================== Middleware ==========================
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));

// =================== Database Connection ========================
mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Congratulations! Database connection is successful!");
}).catch((error) => {
    console.log(error);
});

// ======================== Routes ===============================
const AccountsRoute = require("./routes/AccountsRoute");
app.use("/", AccountsRoute);

const GiveVote = require("./routes/GiveVote");
app.use("/", GiveVote);

const CandidateRoute = require("./routes/CandidateRoute");
const { Socket } = require('dgram');
app.use("/", CandidateRoute);

// ===================== Socket.io Chat ==========================
io.on('connection', (socket) => {
    console.log('A user connected.');

    // Listen for chat message event
    socket.on('chat message', (msg) => {
        // Broadcast the message to all connected clients
        io.emit('chat message', msg,socket.id);
    });

    // Listen for disconnection event
    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

// ======================== Server ===============================
// http.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

http.listen(port, () => {
    try {
        console.log(`Connection is working on port '${port}'`);
    } catch (error) {
        console.log(error);
    }
});
