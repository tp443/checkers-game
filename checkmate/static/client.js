/**
 * Main JS file static -> clientside of the Checkers game
 */

/**
 * Global variables for the client side.
 */
var myId;
var fn;

//counterInPlay Variables
var player1ID;
var player2ID;
var counterInPlay;
var counterOpposition;

var kingPlayer;
var countersX;
var countersY;

// Flag variable
var click = 0;

// Counters and selectors
var selectedX = 10;
var selectedY = 10;
var commitment = 0;
var doubleTakeIndicator = 0;
var doubleTakeLocation = 0;


/**
 * the Board for the game has been declared as a 2D array to map each move made by different checkers
 */
var table = [
  ["X", 0, "X", 0, "X", 0, "X", 0],
  [0, "X", 0, "X", 0, "X", 0, "X"],
  ["X", 0, "X", 0, "X", 0, "X", 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, "Y", 0, "Y", 0, "Y", 0, "Y"],
  ["Y", 0, "Y", 0, "Y", 0, "Y", 0],
  [0, "Y", 0, "Y", 0, "Y", 0, "Y"]
];


/**
 * This function runs once index.html is ready.
 */
$(document).ready(function () {
  refreshServer();

  /**
   * This timer function has been set to pull data
   * from the server every second irrespective of any change made on the client side while playing the game.
   */
  setInterval(function () {
    pullData();
    pullName();
    refreshList();
  }, 1000);

  $(`#login`).click(addUser);
  $(`#listOfUsers, .gamePlay, .gameOver`).hide();

  $(`#restart`).click(refreshServer);

  $(`#quit`).click(endGame);
})


/**
 * Intake of User Name input and hides all the other divs
 */
$(`#login`).click(function () {
  $(`#logo, #userLogin`).hide();
  $(`#listOfUsers`).show();

  /**
   * Local variables to store the input value of the Names by the user
   */
  var fn = $(`#firstNameInput`).val();
  var ln = $(`#lastNameInput`).val();
  var ff = fn + " " + ln;
  localStorage.setItem(`fullname`, ff);
});


/**
 * @function refreshServer - to refresh the game
 */
function refreshServer() {

  //Api call to the server to refresh the game and reset all values once refresh button is clicked
  // or web page is refreshed.
  fetch('/refreshServer')
    .catch(err => console.log(err));

  counterInPlay = "X";
  counterOpposition = "Y";
  kingPlayer;
  countersX = 12;
  countersY = 12;
  selectedX = 10;
  selectedY = 10;
  commitment = 0;
  doubleTakeIndicator = 0;
  doubleTakeLocation = 0;

  $(`#checkersBoard`).show(1000);
  $(`.gameOver`).hide(1000);
}

/**
 * @function turnOppostionCountersOff - disables oppostion counters so that the player can only make moves with thier counters
 */

function turnOppostionCountersOff() {
  // If player is player 1, they are counter X. Therefore need to disable Y counters.
  if (myId == player1ID) {
    $(`#assignCounter`).off().html(`You are counter: "X"`)
    $(`input[type="button"][value="YY"]`).prop(`disabled`, true)
    $(`input[type="button"][value="Y"]`).prop(`disabled`, true)
    $(`input[type="button"][value="XX"]`).prop(`disabled`, false)
    $(`input[type="button"][value="X"]`).prop(`disabled`, false)
    $(`input[type="button"][value="  "]`).prop(`disabled`, false)

    // If player is player 2, they are counter Y. Therefore need to disable X counters.
  } else if (myId == player2ID) {
    $(`#assignCounter`).off().html(`You are counter: "Y"`)
    $(`input[type="button"][value="XX"]`).prop(`disabled`, true)
    $(`input[type="button"][value="X"]`).prop(`disabled`, true)
    $(`input[type="button"][value="YY"]`).prop(`disabled`, false)
    $(`input[type="button"][value="Y"]`).prop(`disabled`, false)
    $(`input[type="button"][value="  "]`).prop(`disabled`, false)
  }
}

