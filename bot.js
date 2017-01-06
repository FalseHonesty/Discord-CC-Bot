var Discord = require("discord.js");
var request = require('request');
var cheerio = require('cheerio');
var bot = new Discord.Client();

var users = {}

var wordlist = {}

var lastSender;

bot.on("message", msg => {
    if (msg.content.startsWith("!") && (msg.channel.id == 266924688133849088 || msg.channel.type == "dm")) {
        if (msg.content == "!setup"){
        	if (msg.channel.type == "dm"){
	        	if (msg.author.id in users == false) {
	        		users[msg.author.id] = [msg.author, true, 0, false];
	        		console.log(users[msg.author.id][0]);
	        		msg.channel.sendMessage("Added to the user list!");
	        	} else {
	        		msg.channel.sendMessage("Already on the user list!");
	        	}
        	} else {
        		msg.channel.sendMessage("Please direct message me for this action.");
        	}
        }

        if (msg.content.startsWith("!words ")) {
        	var message = msg.content.slice(7);
        	var words;
        	if (message.startsWith("add ")) {
        		message = message.slice(4);
        		words = message.split(" ");
	        	for (var i = 0; i < words.length; i++) {
	        		var currentWord = words[i];
	        		var workingWord = wordlist[currentWord];
	        		if (!(currentWord in wordlist)) {
	        			wordlist[currentWord] = [];
	        		}
	        		wordlist[currentWord][wordlist[currentWord].length] = msg.author.id;
	        	}

	        msg.channel.sendMessage("Words added to your keyword list!");

	        }
        }

        if (msg.content == "!words") {
        	msg.channel.sendMessage("Type !words add <words> to add words to your keyword list. Seperate words by spaces. You can add names as well, such as FalseHonesty (Caps are important). These will be the words that will notify you if you select that setting.");
        }

        if (msg.content.startsWith("!notifs ")){
        	var message = msg.content;
        	message = message.slice(8);
        	if (message.startsWith("on")){
        		users[msg.author.id][1] = true;
        		msg.channel.sendMessage("Notifications turned on!");
        	} else if (message.startsWith("off")) {
        		users[msg.author.id][1] = false;
        		msg.channel.sendMessage("Notifications turned off!");
        	} else if (message.startsWith("all")) {
        		users[msg.author.id][2] = 0;
        		msg.channel.sendMessage("Notifications set to: All");
        	} else if (message.startsWith("keywords")) {
        		users[msg.author.id][2] = 1;
        		msg.channel.sendMessage("Notifications set to: Keywords Only (Includes Names)");
        	}
        }

        if (msg.content.startsWith("!notifs")) {
        	msg.channel.sendMessage("Type !notifs on to turn on notifications. \nType !notifs off to turn notifications off. \nType !notifs all to receive notification (when on) for all profile posts. \nType !notifs keywords to receive notifications for only your keywords and usernames. (Set these with !words)")
        }

        if (msg.content == "!help") {
        	msg.channel.sendMessage("Type !setup in a direct message to me to activate you as a user. \nType !words add <words> to add words to your keyword list. Just type !words for more help on that. \nType !notifs for notification options.");
        }
    }
});

bot.on('ready', () => {
  console.log('I am ready!');

  retrieveData();
  setInterval(retrieveData, 1000*30);
});

bot.login("MjY3MDA5MDE5MjUwNDc1MDA5.C1F_EQ.vsMcKDV7IfmyQca4TDg5KgIKCps");

function retrieveData(){
	request('https://cubecraft.net/forums', function (err,response,html) {
		if (!err && response.statusCode == 200){
			var $ = cheerio.load(html);
			$('blockquote.ugc').each(function (i, element){
				var el = $(this);
				if(el.parent().parent().parent().parent().attr("id") == lastSender){
					return false;
				}
				var prefix = "";
				var poster = el.parent().prev().children().first().text();
				prefix += poster + " said";
				if(el.parent().prev().children().length == 3){
					var receiver = el.parent().prev().children().last().text();
					prefix += " to " + receiver;
				}
				prefix += ": ";
				var product = prefix + "\"" + el.text() + "\"";

				sleep(1000);
				
				sendMessages(product, el.text(), poster, receiver);
			});

			
			lastSender = $('blockquote.ugc').first().parent().parent().parent().parent().attr("id");
			console.log("Ran!");
			
		}
	});
}

function sendMessages(product, useable, sender, receiver) {
	var searchWords = useable.split(" ");
	searchWords.push(sender);
	searchWords.push(receiver);
	var searchWord;

	for (var key in users){
		if (users[key][2] == 0 && users[key][1] == true) {
			users[key][0].dmChannel.sendMessage(product);
		}
	}

	for (var j = 0; j < searchWords.length; j++){
		searchWord = searchWords[j];
		if (searchWord in wordlist){
		    for (var i = 0; i < wordlist[searchWord].length; i++){
		        var searchID = wordlist[searchWord][i];
		        if(users[searchID][1] == true && users[searchID][3] == false && users[searchID][2] == 1){
		        	users[searchID][0].dmChannel.sendMessage(product);
		        	users[searchID][3] = true;
		        }
		    }
	    }
	}

	for (var key in users) {
		users[key][3] = false;
	}
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}