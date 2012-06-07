var twitter = require('twitter');
var util = require('util');
var CONFIG = require('../config').config;

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
    'Mountain Time (US & Canada)': [39.7391536, -104.9847034],  // Denver
    'Atlantic Time (Canada)': [44.6460020778029, -63.57333183288574],  // Halifax
    'Arizona': [34.5003037, -111.5009764],
    'Berlin': [52.524368165134284, 13.410530090332031],
    'Brussels': [50.8504450552593, 4.34878349304199],
    'Buenos Aires': [-34.6131488101425, -58.3772277832031],
    'Caracas': [10.488011, -66.879193],
    'Casablanca': [33.58831134490155, -7.611379623413086],
    'Greenland': [72, -40],
    'Jakarta': [-6.214623197035775, 106.84513092041016],
    'Lima': [-12.0431818993027, -77.0282363891602],
    'Melbourne': [-37.8139965641595, 144.963322877884],
    'Newfoundland': [52, -56],
    'Quito': [-0.2298539672002563, -78.52495193481445],
    'Riyadh': [24.68773227003775, 46.72184944152832],
    'Saskatchewan': [54.000102714, -106.00099262],
    'Singapore': [1.3666667, 103.8],
    'Sydney': [-33.8678499639382, 151.207323074341],
    'Athens': [37.9794539330762, 23.7162208557129],
    'Baghdad': [33.340582, 44.400876],
    'Bangkok': [13.753979, 100.501444],
    'Bogota': [4.609705849789108, -74.08175468444824],
    'Brisbane': [-27.4679357321901, 153.028092384338],
    'Cairo': [30.06263141517916, 31.249666213989258],
    'Copenhagen': [55.6759389272801, 12.5655269622803],
    'Dublin': [53.333056, -6.248889],
    'Hong Kong': [22.2855225817732, 114.157691001892],
    'Istanbul': [41.0138429552247, 28.9496612548828],
    'Karanchi': [24.9056, 67.0822],
    'Kuala Lumpur': [3.14120171804761, 101.686534881592],
    'Kyiv': [50.4546624398828, 30.523796081543],
    'Lisbon': [38.7166667, -9.1333333],
    'Madrid': [40.4165020941502, -3.70256423950195],
    'New Delhi': [28.635760131498763, 77.22444534301758],
    'Perth': [-31.95224, 115.861397],
    'Seoul': [37.5682561388953, 126.977834701538],
    'Stockholm': [59.3325765361753, 18.0649030208588],
    "Taipei": [25.047763, 121.531846],
    "Kabul": [34.52812640463504, 69.17232513427734],
    'Indiana (East)': [39.7683765, -86.1580423],
    'International Date Line West': [0.810214695377615, -176.61732673645],  // Howland Island? lol
    'Central America': [12.13281653939173, -86.25040054321289],
    'West Central Africa': [-4.321420378994415, 15.308074951171875],
    "Adelaide": [-34.928661, 138.598633],
    "Almaty": [43.25, 76.95],
    "Auckland": [-36.8666667, 174.7666667],
    "Azores": [37.7405847888583, -25.6728172302246],
    "Beijing": [39.9074977414405, 116.397228240967],
    "Belgrade": [44.8040064347669, 20.4651260375977],
    "Berne": [46.9480943365053, 7.44744300842285],
    "Bratislava": [48.1481640391485, 17.1067428588867],
    "Bucharest": [44.43224761932805, 26.10626220703125],
    "Budapest": [47.4980099893041, 19.0399074554443],
    "Canberra": [-35.2834624726481, 149.128074645996],
    "Cape Verde Is.": [16, -24],
    "Chennai": [13.0878385345075, 80.2784729003906],
    "Chihuahua": [28.6333333, -106.0833333],
    "Chongqing": [29.5627778, 106.5527778],
    "Dhaka": [23.710395616597037, 90.40743827819824],
    "Edinburgh": [55.9520598864937, -3.19648118727903],
    "Ekaterinburg": [56.8575, 60.6125],
    "Fiji": [-18, 178],
    "Georgetown": [6.804483851419782, -58.155269622802734],
    "Guadalajara": [20.6666667, -103.3333333],
    "Hanoi": [21.02450477127423, 105.8411693572998],
    "Hobart": [-42.87936056387943, 147.32940673828125],
    "Islamabad": [33.7214841359228, 73.0432891845703],
    "Karanchi": [24.9056, 67.0822],
    "Kathmandu": [27.701691866145573, 85.32059669494629],
    "Kolkata": [22.5697222, 88.3697222],
    "Kuwait": [29.5, 47.75],
    "La Paz": [-16.5, -68.15],
    "Mazatlan": [23.2166667, -106.4166667],
    "Monrovia": [6.300539726631287, -10.796899795532227],
    "Monterrey": [25.6666667, -100.3166667],
    "Moscow": [55.7522222, 37.6155556],
    "Mumbai": [19.07282592774, 72.88261413574219],
    "Muscat": [23.613874, 58.5922],
    "Nairobi": [-1.2833333, 36.8166667],
    "New Caledonia": [-21.5, 165.5],
    "Nuku'alofa": [-21.133333, -175.2],
    "Prague": [50.0880428938909, 14.4207572937012],
    "Pretoria": [-25.7448585818122, 28.1878280639648],
    "Rome": [41.8947384616695, 12.4839019775391],
    "Samoa": [-13.803096, -172.178309],
    "Skopje": [42, 21.4333333],
    "Sofia": [42.6975135281805, 23.324146270752],
    "Sri Jayawardenepura": [6.9027778, 79.9083333],
    "Tashkent": [41.26464643600054, 69.21627044677734],
    "Tehran": [35.6943887761439, 51.4215087890625],
    "Tijuana": [32.5333333, -117.0166667],
    "Ulaan Bataar": [47.9077125688913, 106.883239746094],
    "Vilnius": [54.6891637114677, 25.2797985076904],
    "Warsaw": [52.2297708747018, 21.0117816925049],
    "Wellington": [-41.2866428425807, 174.77557182312],
    "Yerevan": [40.1811111, 44.5136111],
    "Zagreb": [45.8144436673781, 15.9779834747314],
    "Mid-Atlantic": [64.1354756236931, -21.8954086303711],
    "Sao Paulo": [-23.5475, -46.63611111],
    "Rio de Janeiro": [-22.90277778, -43.2075],
    "Curitiba": [-25.42777778, -49.27305556],
    'Mexico City': [19.428472427036, -99.12766456604]
};