/**
 * @function move - Function is activated when the user clicks on a checker.
 */

function move(x, y) {
  var moveChoice = [y, x]
  /**
   * 1. If the player is making a move on a piece for the 1st time. i.e not going for second jump
   */
  if (($('#b' + x + y).val() == counterInPlay || selectedX != 10 || ($('#b' + x + y).val() == kingPlayer)) && doubleTakeIndicator == 0) {
    //Prevent double clicking
    click++;
    if (click === 1) {
      /**
       * i. Choosing piece to play with.
       * Nothing is selected and the player makes their first choice
       */
      if ((selectedX == 10) && (selectedY == 10)) {
        if (table[y][x] == counterInPlay || table[y][x] == kingPlayer) { //Selected one of thier pieces
          selectedX = x;
          selectedY = y;
          //Recognises they made a choice
          commitment++;
          counterInPlay.concat(counterInPlay)
        }
      }
      //player changes there mind and chooses another one of thier pieces
      else if (commitment > 0 && $('#b' + x + y).val() == counterInPlay) {
        //Reset all colours from previous click
        $('.even').css({
          'background': 'lightblue'
        })
        selectedX = x;
        selectedY = y;
      }
      /**
       *   ii. Seeing valid moves avaible on the board. Valid moves are returnd in an array
       */
      var potentialMoves = locationOfSuroundings(selectedY, selectedX, 1)

      /**
       *  iii. Reject or accept players wish to move piece. If accepted:move piece
       */
      var move = validMoveChecker(moveChoice, potentialMoves)
      // Player clicks on a piece that is blank and want to change piece.
      if (move == "valid") {
        jumpingPlayer(y, x)
      }
      click--
    }
  }

  /**
   *   2. If player is making a move on a piece for the 2nd time. i.e second take is on
   */
  else {
    click++;
    var move = validMoveChecker(moveChoice, doubleTakeLocation)
    if (move == "valid") {
      doubleTakeIndicator--
      jumpingPlayer(y, x);
    }
    click--
  }
}


/**
 * @function jumpingPlayer - Moving piece from previous location (selected x/y) to new desired location (x/y)
 */


function jumpingPlayer(y, x) {
  // Defining if this new move makes it a king
  kingPlayer = counterInPlay.concat(counterInPlay)
  //Create an XX king
  if (counterInPlay == "X" && y == 7) {
    $('#b' + x + y).off().val(kingPlayer)
    table[y][x] = kingPlayer;
    //Create a YY king
  } else if (counterInPlay == "Y" && y == 0) {
    $('#b' + x + y).off().val(kingPlayer)
    table[y][x] = kingPlayer;
  } else {
    //Not a king
    //Changes table layout
    table[y][x] = table[selectedY][selectedX];
    //Changes Display
    $('#b' + x + y).val($('#b' + selectedX + selectedY).val())
  }

  //Changes the previous location value to blank
  $('#b' + selectedX + selectedY).off().val("  ")
  table[selectedY][selectedX] = 0;

  //takePlayer will see if a piece was taken in the move. Will also check if second overtake is on
  //Returns a statement saying if the second overtake is on
  var secondOvertake = takePlayer(selectedY, selectedX, y, x)
  //If no double overtake is on: move is ended and the counterInPlay is changed
  if (doubleTakeIndicator == 0) {
    changePlayer();
    resetTurn();
    // If not, the values are switched and the the tiles are active for another click.
  } else {
    selectedY = y;
    selectedX = x;
  }

  //Send updated table to the server
  fetch('/move', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        table
      })
    })
    .catch(err => console.log(err));

}

/**
 * @function takePlayer - If a player is overtaken the taken piece will be removed
 */

