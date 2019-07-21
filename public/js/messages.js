///////////////////////////////// MESSAGES LIST PAGE /////////////////////////////////
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
            misc_RemoveLoader();
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
    var card = '<div class="four wide column"><a href="message.html?uid={3}"><img src="{5}" class="ui tiny rounded image"></a></div><div class="twelve wide column"><a href="message.html?uid={4}"><h4 id="title">{0}</h4></a><span id="timestamp">{2}</span><span id="description">{1}.</span><div style="width: 100%;" class="ui divider"></div></div>';
    
    card = card.replace('{0}', title);
    card = card.replace('{1}', description);
    card = card.replace('{2}', misc_GetHourMin(timestamp));
    card = card.replace('{3}', uid);
    card = card.replace('{4}', uid);
    //card = card.replace('{5}', img);
    card = card.replace('{5}', 'imgs/black.png');

    return card;
};
///////////////////////////////// MESSAGES LIST PAGE /////////////////////////////////

///////////////////////////////// CHAT DETAIL  /////////////////////////////////
const message_DisplayMessages = function() {
    let firstMessage = true;
    let lastTimestamp = new Date(0);

    const msgUID = misc_GetUrlParam('uid');
    const path = 'messages/' + msgUID + '/msgs';

    var onSucess = function(snapshot) {
        if (firstMessage) {
            misc_RemoveLoader();
            firstMessage = false;
        }

        let userUID = localStorage.getItem('auth_UserUID');

        $.each(snapshot.val(), function( timestamp, value ) {
            var tsDate = new Date(parseInt(timestamp));
            if (message_TestAddDay(tsDate, lastTimestamp)) {
                lastTimestamp = tsDate;
            }

            message_AddMessage((userUID == value.user), timestamp, value.content);
        });
    };

    var onNullValue = function(snapshot) {
        $("#chatMessages").empty().append(misc_GetNullValueMsg(true));
    };

    var onError = function(snapshot) {
        $("#chatMessages").empty().append(misc_GetErrorMsg(true));
    };

    db_get(path, onSucess, onNullValue, onError);
};

const message_TestAddDay = function(timestamp1, timestamp2)
{
    const millisecondsInADay = 86400000;
    const dateDiff = timestamp1.getTime() - timestamp2.getTime();
    
    if (dateDiff > millisecondsInADay) {
        message_AddDay(timestamp1);
        return true;
    }

    return false;
};

const message_AddDay = function(timestamp) {
    let msg = '<div class="sixteen wide column"><div class="ui horizontal divider">{0}</div></div>';
    msg = msg.replace('{0}', misc_GetDate(timestamp, true, false))

    $('#chatMessages').append(msg);
};

const message_AddMessage = function(owner, timestamp, content) {
    let msg = message_GetMessageContent(owner, timestamp, content);

    $('#chatMessages').append(msg);
};

const message_GetMessageContent = function(owner, timestamp, content)
{
    let timestampMsg = '<p style="font-size: x-small;margin: 0 10px;">' + misc_GetHourMin(timestamp) + '</p>';

    if (owner) {
        let ownerMsg = '<div class="two wide column"></div><div class="right aligned fourteen wide column"><div class="blue ui right pointing label">{0}</div>' + timestampMsg + '</div>';
        return ownerMsg.replace('{0}', content);
    } else {
        let otherMsg = '<div class="fourteen wide column"><div class="ui left pointing label">{0}</div>' + timestampMsg + '</div><div class="two wide column"></div>'; 
        return otherMsg.replace('{0}', content);
    }
};
///////////////////////////////// CHAT DETAIL  /////////////////////////////////