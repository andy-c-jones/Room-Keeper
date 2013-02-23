var autowoot;
var autoqueue;
var hideVideo;
var userList;

var COOKIE_WOOT = 'autowoot';
var COOKIE_QUEUE = 'autoqueue';
var COOKIE_HIDE_VIDEO = 'hidevideo';
var COOKIE_USERLIST = 'userlist';

var MAX_USERS_WAITLIST = 50;

function initAPIListeners() {
    API.addEventListener(API.DJ_ADVANCE, djAdvanced);

    API.addEventListener(API.WAIT_LIST_UPDATE, queueUpdate);

    API.addEventListener(API.DJ_UPDATE, queueUpdate);

    API.addEventListener(API.VOTE_UPDATE, function (obj) {
        if (userList) {
            populateUserlist();
        }
		
		var mehToUserRatio = (score.negative / API.getUsers().length);
		if(mehToUserRatio > parseFloat("0.49"))
		{
			var djs = API.getDJs();
			API.sendChat('It turns out that many people do not like this song. Sorry ' + djs[0].username + '. Trying picking something more popular next time.');
			API.moderateForceSkip();
		}
    });
	

			
    API.addEventListener(API.USER_JOIN, function (user) {
        if (userList) {
            populateUserlist();
        }
		API.sendChat('Welcome ' + user.username + ', have an enjoyable stay! I am a bot. The room is automated, if you dont like a song then vote meh and if enough people agree then the song will be skipped');
    });

    API.addEventListener(API.USER_LEAVE, function (user) {
        if (userList) {
            populateUserlist();
        }
    });
}

function displayUI() {
    $('#aj-ui').remove();

    $('#chat').prepend('<div id="aj-ui"></div>');
    var cWoot = autowoot ? "#FFFFFF" : "#858585";
    var cQueue = autoqueue ? "#FFFFFF" : "#858585";
    var cHideVideo = hideVideo ? "#FFFFFF" : "#858585";
    var cUserList = userList ? "#FFFFFF" : "#858585";
    $('#aj-ui').append(
        '<p id="AJ-wootbtn" style="color:' 
  	+ cWoot + '">auto w00ting</p><p id="AJ-autoqueuebtn" style="color:' 
		+ cQueue + '">auto-queue</p><p id="aj-hidevideobtn" style="color:' 
		+ cHideVideo + '">hide video</p><p id="aj-userlistbtn" style="color:' 
		+ cUserList + '">userlist</p>');
}

function initUIListeners() {
    $("#aj-userlistbtn").on("click", function () {
        userList = !userList;
        $(this).css("color", userList ? "#FFFFFF" : "#858585");
        $("#aj-userlist").css("visibility", userList ? ("visible") : ("hidden"));
        if (!userList) {
            $("#aj-userlist").empty();
        } else {
            populateUserlist();
        }
        jaaulde.utils.cookies.set(COOKIE_USERLIST, userList);
    });

    $("#AJ-wootbtn").on("click", function () {
        autowoot = !autowoot;
        $(this).css("color", autowoot ? "#FFFFFF" : "#858585");
        if (autowoot) {
            $("#button-vote-positive").click();
        }
        jaaulde.utils.cookies.set(COOKIE_WOOT, autowoot);
    });

    $("#aj-hidevideobtn").on("click", function () {
        hideVideo = !hideVideo;
        $(this).css("color", hideVideo ? "#FFFFFF" : "#858585");
        $("#yt-frame").animate({
            "height": (hideVideo ? "0px" : "271px")
        }, {
            duration: "fast"
        });
        $("#playback .frame-background").animate({
            "opacity": (hideVideo ? "0" : "0.91")
        }, {
            duration: "medium"
        });
        jaaulde.utils.cookies.set(COOKIE_HIDE_VIDEO, hideVideo);
    });

    $("#AJ-autoqueuebtn").on("click", function () {
        autoqueue = !autoqueue;
        $(this).css("color", autoqueue ? "#FFFFFF" : "#858585");
        if (autoqueue && !isInQueue()) {
            joinQueueIfEmpty();
        }
        jaaulde.utils.cookies.set(COOKIE_QUEUE, autoqueue);
    });
}

function djAdvanced(obj) {
    if (hideVideo) {
        $("#yt-frame").css("height", "0px");
        $("#playback .frame-background").css("opacity", "0.0");
    }

    if (autowoot) {
        $("#button-vote-positive").click();
    }

    if (userList) {
        populateUserlist();
    }
}

function queueUpdate() {
    if (autoqueue && !isInQueue()) {
        joinQueueIfEmpty();
    }
}

function isInQueue() {
    var self = API.getSelf();
    return API.getWaitList().indexOf(self) !== -1 || API.getDJs().indexOf(self) !== -1;
}

function joinQueueIfEmpty() {
	var waitList = API.getDJs();
	if (waitList.length < 2) {
        $("#button-dj-play").click();
    }
}