function takePlayer(oldy, oldx, newy, newx) {
  //Reset colours
  $('.even').css({
    'background': 'lightblue'
  })
  // change multiplier if it is a y value to signify different direction of movement
  var multiplier = 1;
  if (counterInPlay == "Y" && $('#b' + newx + newy).val() != kingPlayer) {
    multiplier = -1;
  }

  //See if a piece was taken
  if ((newy - oldy) == 2 || (newy - oldy) == -2) {
    takenY = ((newy - oldy) / 2) + oldy;
    takenX = ((newx - oldx) / 2) + oldx;
    table[takenY][takenX] = 0;

    //Change taken value to blank
    $('#b' + takenX + takenY).off().val("  ")
    //Take counter off counterInPlay
    removeCounterFromPlayer(counterOpposition)
    //See if there are any valid options for a second overtake
    var secondOvertake = locationOfSuroundings(newy, newx, 2)
    //If valid options array is returned a second overtake can happen
    if (secondOvertake.length > 0) {
      doubleTakeIndicator++;
      doubleTakeLocation = secondOvertake;
    }
  }
}

/**
 * @function removeCounterFromPlayer - If a player is overtaken remove the piece from thier count and update the server
 */

function removeCounterFromPlayer(playerTaken) {
  if (playerTaken == "X") {
    countersX--;
  } else {
    countersY--;
  }

  //Update server
  fetch('/numberCounters', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        countersX,
        countersY
      })
    })

    .catch(err => console.log(err));

}

/**
 * @function endGame - Ends the game if the number of counters for a player reaches 0
 */

function endGame() {
  if (countersX == 0) {
    $(`#message`).off().html(`Game Ended! X lost all thir counters!!`)
  } else if (countersY == 0) {
    $(`#message`).off().html(`Game Ended! Y lost all their counters!!`)
  }
  $(`#logo`).show();
  $(`.gamePlay`).hide(1000);
  $(`.gameOver`).show(1000);
}

/**
 * @function locationOfSuroundings - displays availble moves to player. Returns an array which can then be used to compare where the user wants to move thier piece.
 */

function locationOfSuroundings(y, x, secondTakeOption) {
  //Record the value of the selected piece
  var element = $('#b' + selectedX + selectedY).val();
  $("#b" + x + y).css({
    "background-color": "green",
  })

  //If it is a king it can move up or down
  if (element == kingPlayer) {
    var offsetx = [-1, 1, -1, 1, -2, 2, -2, 2];
    var offsety = [-1, -1, 1, 1, -2, -2, 2, 2];
    var offsetSize = 4
    //If not, it can only move one direction
  } else {
    var offsetx = [-1, 1, -2, 2];
    var offsety = [1, 1, 2, 2];
    var offsetSize = 2
  }

  //Reverse off set if just y
  if (counterInPlay == "Y" && element != kingPlayer) {
    for (var i = 0; i < offsety.length; i++) {
      offsety[i] = -1 * offsety[i]
    }
  }

  var availableMoves = [];
  var oppositionKing = counterOpposition.concat(counterOpposition);

  //See if next row has any free moves
  for (let i = 0; i < offsetSize; i++) {
    let optionx = x + offsetx[i];
    let optiony = y + offsety[i];

    //Make sure the option is within the board.
    if (optionx >= 0 && optiony <= 7 && optionx <= 7 && optiony <= 7 && optionx <= 7 && optiony >= 0 && optionx >= 0 && optiony >= 0) {
      if (table[optiony][optionx] == 0) {
        var availableMove = [optiony, optionx]
        //If overtaking for second time, this is not a valid option
        if (secondTakeOption == 1) {
          availableMoves.push(availableMove)
          $("#b" + optionx + optiony).css({
            "background-color": "orange",
          })
        }
        //If it has an oppostion in it can check the row after.
      } else if (table[optiony][optionx] == counterOpposition || table[optiony][optionx] == oppositionKing) { //Can it overtake?
        let optionLobx = x + offsetx[i + offsetSize];
        let optionLoby = y + offsety[i + offsetSize];
        //Make sure that the lob option is within the board
        if (optionLobx >= 0 && optionLoby <= 7 && optionLobx <= 7 && optionLoby <= 7 && optionLobx <= 7 && optionLoby >= 0 && optionLobx >= 0 && optionLoby >= 0) {
          //The cell is blank, therefore it can be moved if only option available.
          if (table[optionLoby][optionLobx] == 0) {
            $("#b" + optionLobx + optionLoby).css({
              "background-color": "red",
            })
            var availableMove = [optionLoby, optionLobx]
            availableMoves.push(availableMove)
          }
        }
      }
    }
  }
  //Send back what moves are availble.
  return availableMoves
}


