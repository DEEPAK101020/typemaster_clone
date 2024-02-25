const express = require('express');
const session = require('express-session');
const passport = require('passport');
const socketIO = require("socket.io");
const cors=require('cors');
const http = require('http');
require('dotenv').config();
const connectedUsers = {};

const {userRouter} = require("./controller/routes/manualLogin.route")
const facebookRouter = require('./controller/routes/facebook.route');
const googleRouter = require('./controller/routes/google.route');
const {newsRouter}=require("./controller/routes/news.routes")
const {connection}=require('./db');
const app = express();

const server = http.createServer(app);
const io = socketIO(server);


const PORT=process.env.PORT;





app.use(cors())
app.use(express.json());
app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });
  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });


app.use('/users', userRouter);
app.use('/facebook', facebookRouter);

app.use('/google', googleRouter);
app.use("/news",newsRouter)

app.use(express.static('lobby.html'));

io.on("connection",(socket)=>{
    socket.on('join-lobby',(userName)=>{
        connectedUsers[socket.id] = {name : userName};
        io.emit('lobby_info', Object.values(connectedUsers));
    })
    
    socket.on('loby-message',(userName,message)=>{
      // connectedUsers[socket.id] = {name : userName,msg:message};
      io.emit('lobby_msg', userName,message);
  })

    socket.on('disconnect', () => {
        if (connectedUsers[socket.id]) {
            const userName = connectedUsers[socket.id].name;
            delete connectedUsers[socket.id];
            console.log(`${userName} left the lobby`);
            io.emit('lobby_info', Object.values(connectedUsers));
        }
    });
});



server.listen(PORT,async()=>{
    try{
         await connection
         console.log("connected to db")
         console.log("server is running at port 4400");
    }catch(err){
        console.log(err);
    }
    
})