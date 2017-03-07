// shorthand for $(document).ready(...)

$(function() {
    let socket = io();
    socket.color = '000000';

    $('form').submit(function(){
	    socket.emit('send_chat_msg', $('#input_field').val());  // Emits/sends the input text
	    $('#input_field').val('');                              // Clears the input field after sending
	    return false;
    });

    socket.on('requestUserGUID',function(){
        let userGUID = Cookies.get("userGUID") || 0;
        let userGUIDJson = {'userGUID':userGUID};
        socket.emit('provideUserGUID', userGUIDJson);
    });

    socket.on('userConnected', function(guid, username){
        socket.username = username;
        socket.guuid = guid;
        Cookies.set('userGUID',guid, { expires: 7 }); // Create a cookie that expires in 7 days
        updateUsernameHeader();
    });

    socket.on('usernameUpdated', function(username){
        socket.username = username;
        updateUsernameHeader();
    });

    socket.on('chatHistory', function(chatHistory, end, total, max){
        $('#messages').empty();
        let current = 0;
        if(total == max){
            // we've wrapped around
            current = end +1;
            if(current >= max){
                // Verify we aren't out of bounds
                current = 0;
            }
        } else {
            // We haven't wrapped around, safe to use the starting
            current = 0;
        }

        let index = 0;
        while(index < total){
            postMessage(
                chatHistory[current].username,
                chatHistory[current].color,
                chatHistory[current].message,
                chatHistory[current].timestamp);
            index++;
            current++;
            if(current >= max){
                current = 0;
            }
        }
    });

    socket.on('individual_msg', function(msg,error){
        if(error) {
            $('#messages').append($('<li class="error">')
                .append($('<span class="message">').text(msg)));

        } else {
            $('#messages').append($('<li class="mine">')
                .append($('<span class="message">').text(msg)));
        }
    });

    socket.on('nick_color_update', function(msg,color){
        $('#messages').append($('<li class="mine">')
            .append($('<span class="message">'))
            .append($('<span>').text(msg))
            .append($('<span style="color:#' + color + ';" >').text("#"+color)));
    });

    socket.on('broadcast_chat_msg', function(username, color, msg, timestamp){
        postMessage(username, color, msg, timestamp)});

    function postMessage(username,color, msg, timestamp) {
        let messageTime = new Date(timestamp);
        let time = messageTime.toLocaleTimeString();
        if(socket.username === username) {
            $('#messages').append($('<li class="mine">')
                .append($('<span class="time">').text(time))
                .append($('<span class="username" style="color:#' + color + ';" >').text(username))
                .append($('<span class="message">').text(msg)));
        }else {
            $('#messages').append($('<li>')
                .append($('<span class="time">').text(time))
                .append($('<span class="username" style="color:#' + color + ';" >').text(username))
                .append($('<span class="message">').text(msg)));
        }
        scrollToLastMsg();
    }

    // Scrolling code modified from:
    // http://stackoverflow.com/questions/270612/scroll-to-bottom-of-div
    function scrollToLastMsg() {
        let objDiv = document.getElementById("messages-container");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    socket.on('refreshOnlineUsers', function(usernames){
        $('#online-users').empty();
        for (let index in usernames) {
            $('#online-users').append($('<li>')
                .append($('<span class="online-user">').text(usernames[index])));
        }
    });


    function updateUsernameHeader(){
        let newText = "You are " + socket.username + ".";
        $('#you-are').empty();
        $('#you-are').append(newText);
    }
});
