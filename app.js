const express = require('express'),
			mongoose = require('mongoose'),
			shortid = require('shortid'),
			validURL = require('valid-url'),
			app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'pug');

// load URL model
require('./models/URL');
const URL = mongoose.model('url');

// map global promise - get rid of warning
mongoose.Promise = global.Promise;

// mongodb connect
mongoose.connect('mongodb://fuzyon:1234@ds229465.mlab.com:29465/urlshortener', {
	useMongoClient: true
})
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.log(err));

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/:id', (req, res) => {
	var currentId = req.params.id,
			requestedURL = 'https://urlshortenerfuzyon.herokuapp.com/' + currentId;
	
	if (shortid.isValid(currentId)) {
		URL.findOne({short_url: requestedURL})
			 .then(url => {
				 res.redirect(url.original_url);
			 });
	}
});

app.get('/new/:url(*)', (req, res) => {
	var shortURL = 'https://urlshortenerfuzyon.herokuapp.com/',
			currentURL = req.params.url;
	
	if (validURL.isUri(currentURL)) {
		shortURL += shortid.generate();
	} else {
		res.send("The URL you've just entered isn't valid. The valid form is http://www.example.com.");
		return;
	}
	
	var newURL = new URL({
		original_url: currentURL,
		short_url: shortURL
	});
	
	newURL.save()
				.then(() => {
					res.json({
						original_url: currentURL,
						short_url: shortURL
					});
				});
});

app.listen(port);