var TWIT = {
    stream: undefined,

    // Our 'database' haha
    tweets: {},

    random: function (items) {
        return items[Math.floor(Math.random()*items.length)];
    },

    start_stream: function (hashtag_list) {
        console.log('Tracking start: ', hashtag_list);

        // Setups the database
        hashtag_list.forEach(function (hashtag) {
            TWIT.tweets[hashtag] = [];
        });

        new twitter({
                consumer_key: CONFIG.consumer_key,
                consumer_secret: CONFIG.consumer_secret,
                access_token_key: CONFIG.access_token_key,
                access_token_secret: CONFIG.access_token_secret
            })
            .search('@capricho', {rpp: 30, include_entities: true}, function (data) {
                data.results.forEach(function (tweet) {
                    TWIT.tweets.capricho.push({
                        id: tweet.id,
                        text: tweet.text,
                        coordinates: {
                            'type': 'Point',
                            'coordinates': TIMEZONES[TWIT.random(['Brasilia', 'Santiago', 'Curitiba', 'Sao Paulo', 'Rio de Janeiro'])],
                        },
                        user_profile_image_url: tweet.profile_image_url,
                        user_screen_name: tweet.from_user,
                        user_location: '',
                        user_time_zone: ''
                    });
                });
            })
            .search('hatsune', {rpp: 30, include_entities: true}, function (data) {
                data.results.forEach(function (tweet) {
                    TWIT.tweets.hatsune.push({
                        id: tweet.id,
                        text: tweet.text,
                        coordinates: {
                            'type': 'Point',
                            'coordinates': TIMEZONES[TWIT.random(['Osaka', 'Tokyo', 'Hawaii', 'Sapporo', 'London', 'Sao Paulo', 'Lisbon'])],
                        },
                        user_profile_image_url: tweet.profile_image_url,
                        user_screen_name: tweet.from_user,
                        user_location: '',
                        user_time_zone: ''
                    });
                });
            })
            .stream(
                'statuses/filter', {
                    track: [hashtag_list.map(function (h) {return h === 'capricho' ? '@capricho' : h;}).join(',')]
                },
                function(stream) {
                    TWIT.stream = stream;

                    stream.on('data', function(tweet) {
                        if (tweet.delete !== undefined) {
                            return;
                        }

                        hashtag_list
                            .filter(function (hashtag) {
                                return tweet.text.toLowerCase().search(hashtag.toLowerCase()) !== -1;
                            })
                            .forEach(function (hashtag) {
                                // Limits the tweets buffer to 1000 enttries
                                if (TWIT.tweets[hashtag].length > 100) {
                                    TWIT.tweets[hashtag].shift();
                                }

                                // Tries to set a coordinate based on the user timezone
                                if (tweet.coordinates === null) {
                                    if (TIMEZONES[tweet.user.time_zone] !== undefined) {
                                        tweet.coordinates = {
                                            'type': 'Point',
                                            'coordinates': TIMEZONES[tweet.user.time_zone]
                                        };
                                    } else {
                                        // Ignores tweets without a location
                                        // if (tweet.user.time_zone !== null) {
                                        //     console.log(tweet.user.time_zone);
                                        // }
                                        return;
                                    }
                                }

                                TWIT.tweets[hashtag].push({
                                    id: tweet.id,
                                    text: tweet.text,
                                    coordinates: tweet.coordinates,
                                    user_profile_image_url: tweet.user.profile_image_url,
                                    user_screen_name: tweet.user.screen_name,
                                    user_location: tweet.user.location,
                                    user_time_zone: tweet.user.time_zone
                                });
                            });
                    })
                    .on('error', function (error) {
                        console.log('Twitter error:', error);
                        setTimeout(function () {
                            TWIT.start_stream(hashtag_list);
                        }, 4000);
                    });
                });
    }
};


// Export module
module.exports.twit = TWIT;