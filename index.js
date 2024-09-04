require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const dns = require('dns');
const urlparser = require('url');
const { doesNotMatch } = require('assert');

mongoose.connect(process.env.MONGO_URL);

// Schema

const URLPairSchema = new mongoose.Schema({
  shorturl: { type: String, required: true },
  original_url: { type: String, required: true }
});

const URLPair = mongoose.model("URLPair", URLPairSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Handle POST new Url
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;

  const dnslookup = dns.lookup(urlparser.parse(url).hostname, 
    async (err, address) => {
      if (!address) {
        res.json({ error: 'invalid url'});
      } else {
        // Insert URL into DB
        const urlId = await URLPair.countDocuments({});
        const newEntry = new URLPair({ shorturl: urlId, original_url: url});
        console.log(newEntry);
        newEntry.save();
      }
    })
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
