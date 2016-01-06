// code that is shared between client and server, i.e. sent to both

// method definitions
Meteor.methods({
    // adding new chat
    addChat:function(chatData){
        var chat = Chats.findOne(chatData._filter);
        if (!chat) { // no chat matching the filter - need to insert a new one
            chatId = Chats.insert({
                user1Id: chatData._userId,
                user2Id: chatData._otherUserId
            });
            return chatId;
        } else { // there is a chat going already - use that.
            return chat._id;
        }

    },
    // changing doc privacy settings
    updateChat:function(chatData){
        var chat = Chats.findOne({
            _id: chatData._id
        });
        console.log("updateChat ChatId " + chat._id);
        if (chat) { // ok - we have a chat to use
            var msgs = chat.messages; // pull the messages property
            if (!msgs) { // no messages yet, create a new array
                msgs = [];
            }
            // is a good idea to insert data straight from the form
            // (i.e. the user) into the database?? certainly not.
            // push adds the message to the end of the array
            msgs.push({
                text: chatData._text,
                sender: chatData._sender
            });
            // put the messages array onto the chat object
            chat.messages = msgs;
            // update the chat object in the database.
            Chats.update(chat._id, chat);
        }
    }
});
