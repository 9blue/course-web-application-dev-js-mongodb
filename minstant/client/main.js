// subscribe to read data
Meteor.subscribe("chats");
Meteor.subscribe("userData");

// set up the main template the the router will use to build pages
Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

// specify the top level route, the page users see when they arrive at the site
Router.route('/', function() {
    console.log("rendering root /");
    this.render("navbar", {
        to: "header"
    });
    this.render("lobby_page", {
        to: "main"
    });
});

// specify a route that allows the current user to chat to another users
Router.route('/chat/:_id', function() {
    // the user they want to chat to has id equal to
    // the id sent in after /chat/...
    var otherUserId = this.params._id;
    var userId = Meteor.userId();

    // find a chat that has two users that match current user id
    // and the requested user id

    var filter = {
        $or: [{
            user1Id: userId,
            user2Id: otherUserId
        }, {
            user2Id: userId,
            user1Id: otherUserId
        }]
    };
    var chatData = {
        _otherUserId: otherUserId,
        _userId: userId,
        _filter: filter
    };

    Meteor.call("addChat", chatData, function(err, res){
        if (!err){// all good
            console.log("event callback received id: "+ res);
            Session.set("chatId", res);
        }
    });
    this.render("navbar", {
        to: "header"
    });
    this.render("chat_page", {
        to: "main"
    });
});

///
// helper functions
///
Template.available_user_list.helpers({
    users: function() {
        // console.log(Meteor.users.find().fetch());
        return Meteor.users.find();
    }
});
Template.available_user.helpers({
    getUsername: function(userId) {
        user = Meteor.users.findOne({
            _id: userId
        });
        return user.profile.username;
    },
    isMyUser: function(userId) {
        if (userId == Meteor.userId()) {
            return true;
        } else {
            return false;
        }
    }
});


Template.chat_page.helpers({
    messages: function() {
        var chat = Chats.findOne({
            _id: Session.get("chatId")
        });
        console.log(chat);
        return chat.messages;
    },
    other_user: function() {
        return "";
    }
});

Template.chat_message.helpers({
    get_profile: function(userId) {
        var user = Meteor.users.findOne({
            _id: userId
        });
        return user.profile;
    }
});

Template.chat_page.events({
    // this event fires when the user sends a message on the chat page
    'submit .js-send-chat': function(event) {
        // stop the form from triggering a page reload
        event.preventDefault();
        // see if we can find a chat object in the database
        // to which we'll add the message
        var chatData = {
            _id: Session.get("chatId"),
            _text: event.target.chat.value,
            _sender: Meteor.userId()
        };
        Meteor.call("updateChat", chatData);
        event.target.chat.value = "";
    }
});
