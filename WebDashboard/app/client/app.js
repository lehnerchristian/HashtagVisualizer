let app = angular.module("HashtagVisualizer", ["ngResource"]);

class APIFactory {
  constructor($resource, $q) {
    this.$resource = $resource;
    this.$q = $q;
  }

  getTweets() {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/tweets");
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  getTimeline() {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/timeline");
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  static createClass($resource, $q) {
    return new APIFactory($resource, $q)
  }
}

class MapController {
  constructor(APIFactory) {
    this.APIFactory = APIFactory;
    this.map = L.map('map').fitWorld();

    L.Icon.Default.imagePath = "./";

    L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.cssIconBlue = L.divIcon({
      className: 'css-icon-blue',
      iconSize: [10, 10]
    });

    this.cssIconYellow = L.divIcon({
      className: 'css-icon-yellow',
      iconSize: [10, 10]
    });

    this.cssIconPurple = L.divIcon({
      className: 'css-icon-purple',
      iconSize: [10, 10]
    });

    this.getTweets();

  }

  getTweets() {
    let promise = this.APIFactory.getTweets();

    let self = this;
    promise.then(function(tweets) {
      for(let tweet of tweets) {
        if (tweet.value.text.toLowerCase().search("charliehebdo") > 0) {
          if (tweet.value.text.toLowerCase().search("jesuischarlie") > 0) {
            L.marker([tweet.value.latitude, tweet.value.longitude], {icon: self.cssIconPurple}).addTo(self.map).bindPopup('<b>Message: </b>' + tweet.value.text + '<br><b>Timestamp: </b>' + tweet.value.created_at);
          }
          else {
            L.marker([tweet.value.latitude, tweet.value.longitude], {icon: self.cssIconBlue}).addTo(self.map).bindPopup('<b>Message: </b>' + tweet.value.text + '<br><b>Timestamp: </b>' + tweet.value.created_at);
          }
        }
        else if (tweet.value.text.toLowerCase().search("jesuischarlie") > 0) {
          L.marker([tweet.value.latitude, tweet.value.longitude], {icon: self.cssIconYellow}).addTo(self.map).bindPopup('<b>Message: </b>' + tweet.value.text + '<br><b>Timestamp: </b>' + tweet.value.created_at);
        }
      }      
    });


  }
}

class TimelineController{
  constructor(APIFactory){
    this.APIFactory = APIFactory;
    this.chart = c3.generate(
    {
      bindto: '#timeline',
      data: {
        x: 'x',
        columns: [
          ['x']
        ]
      }//,
      // axis: {
      //   x: {
      //       type: 'timeseries',
      //       tick: {
      //           format: '%Y-%m-%d'
      //       }
      //   }
      // }
    });

    this.getTimeline();
  }

  getTimeline() {
    console.log("i'm here!");
    let promise = this.APIFactory.getTimeline();

    let self = this;
    promise.then(function(tweets) {
      console.log(tweets);
      
      let hours = [];
      let tweetCount = [];

      hours.push('x');
      tweetCount.push('Time');

      for(let time of tweets) {
        console.log(time);
        hours.push(time._id.hour);
        tweetCount.push(time.total);
      }

      console.log(hours);
      console.log(tweetCount);
      self.chart.load(
        {
          columns: [
            hours,
            tweetCount
          ]
        });
    });
  }

}

APIFactory.createClass.$inject = ["$resource", "$q"];

app.factory("APIFactory", APIFactory.createClass);
app.controller("MapController", ["APIFactory", MapController]);
app.controller("TimelineController", ["APIFactory", TimelineController]);