let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;
let counter = 0;
let trackedUsers = {};

let messageLimit = 200;
let storedMsgs = [];
let msgPointer = 0;
let messageCount = 0;
let currentOnlineUsers = {};

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
    socket.loggedIn = false
    socket.username = "User" + ++counter;
    socket.emit('requestUserGUID');

    socket.on('provideUserGUID', function(userGUIDJson){
        let userGUID = userGUIDJson.userGUID || 0;
        if (trackedUsers[userGUID]){
            // User has is tracked
            socket.username = trackedUsers[userGUID]["username"];
            socket.color = trackedUsers[userGUID]["color"];
            socket.guid = userGUID;
        } else {
            socket.guid = guid();
            socket.color = '000000';
            trackedUsers[socket.guid] =
                {
                    'username': socket.username,
                    'color': socket.color
                }
        }
        currentOnlineUsers[socket.username] = (currentOnlineUsers[socket.username]+ 1) || 1;
        sendOnlineUsers();

        socket.emit('userConnected', socket.guid, socket.username, socket.color);
        socket.emit("individual_msg", "You are user " + socket.username +".", false);
        socket.emit('chatHistory', storedMsgs, msgPointer-1, messageCount, messageLimit);
        socket.loggedIn = true;
    });

    socket.on('send_chat_msg', function(msg){
        if(socket.loggedIn) {
            // Track timestamp of message
            let timestamp = Date.now();
            // Determine if they are changing their nickname
            let nicknameRegExp = /[/]nick\s+(\S+)/gi;
            let match = nicknameRegExp.exec(msg);
            if(match){
                let potentialNewNick = match[1];
                if(usernameUnique(potentialNewNick)) {
                    currentOnlineUsers[potentialNewNick] = currentOnlineUsers[socket.username];
                    delete currentOnlineUsers[socket.username];
                    sendOnlineUsers();

                    socket.username = potentialNewNick;
                    trackedUsers[socket.guid]["username"] = socket.username;
                    socket.emit("usernameUpdated", socket.username);

                    socket.emit("individual_msg", "Your nickname is now " + socket.username +".", false);
                } else {
                    socket.emit("individual_msg", "Nickname " + potentialNewNick+" is already in use.", true);
                }
            } else {
                let nicknameColorReg = /[/]nickcolor\s+([0-9a-f]{6})/gi;
                match = nicknameColorReg.exec(msg);
                if(match){
                    socket.color = match[1];
                    trackedUsers[socket.guid]["color"] = socket.color;
                    socket.emit("nick_color_update", "Your nickname color is now " , socket.color);

                } else {
                    io.emit('broadcast_chat_msg', socket.username, socket.color, msg, timestamp);
                    storedMsgs[msgPointer] =
                        {
                            'username': socket.username,
                            'color': socket.color,
                            'message': msg,
                            'timestamp': timestamp
                        };
                    msgPointer++;
                    if (msgPointer >= messageLimit) {
                        msgPointer = 0;
                    }
                    if (messageCount < messageLimit) {
                        messageCount++;
                    }
                }
            }
        }
    });

    function usernameUnique(username){
        let lowerUsername = username.toLowerCase();
        for (let index in trackedUsers) {
            let lowerStoredName = trackedUsers[index]["username"].toLowerCase();
            if(lowerUsername === lowerStoredName){
                return false;
            }
        }
        return true;
    }

    // Code to generate a pseudo-guid obtained from:
    // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    socket.on('disconnect', function(){
        // remove the username from global onlineUsers list
        currentOnlineUsers[socket.username] = currentOnlineUsers[socket.username] -1;
        if(currentOnlineUsers[socket.username] < 1){
            delete currentOnlineUsers[socket.username]
        }
        sendOnlineUsers();
    });

    function sendOnlineUsers(){
        let usernames = [];
        for (let index in currentOnlineUsers){
            usernames.push(index);
        }
        io.emit('refreshOnlineUsers', usernames);
    }
});