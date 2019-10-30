///////////////////////////////// MESSAGES LIST PAGE /////////////////////////////////
const messages_GoTo = function() {
    auth_RequireLoggingToAccess("messages.html");
};

const messages_DisplayMessageList = function() {
    const path = localStorage.getItem('auth_UserUID');

    if (path == null) {
        messages_GoTo();
    }

    const tableOne = rootRef.child('users_messages');
    const msgsLastInfoRef = rootRef.child('messages_last_info');

    const messages = $("#messages");
    var firstMessage = true;
    
    var timestampList = {};

    const bodyRef = $("html, body");

    var onSucess = function(snapshot) {
        if (firstMessage) {
            misc_RemoveErrorNullMsg();
            misc_RemoveLoader();
            firstMessage = false;
        }

        var val = snapshot.val();
        var added = false;

        $.each(timestampList, function(timestamp, obj ) {
            t1 = val.timestamp;
            t2 = timestamp;
            
            if (t1 == t2) {
                added = true;
                return false;
            } else if (t1 > t2) {
                timestampList[val.timestamp] = messages.prepend(messages_GetMessageCard(snapshot.key, val.ad_image, val.ad_title, val.content, val.timestamp), obj);
                added = true;
                return false;
            }
        });
        
        if (!added) {
            timestampList[val.timestamp] = messages.append(messages_GetMessageCard(snapshot.key, val.ad_image, val.ad_title, val.content, val.timestamp));
        }

        misc_SchedulePageSave();

        bodyRef.animate({ scrollTop: $(document).height() }, 0);
    };

    var onNullValue = function(snapshot) {
        $("#messages").empty().append(misc_GetNullValueMsg(true));
    };

    var onError = function(snapshot) {
        $("#messages").empty().append(misc_GetErrorMsg(true));
    };

    db_getInnerJoin(tableOne, path, msgsLastInfoRef, onSucess, onNullValue, onError);
};

const messages_GetMessageCard = function(uid, img, title, description, timestamp) {
    var card = '<div class="four wide column"><a href="message.html?uid={3}"><img src="{5}" class="ui tiny rounded image"></a></div><div class="twelve wide column"><a href="message.html?uid={4}"><h4 id="title">{0}</h4></a><span id="timestamp">{2}</span><span id="description">{1}</span><div style="width: 100%;" class="ui divider"></div></div>';
    
    card = card.replace('{0}', title);
    card = card.replace('{1}', description);
    card = card.replace('{2}', misc_GetHourMin(timestamp));
    card = card.replace('{3}', uid);
    card = card.replace('{4}', uid);
    card = card.replace('{5}', img);
    //card = card.replace('{5}', 'imgs/black.png');

    return card;
};
///////////////////////////////// MESSAGES LIST PAGE /////////////////////////////////

///////////////////////////////// CHAT DETAIL  /////////////////////////////////
var msgUID, messagePath = null;

if (navigator.onLine) {
    msgUID = misc_GetUrlParam('uid');
    messagePath = 'messages/' + msgUID + '/msgs';
}

var lastChatDetailTimestamp = new Date(0);

const message_DisplayMessages = function() {
    if (localStorage.getItem('auth_UserUID') == null)
    {
        auth_RequireLoggingToAccess(sw_GetPageName(true));
    }

    var onSucess = function(snapshot) {
        misc_RemoveLoader();
        
        $.each(snapshot.val(), function(timestamp, value ) {
            message_NewMessageReceived(timestamp, value);
        });
        
        sw_SavePage();

        $("html, body").animate({ scrollTop: $(document).height() }, 10);
        message_ListenToNewMessages(lastChatDetailTimestamp.getTime(), messagePath);
    };

    var onNullValue = function(snapshot) {
        misc_RemoveLoader();
        $("#chatMessages").append(misc_GetNullValueMsg(true));
    };

    var onError = function(snapshot) {
        misc_RemoveLoader();
        $("#chatMessages").append(misc_GetErrorMsg(true));
    };

    db_get(messagePath, onSucess, onNullValue, onError);
};

const message_ListenToNewMessages = function(lastTimestamp, path) {
    lastTimestamp = lastTimestamp + 1;
    
    const bodyRef = $("html, body");

    db.ref(path).orderByKey().startAt(lastTimestamp.toString()).on('child_added', snap => {
        message_NewMessageReceived(snap.key, snap.val());

        bodyRef.animate({ scrollTop: $(document).height() }, 10);
    });
};

const message_NewMessageReceived = function(timestamp, value) {
    var tsDate = new Date(parseInt(timestamp));

    message_TestAddDay(tsDate, lastChatDetailTimestamp);
    lastChatDetailTimestamp = tsDate;

    let userUID = localStorage.getItem('auth_UserUID');
    message_AddMessage((userUID == value.user), timestamp, value.content);
};

