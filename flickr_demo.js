var Flickr = require('flickr').Flickr;
var flickr = new Flickr(process.env.FLICKR_KEY, process.env.FLICKR_SECRET);

var flickr_params = {
    text: "soccer",
    media: "photos",
    per_page: 25,
    page: 1,
    extras: "url_q, url_z, url_b, owner_name"
};

flickr.executeAPIRequest("flickr.photos.search", flickr_params, false, function(err, result) {
  // Show the error if we got one
  if(err) {
    console.log("FLICKR ERROR: " + err);
    return;
  }

  // Do something with flicker photos
  console.log(result.photos);
});

// clone down your repo
// add .env and DS_Store to .gitignore
// install foreman
// touch .env
// add keys to .env (FLICKR_KEY=1234567890, FLICKR_SECRET=12345, no commas, quotes, or semicolons)
// foreman run node something.js
// foreman run nodemon