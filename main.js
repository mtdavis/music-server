var connect = require("connect");
var http = require("http");
var serveStatic = require("serve-static");

var app = connect();

app.use("/music", serveStatic("D:/music/"));

http.createServer(app).listen(80);
