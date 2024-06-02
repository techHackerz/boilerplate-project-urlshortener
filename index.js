const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const urlRoutes = require('./routes/url')
const mongoose = require('mongoose');
require('dotenv').config();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', urlRoutes);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