function populateUserlist() {
    $('#aj-userlist').html(' ');

    $('#aj-userlist').append('<h1 style="text-indent:12px;color:#42A5DC;font-size:14px;font-variant:small-caps;">Users: ' + API.getUsers().length + '</h1>');

    if ($('#button-dj-waitlist-view').attr('title') !== '') {
        if ($('#button-dj-waitlist-leave').css('display') === 'block' && ($.inArray(API.getDJs(), API.getSelf()) == -1)) {
            var spot = $('#button-dj-waitlist-view').attr('title').split('(')[1];
            spot = spot.substring(0, spot.indexOf(')'));
            $('#aj-userlist').append('<h1 id="aj-queue"><span style="font-variant:small-caps">Waitlist:</span> ' + spot + '</h3><br />');
        }
    }

    var users = new Array();

    for (user in API.getUsers()) {
        users.push(API.getUsers()[user]);
    }

    for (user in users) {
        var user = users[user];
        appendUser(user);
    }
}

function appendUser(user) {
    var username = user.username;
    var permission = user.permission;

    if (user.admin) {
        permission = 99;
    }

    var userType;
    switch (permission) {
        case 0:
			// Normal user
            userType = 'normal';
            break;
        case 1:
            // Featured DJ
            userType = 'featured';
            break;
        case 2:
            // Bouncer
            userType = 'bouncer';
            break;
        case 3:
            // Manager
            userType = 'manager';
            break;
        case 4:
        case 5:
            // Co-host
            userType = 'host';
            break;
        case 99:
            // Admin
            userType = 'admin';
            break;
    }

    if (API.getDJs()[0].username == username) {
        if (userType === 'normal') {
            drawUserlistItem('#42A5DC', username);
        } else {
            drawUserlistItem('#42A5DC', username);
        }
    } else if (userType === 'normal') {
        drawUserlistItem(colorByVote(user.vote), username);
    } else {
        drawUserlistItem(colorByVote(user.vote), username);
    }
}

function colorByVote(vote) {
    if (!vote) {
        return '#fff';
    }
    switch (vote) {
        case -1:
            return '#c8303d';
        case 0:
            return '#fff';
        case 1:
            return '#c2e320';
    }
}

function drawUserlistItem(color, username) {
    $('#aj-userlist').append(
        '<p style="cursor:pointer;' + 'color:' + color + ';' + ((API.getDJs()[0].username == username) ? 'font-size:15px;font-weight:bold;' : '') + '" onclick="$(\'#chat-input-field\').val($(\'#chat-input-field\').val() + \'@' + username + ' \').focus();">' + username + '</p>');
}

//INITILISATION
$('#aj-userlist').remove();
$('#aj-css').remove();
$('#roomkeeper-js').remove();

var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'http://cookies.googlecode.com/svn/trunk/jaaulde.cookies.js';
script.onreadystatechange = function () {
    if (this.readyState == 'complete') {
        readCookies();
    }
}
script.onload = readCookies;
head.appendChild(script);

function readCookies() {
    var currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 1); //Cookies expire after 1 year
    var newOptions = {
        expiresAt: currentDate
    }
    jaaulde.utils.cookies.setOptions(newOptions);

    var value = jaaulde.utils.cookies.get(COOKIE_WOOT);
    autowoot = value != null ? value : true;

    value = jaaulde.utils.cookies.get(COOKIE_QUEUE);
    autoqueue = value != null ? value : false;

    value = jaaulde.utils.cookies.get(COOKIE_HIDE_VIDEO);
    hideVideo = value != null ? value : false;

    value = jaaulde.utils.cookies.get(COOKIE_USERLIST);
    userList = value != null ? value : true;

    onCookiesLoaded();
}

$('body').prepend('<style type="text/css" id="aj-css">#aj-ui { position: absolute; margin-left: 349px; }#aj-ui p { background-color: #0b0b0b; height: 32px; padding-top: 8px; padding-left: 8px; cursor: pointer; font-variant: small-caps; width: 84px; font-size: 15px; margin: 0; }#aj-ui h2 { background-color: #0b0b0b; height: 112px; width: 156px; margin: 0; color: #fff; font-size: 13px; font-variant: small-caps; padding: 8px 0 0 12px; border-top: 1px dotted #292929; }#aj-userlist { border: 6px solid rgba(10, 10, 10, 0.8); border-left: 0 !important; background-color: #000000; padding: 8px 0px 20px 0px; width: 12%; }#aj-userlist p { margin: 0; padding-top: 4px; text-indent: 24px; font-size: 10px; }#aj-userlist p:first-child { padding-top: 0px !important; }#aj-queue { color: #42A5DC; text-align: left; font-size: 15px; margin-left: 8px }');
$('body').append('<div id="aj-userlist"></div>');

function onCookiesLoaded() {
    if (autowoot) {
        $("#button-vote-positive").click();
    }

    if (autoqueue && !isInQueue()) {
        joinQueueIfEmpty();
    }

    if (hideVideo) {
        $("#yt-frame").animate({
            "height": (hideVideo ? "0px" : "271px")
        }, {
            duration: "fast"
        });
        $("#playback .frame-background").animate({
            "opacity": (hideVideo ? "0" : "0.91")
        }, {
            duration: "medium"
        });
    }

    if (userList) {
        populateUserlist();
    }

    initAPIListeners();
    displayUI();
    initUIListeners();
}