/**
 * @function validMoveChecker - Check if the player selects a cell to move that it matches one of the options returned from locationOfSuroundings
 */

function validMoveChecker(array, multiple) {
  for (var idx = 0; idx < multiple.length; idx++) {
    var count = 0
    for (var i = 0; i < multiple[idx].length; i++) {
      if (multiple[idx][i] === array[i]) {
        count++
      }
      //If both x and y postion are the same the count is 2
      if (count == 2) {
        return "valid"
      }
    }
  }
  return "false move"
}


/**
 * @function changePlayer - Change the player when their turn has ended.
 */

function changePlayer() {
  if (counterInPlay == "X") {
    counterInPlay = "Y";
    counterOpposition = "X"
  } else if (counterInPlay == "Y") {
    counterInPlay = "X";
    counterOpposition = "Y";
  }

  kingPlayer = counterInPlay.concat(counterInPlay)

  //Change the turn of the player in the server
  fetch('/changeTurn', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        counterInPlay,
        counterOpposition,
        kingPlayer
      })
    })
    .catch(err => console.log(err));

  resetTurn()
}

/**
 * @function resetTurn - show that no button has been clicked.
 */

function resetTurn() {
  selectedX = 10;
  selectedY = 10;
  $('.even').css({
    'background': 'lightblue'
  })
}

/**
 * @function pullData - called in document ready function every second.
 */

function pullData() {

  //Recall who this player is
  fetch('/userID', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        myId
      })
    })
    .catch(err => console.log(err));

  //Check to see if the table has changed
  fetch("/newtable")
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (data) {
      table = data;
      updateTable(data);
    }).catch(err => console.log(err));


  //Always check whose turn is it
  fetch("/getTurn")
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (data) {

      for (item of data.turn) {
        counterInPlay = item.playing;
        counterOpposition = item.opposition;
        kingPlayer = item.king;
        player1ID = parseInt(item.player1);
        player2ID = parseInt(item.player2);
      }
      $('#playersTurn').off().html("Player's turn: " + counterInPlay)
    }).catch(err => console.log(err));

  //Check how many counters there are for each player
  fetch("/getNumberCounters")
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (data) {
      for (item of data.player) {
        countersX = item.xCounters;
        countersY = item.yCounters;
      }
      //Update HTML
      $('#xCounters').off().html(" X's Counters: " + countersX)
      $('#yCounters').off().html(" Y's Counters: " + countersY)
    }).catch(err => console.log(err));

  //Has the game ended
  if (countersX == 0 || countersY == 0) {
    endGame()
  }
  turnOppostionCountersOff();
}

/**
 * @function updateTable - updates 2D table array after every second as pullData() is being called every second
 */

function updateTable(data) {
  b00,
  b10,
  b20,
  b01,
  b11,
  b21

  //Cycles throguh every tile
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var obj = data[i][j];
      var id_string = "#b" + j + i;
      if (obj == "X") {
        $(id_string).val("X");
      } else if (obj == "Y") {
        $(id_string).val("Y");
      } else if (obj == "YY") {
        $(id_string).val("YY");
      } else if (obj == "XX") {
        $(id_string).val("XX");
      } else {
        $(id_string).val("  ");
      }
    }
  }
}


/**
 * @function enterPlayersIntoBoard - Adding players to server
 */

