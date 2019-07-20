const messages_GoTo = function() {
    auth_RequireLoggingToAccess("messages.html");
};

const messages_DisplayMessageList = function() {
    var path = localStorage.getItem('auth_UserUID') + '/messages';
    
    var userRef = rootRef.child('users');
    var msgsLastInfoRef = rootRef.child('messages_last_info');

    var messages = $("#messages");
    var firstMessage = true;

    var onSucess = function(snapshot) {
        if (firstMessage) {
            $("#messages").empty();
            firstMessage = false;
        }

        var val = snapshot.val();
        messages.append(messages_GetMessageCard(snapshot.key, val.ad_image, val.ad_title, val.content, val.timestamp));
    };

    var onNullValue = function(snapshot) {
        $("#messages").empty().append(misc_GetNullValueMsg(true));
    };

    var onError = function(snapshot) {
        $("#messages").empty().append(misc_GetErrorMsg(true));
    };

    db_getInnerJoin(userRef, path, msgsLastInfoRef, onSucess, onNullValue, onError);
};

const messages_GetMessageCard = function(uid, img, title, description, timestamp) {
    const date = new Date(timestamp);
    
    var card = '<div class="four wide column"><a href="message.html?uid={3}"><img src="{5}" class="ui tiny rounded image"></a></div><div class="twelve wide column"><a href="message.html?uid={4}"><h4 id="title">{0}</h4></a><span id="timestamp">{2}</span><span id="description">{1}.</span><div style="width: 100%;" class="ui divider"></div></div>';
    
    card = card.replace('{0}', title);
    card = card.replace('{1}', description);
    card = card.replace('{2}', date.getHours() + ":" + date.getMinutes());
    card = card.replace('{3}', uid);
    card = card.replace('{4}', uid);
    //card = card.replace('{5}', img);
    card = card.replace('{5}', 'imgs/black.png');

    return card;
};