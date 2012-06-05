var TwitterNode = require('twitter-node').TwitterNode

var TIMEZONES = {
    'Osaka': [34.6937398415059, 135.502181947231],
    'Tokyo': [35.6895, 139.69171],
    'Hawaii': [20.7502778, -156.5002778],
    'Sapporo': [43.064167, 141.346945],
    'Osaka': [34.6937398415059, 135.502181947231],
    'Irkutsk': [52.2977778, 104.2963889],
    'Brasilia': [-15.77972, -47.92972],
    'London': [51.5085287758629, -0.125741958618164],
    'Alaska': [64.0002778, -150.0002778],
    'Santiago': [-33.456937736669424, -70.64826965332031],
    'Paris': [48.85341, 2.3488],
    'Amsterdam': [52.3740272046208, 4.88968849182129],
    'Pacific Time (US & Canada)': [34.0522342, -118.2436849],  // Los Angeles
    'Central Time (US & Canada)': [28.7505408, -82.5000976],  // Florida
    'Eastern Time (US & Canada)': [40.7142691, -74.0059729],  // New York
    'Mountain Time (US & Canada)': [39.7391536, -104.9847034]  // Denver
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
                if (tweet.place === null && tweet.coordinates === null) {

                    if (TIMEZONES[tweet.user.time_zone] !== undefined) {
                        tweet.coordinates = {
                            "type": "Point",
                            "coordinates": TIMEZONES[tweet.user.time_zone]
                        };
                    } else {
                        // Ignores tweets without a location
                        return;
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