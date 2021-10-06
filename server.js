const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;



app.use(express.static('assets'))
app.use(express.static('build'))
app.use(express.static('vendor'))
app.use(express.static('src'))
app.use(express.static(path.join(__dirname + '/assets')));
app.use(express.static(path.join(__dirname + '/build')));
app.use(express.static(path.join(__dirname + '/vendor')));
app.use(express.static(path.join(__dirname + '/src')));


// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port);
