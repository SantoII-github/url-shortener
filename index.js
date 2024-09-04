require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const dns = require('dns');
const URL = require('url').URL;
const { doesNotMatch } = require('assert');

mongoose.connect(process.env.MONGO_URL);

// Schema

const URLPairSchema = new mongoose.Schema({
  short_url: { type: String, required: true },
  original_url: { type: String, required: true }
});

const URLPair = mongoose.model("URLPair", URLPairSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST new Url Endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const urlObject = new URL(url);

  const dnslookup = dns.lookup(urlObject.hostname, 
    async (err, address, family) => {
      if (err) {
        res.json({ error: "invalid url"});
      } else {
        // Insert URL into DB
        const urlId = await URLPair.countDocuments({});
        const newEntry = new URLPair({ short_url: urlId, original_url: url});
        newEntry.save();
        res.json({ short_url: urlId, original_url: url});
      }
    })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = req.params.short_url;
  const URLPairDocument = await URLPair.findOne({ short_url: shorturl });
  res.redirect(URLPairDocument.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
