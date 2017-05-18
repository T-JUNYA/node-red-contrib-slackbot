var Botkit = require('botkit');

module.exports = function(RED) {
    'use strict';

    function Node(n) {
      
        RED.nodes.createNode(this,n);

        var node = this;
        
        var slackbot = RED.nodes.getNode(n.slackbot);
        
        if (slackbot.bot_token) {
            
            node.controller = Botkit.slackbot({
                debug: false,
            });

            node.bot = this.controller.spawn({
                token: slackbot.bot_token
            }).startRTM();
            
        }

        node.controller.on('direct_message,direct_mention,mention',function(bot, message) {
            bot.api.users.info({user: message.user}, function(err, info){
                //check if it's the right user using info.user.name or info.user.id
                message["fromUser"] = info.user.name;
            })
            var msg = { 
                message: message,
                payload: message.text 
            };
            
            console.log(msg);
            
            node.send(msg);
        });
        
        node.on('close', function(done) {
            node.controller.shutdown();
            node.bot.closeRTM();
            done();
        });
    }

    RED.nodes.registerType('slackbot-listen', Node);
};