const message_TestAddDay = function(timestamp1, timestamp2)
{
    let isDiffDay = false;

    if (timestamp1.getUTCDate() != timestamp2.getUTCDate()) {
        isDiffDay = true;
    }
     else if (timestamp1.getUTCMonth() != timestamp2.getUTCMonth()) {
        isDiffDay = true;
    } else if (timestamp1.getUTCFullYear() != timestamp2.getUTCFullYear()) {
        isDiffDay = true;
    }
    
    if (isDiffDay) {
        message_AddDay(timestamp1);
    }
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
        let ownerMsg = '<div class="two wide column"></div><div class="right aligned fourteen wide column"><div class="orange ui right pointing label">{0}</div>' + timestampMsg + '</div>';
        return ownerMsg.replace('{0}', content);
    } else {
        let otherMsg = '<div class="fourteen wide column"><div class="ui left pointing label">{0}</div>' + timestampMsg + '</div><div class="two wide column"></div>'; 
        return otherMsg.replace('{0}', content);
    }
};

///////////////////////////////// SEND MESSAGE  /////////////////////////////////
const message_SendMessage = function() {
    message_FirstMessageSent();

    const textMessage = $('#textMessage');

    if (textMessage.val() == '') { return; }

    const key = Date.now();
    const newMsgPath = messagePath + '/' + key;

    var dataToInsert = {
        user: localStorage.getItem('auth_UserUID'),
        content : textMessage.val()
    };
    
    textMessage.val('');

    // Save message
    db_set(newMsgPath, dataToInsert);
    // Update data in last info table
    message_UpdateInfoInLastInfoTable(misc_GetUrlParam('uid'), key, dataToInsert.content);
};

const message_UpdateInfoInLastInfoTable = function(msgUID, timestamp, content) {
    const path = 'messages_last_info/' + msgUID + '/';
    LastInfoRef = db.ref(path);

    if (content.length > 25) {
        content = content.substring(0, 20) + '...';
    }
    
    LastInfoRef.child('timestamp').set(timestamp);
    LastInfoRef.child('content').set(content);
}

const message_FirstMessageSent = function() {
    message_RemoveErrorNullMsg();
};

const message_RemoveErrorNullMsg = function() {
    var nullMsg = $('#nullValueMsg');
    if (nullMsg) {
        nullMsg.remove();
        return true;
    } else {
        var errorMsg = $('#nullValueMsg');
        if (errorMsg) {
            errorMsg.remove();
            return true;
        }
    }

    return false;
};

const message_StartChatWithProductOwner = function() {
    const currentUID = localStorage.getItem('auth_UserUID');
    const adUID = misc_GetUrlParam('uid');

    const path = 'ad/' + adUID + '/user';

    var onSucess = function(snapshot) {
        const ownerUID = snapshot.val();
        message_StartChat(ownerUID, currentUID, adUID);
    };

    db_get(path, onSucess, message_ErrorFunction, message_ErrorFunction);
};

const message_StartChat = function(ownerUID, currentUID, adUID) {
    // Add message to users_message/ (BOTH USERS)
    // Add info to users_message/ (BOTH USERS)
    const addMessageToUser = function(userUID, messageUID)
    {
        rootRef.child('users_messages').child(userUID).child(messageUID).set(messageUID);  
    }

    // Create message in messages_last_info
    var createMessageLastInfo = function(messageUID, ad_uid, ad_title, ad_image) {
        console.log(4);
        const msgLastInfoPath = 'messages_last_info/' + messageUID;
        
        const dataToInsert = {
            "ad_uid": ad_uid,
            "ad_title": ad_title,
            "ad_image": ad_image,
            "content": "Nova mensagem",
            "timestamp": Date.now()
        };

        // Save message
        db_set(msgLastInfoPath, dataToInsert);

        addMessageToUser(ownerUID, messageUID);
        addMessageToUser(currentUID, messageUID);
        auth_RequireLoggingToAccess('message.html?uid=' + messageUID);
    }

    // Create message in messages
    var createMessageInMessage = function(snapshot) {
        var newMsgPath = 'messages/';
        const messageUID = db_GetNewPushKey(newMsgPath);
        newMsgPath = newMsgPath + messageUID;

        const adTitle = snapshot.val().title;
        const adImage = ad_GetFirstImageFromAdSlider();

        const dataToInsert = {
            "ad_uid": adUID,
            "ad_title": adTitle,
            "ad_image": adImage,
            "msgs": ""
        };
        
        // Save message
        db_set(newMsgPath, dataToInsert);
        createMessageLastInfo(messageUID, adUID, adTitle, adImage);
    };

    // Get Ad Data
    const adPath = 'ad/' + adUID;
    const onProductSearchSucess = function(snapshot) {
        createMessageInMessage(snapshot);
    };

    db_get(adPath, onProductSearchSucess, message_ErrorFunction, message_ErrorFunction);
}

const message_ErrorFunction = function(error) {
    misc_DisplayErrorMessage('Erro ao iniciar um chat', 'Favor tentar mais tarde');
};
///////////////////////////////// SEND MESSAGE  /////////////////////////////////

///////////////////////////////// CHAT DETAIL  /////////////////////////////////