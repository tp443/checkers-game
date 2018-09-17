/**
 * Server Side JavaScript with RESTful api handlers and middleware functions to get and post data between the client and server.
 */

// the module are declared as constant variables as as they remain constant all through the code and need not be changed.
const express = require('express');
const bodyParser = require('body-parser');
const model = require('./js/model');

// post to listen the serverside code on.
// used as localhost:9898 or 127.0.0.1:9898
const port = 9898;
const app = express();

// Global variables used in the main.js within the middleware functions.
var users = [];
var games = [];

var board;
var userID;
var maxID = 1;
var matchNumber = 1;

var countersX = 12;
var countersY = 12;

//Counters inplay. This means the person who starts is player "X"
var cInPlay = "X";
var cOpposition = "Y";
var kingPlayer;

var playerPlaying;
var playingWith;

var G1;
var P1;
var P2;
var currentPlayer;
var otherPlayer;

/**
 * This imports all of the static code of the game for use.
 */
app.use(bodyParser.json());
app.use('/', express.static('static'));

/**
 * POST /move - to get each updated move from the client side.
 * The move is stored as it is receved from the client into a new variable board.
 * both board and table are 2D arrays.
 */
app.post("/move", function (req, res) {
  board = req.body.table;
  res.end();
});

/**
 * GET /newtable - to send the updated move on the board 2D array every second as it is being called by the client pullData() every second.
 */
app.get("/newtable", function (req, res) {
  res.send(board);
});

/**
 * POST /userID - this receives the current userID from the client to make sure two users are playing together.
 */
app.post("/userID", (req, res) => {
  userID = req.body.myId
  res.end();
});


/**
 * GET /getUsers - this gets the users after the users list has been populated.
 */
app.get("/getUsers", (req, res) => {
  // Construct a JSON array
  let result = {
    'allUsers': []
  };
  // JSON.parse turns a JSON string into a JavaScript object
  // JSON.stringify does the opposite
  for (user of users) {
    result.allUsers.push(JSON.parse(user.toJSON()));
  }
  // end the response with code 200 and the correct object
  res.status(200).end(JSON.stringify(result));
});

/**
 * POST /addUser - to add every new user details entered into the HTML input tags and to populate the userInfo object in the model.js file
 */
app.post("/addUser", (req, res) => {
  let id = maxID++;
  jsonobj = req.body;
  jsonobj.id = id;
  jsonobj.availability = true;
  let user = new model.UserInfo(id, req.body.firstName, req.body.lastName, true);
  users.push(user);

  //Return the object with a response code of 200
  res.status(201).end(JSON.stringify(jsonobj))

});

/**
 * GET /refreshServer - this is called in the client.js to refresh the game on refresh button click or webpage refresh.
 * The board 2D array decalration in this middleware is used for the global variable board.
 */
app.get("/refreshServer", (req, res) => {
  countersX = 12;
  countersY = 12;
  board = [
    ["X", 0, "X", 0, "X", 0, "X", 0],
    [0, "X", 0, "X", 0, "X", 0, "X"],
    ["X", 0, "X", 0, "X", 0, "X", 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, "Y", 0, "Y", 0, "Y", 0, "Y"],
    ["Y", 0, "Y", 0, "Y", 0, "Y", 0],
    [0, "Y", 0, "Y", 0, "Y", 0, "Y"]
  ];
  res.end();
});

/**
 * POST /addGame - it adds a new game everytime more than 2 players login into the game.
 */
app.post("/addGame", (req, res) => {

  let boardId = matchNumber++;
  jsonobj = req.body;
  jsonobj.boardId = boardId;

  G1 = req.body.boardId;
  P1 = req.body.player1;
  P2 = req.body.player2;

  let game = new model.Game(boardId, P1, P2);
  games.push(game);

  res.status(201).end(JSON.stringify(jsonobj));
});

/**
 * POST /changeTurn - This gets whose turn it is from the client side when one player finishes their turn.
 */

app.post("/changeTurn", (req, res) => {
  cInPlay = req.body.counterInPlay;
  cOpposition = req.body.counterOpposition;
  kingPlayer = req.body.kingPlayer;
  res.end();
});

/**
 * GET /getTurn - This puts the variables into JSON objects and sends it back to the cliet to show whose turn it is.
 */

app.get("/getTurn", (req, res) => {
  //Make  JSON text
  var turn = '{"turn":[' +
    '{"playing": "' + cInPlay + '","opposition": "' + cOpposition + '","king": "' + kingPlayer + '","player1": "' + P1 + '" ,"player2": "' + P2 + '" }]}';
  //Convert string to object
  var obj = JSON.parse(turn);
  res.send(obj);
});

/**
 * POST /changePlayerName - this gets the 2 players playing with each other's name from the client side as soon as two people click on opposite player names.
 */
app.post("/changePlayerName", (req, res) => {
  playerPlaying = req.body.fullname;
  playingWith = req.body.person1;
  res.end();
});

/**
 * GET /changingPlayerName - This converts the variables from string into JSON objects and sends it back to the cliet to update against which player are we playing.
 */
app.get("/changingPlayerName", (req, res) => {
  //Make  JSON text
  var player = '{"player":[' +
    '{"player1": "' + playerPlaying + '","player2": "' + playingWith + '" }]}';
  //Convert string to object
  var obj = JSON.parse(player);
  res.send(obj);
})

/**
 * POST /numberCounters - This gets the number of counters for each player from the client side as soon as a player changes turn.
 */

app.post("/numberCounters", (req, res) => {
  countersX = req.body.countersX;
  countersY = req.body.countersY;
  res.end();
});

/**
 * GET /getNumberCounters - This converts the variables from string into JSON objects and sends it back to the client to update how many counters each player has.
 */

app.get("/getNumberCounters", (req, res) => {
  //Make  JSON text
  var counters = '{"player":[' +
    '{"xCounters": "' + countersX + '","yCounters": "' + countersY + '" }]}';
  //Convert string to object
  var obj = JSON.parse(counters);
  res.send(obj);
})


/**
 * pushing all the api calls to the set port to interact with the client and server.
 */
app.listen(port, () => console.log(`Listening on port ${port}`));
