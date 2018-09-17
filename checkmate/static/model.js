/**
 * model.js file that includes all the objects defined in the form of classes for the game.
 * The same file has been included on both server and client folders for smooth functionality.
 */

 /**
  * Class representing User Details
  */
 (function () {
  /**
   * @param {number} id - auto-generated id for each new user
   * @param {string} firstName - stores the last name entered by the user on index.html
   * @param {string} lastName - stores the last name entered by the user on index.html
   * @param {boolean} availability - showing the status of each player at the time of login
   */
  class UserInfo {
    constructor(id, firstName, lastName, availability) {
      if (typeof (firstName) != undefined) {
        this._id = id;
        this._firstName = firstName;
        this._lastName = lastName;
        this._availability = availability;
      } else {
        this._id = -1;
        this._firstName = "";
        this._lastName = "";
        this._availability = false;
      }
    }

    get id() {
      return this._id;
    }

    get firstName() {
      return this._firstName;
    }
    set firstName(input) {
      this._firstName = input;
    }

    get lastName() {
      return this._lastName;
    }
    set lastName(input2) {
      this._lastName = input2;
    }

    get availability() {
      return this._availability;
    }
    set availability(input) {
      this._availability = input;
    }



    // Returns as JSON objects

    toJSON() {
      let result = {}
      result.id = this._id;
      result.firstName = this._firstName
      result.lastName = this._lastName;
      result.availability = this._availability;

      return JSON.stringify(result)
    }

    fromJSON(json) {
      if (json.hasOwnProperty('id') && typeof (json.id) === 'number' && json.id >= 0)
        this._id = json.id;

      if (json.hasOwnProperty('firstName') && typeof (json.firstName) === 'string' && json.firstName != "")
        this._firstName = json.firstName;

      if (json.hasOwnProperty('lastName') && typeof (json.lastName) === 'string' && json.lastName != "")
        this._lastName = json.lastName;

      if (json.hasOwnProperty('availibility') && typeof (json.availability) === 'boolean')
      this._availability = json.availability;
    }
  }

 /**
  * Class representing Game Details
  */
 class Game {
  /**
   * @param {number} boardId - auto-generated id for each new user
   * @param {number} player1 - id stored in the above constructor for each player gets set in this variable
   * @param {number} player2 - id stored in the above constructor for each player gets set in this variable
   */
    constructor(boardId, player1, player2) {
      if (typeof (player1) != undefined) {
        this._boardId = boardId;
        this._player1 = player1;
        this._player2 = player2;
      } else {
        this._boardId = -1;
        this._player1 = "";
        this._player2 = "";
      }
    }

    get boardId() {
      return this._boardId;
    }

    get player1() {
      return this._player1;
    }
    set player1(input) {
      this._player1 = input;
    }

    get player2() {
      return this._player2;
    }
    set player2(input2) {
      this._player2 = input2;
    }


    // Returns as JSON objects

    toJSON() {
      let result = {}
      result.boardId = this._boardId;
      result.player1 = this._player1
      result.player2 = this._player2;

      return JSON.stringify(result)
    }
  }


  //Export parts that should be public

  let exports = {
    UserInfo: UserInfo,
    Game: Game
  }
  if (typeof __dirname == "undefined") {
    window.exports = exports;
  } else {
    module.exports = exports;
  }
}())
