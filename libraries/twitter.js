var TwitterNode = require('twitter-node').TwitterNode

var TIMEZONES = {
    'Osaka': [34.6937398415059, 135.502181947231],
    'Tokyo': [35.6895, 139.69171],
    'Hawaii': [20.7502778, -156.5002778],
    'Sapporo': [43.064167, 141.346945],
    'Osaka': [34.6937398415059, 135.502181947231],
    'Irkutsk': [52.2977778, 104.2963889],
    'Pacific Time (US & Canada)': [40.7142691, -74.0059729]
};

var twitter = {
    HASHTAG: 'sdfkjdskjfdkb',

    tweets: [], // Our 'database' haha

    initialize: function (user, password) {
        twitter.twit = new TwitterNode({
                user: user,
                password: password
            })
            .addListener('tweet', function(tweet) {
                // Limits the tweets buffer to 1000 enttries
                if (twitter.tweets.length > 1000) {
                    twitter.tweets.shift();
                }

                // Tries to set a coordinate based on the user timezone
                if (tweet.place === null && tweet.coordinates === null && TIMEZONES[tweet.user.time_zone] !== undefined) {
                    tweet.coordinates = {
                        "type": "Point",
                        "coordinates": TIMEZONES[tweet.user.time_zone]
                    }
                }

                twitter.tweets.push({
                    text: tweet.text,
                    coordinates: tweet.coordinates,
                    place: tweet.place,
                    user_profile_image_url: tweet.user.profile_image_url,
                    user_screen_name: tweet.user.screen_name,
                    user_location: tweet.user.location,
                    user_time_zone: tweet.user.time_zone
                });
            })
            /*
            .addListener('limit', function(limit) {
                util.puts("LIMIT: " + util.inspect(limit));
            })
            .addListener('delete', function(del) {
                util.puts("DELETE: " + util.inspect(del));
            })
            .addListener('end', function(resp) {
                util.puts("wave goodbye... " + resp.statusCode);
            })
            */
            // Make sure you listen for errors, otherwise they are thrown
            .addListener('error', function(error) {
                console.log(error.message);
            });
    }
};

// Export module
module.exports.twitter = twitter;