function enterPlayersIntoBoard(chosenPlayerId) {
  var player1 = myId;
  let player2 = chosenPlayerId;

  //Make a new game with board number and who is playing
  let game = new window.exports.Game(-1, player1, player2);
  let json = JSON.parse(game.toJSON());

  $.ajax({
    //Send in a string accross to API
    type: 'POST',
    url: '/addGame',
    data: JSON.stringify(json),
    //If successful sending to sever change the id to myID rather than -1
    success: function (data) {
      player1 = myId;
      player2 = chosenPlayerId;
      localStorage.setItem
    },
    contentType: "application/json",
    dataType: 'json'
  });
}

/**
 * @function showOnlineUsers - Display online users who have logged in. Does not display one's own name.
 */

function showOnlineUsers(users) {

  var output = "<table id='playerDetails' cellspacing = '15' align = 'center'>";

  var fullname = localStorage.getItem("fullname");
  //Cycle through all users
  for (user of users.allUsers) {

    if (user.id < 2) {
      $(`#tableHeading`).text(`Waiting for another player to come online`);
    } else {
      $(`#tableHeading`).hide();
    }

    disabled = "disabled";
    fn = user.firstName + " " + user.lastName;

    var Player1 = user.id;
    var nameWithoutSpace = user.firstName + user.lastName;

    var chosenPlayer = user.id;
    if (fullname != fn) {
      output += `<tr>
                  <td>${user.firstName}</td>
                  <td>${user.lastName}</td>
                  <td><button type="button" class="availability" data-id="${chosenPlayer}">PLAY</button></td>
                </tr>`;
    }

    $(`#cp`).text(fullname);
    output = output + "</table>"
    $(`#onlinePlayersTable`).html(output);

    //If player click on `play` they are entered into a game
    $('.availability').on('click', function () {
      var chosenPlayerId = $(this).data('id');
      // If the second player clicks, they have already been entered into a game
      if (player2ID != myId) {
        enterPlayersIntoBoard(chosenPlayerId)
      }
      $(`#onlinePlayers`).hide();
      $(`#onlinePlayersTable`).hide();
      $(`.gamePlay`).show();

    });

  }

  //Sending names of player 1 and player 2 of the game
  fetch('/changePlayerName', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        fullname,
        fn
      })
    })
    .catch(err => console.log(err));
}


/**
 * @function refreshList - Keeps updating as new users log in
 */

function refreshList() {

  fetch('/getUsers')
    .then(response => response.json())
    .then(data => showOnlineUsers(data))
    .catch(err => console.log(err));
}

/**
 * @function addUser - If user enters the game. Add their name to the list of user
 */

function addUser() {
  //Just a string value
  let firstName = $.trim($('#firstNameInput').val());
  let lastName = $.trim($('#lastNameInput').val());

  if (firstName.length > 0 && lastName.length > 0) {
    //exports new user to object in a string
    //Returns as string
    let user = new window.exports.UserInfo(-1, firstName, lastName);
    //turn into json to be used later
    let json = JSON.parse(user.toJSON())

    //Send HTTP request to change server to update user
    $.ajax({
      //Send in a string accross to API
      type: 'POST',
      url: '/addUser',
      data: JSON.stringify(json),
      //If successful sending to sever change the id to myID rather than -1
      success: function (data) {
        myId = data.id;
      },
      contentType: "application/json",
      dataType: 'json'
    });
  }
}


/**
 * @function pullName - see who one is playing.
 */

function pullName() {

  fetch('/changingPlayerName')
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (data) {
      for (flag of data.player) {
        fullname = flag.player1;
        fn = flag.player2;
      }
      updateName(fullname);
    }).catch(err => console.log(err));
}

/**
 * @function updateName - update HTML for player's dashboard. Populated from pullName()
 */

function updateName(fullname) {
  $(`#playingAgainst`).text(`You are playing against ` + fullname);
}
