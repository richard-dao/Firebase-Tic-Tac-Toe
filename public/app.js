let userIDG;
document.addEventListener("DOMContentLoaded", event =>{
    const app = firebase.app();
    const db = firebase.firestore();
    let usersRef;
    let unsubscribe;
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
          // User is signed in, display options
          signedIn.hidden = false;
          signedOut.hidden = true;
          userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3>`;
          userGlobal = user.user;

          // Check if user already exists
          userRef = db.collection('test_users');
          userIDG = user.uid;
          const docRef = userRef.doc(user.uid);
          docRef.get().then((doc) => {
              if (doc.exists){
                  console.log("User exists");
              }
              else{
                  userRef.doc(user.uid).set({
                      draws: 0,
                      email: user.email,
                      losses: 0,
                      name: user.displayName,
                      uid: user.uid,
                      wins: 0
                  })
              }
          }).catch((error) => {
            console.log("Error getting document:", error);
          });
          
          // Create/Join game
          matchmakingBtn.onclick = () => checkAvailable(user);
          

        }
        else{
            signedIn.hidden = true;
            signedOut.hidden = false;
        }
      });
});

// Sign In / Sign Out Authentication
const signedIn = document.getElementById('signedIn');
const signedOut = document.getElementById('signedOut');
const signInBtn = document.getElementById('signInButton');
const signOutBtn = document.getElementById('signOutButton');
const userDetails = document.getElementById('signedInInfo');

function googleLogin(){
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then(function() {
            console.log("Login successful");
            
        })
        .catch(console.log)
}

function logOut(){
    firebase.auth().signOut()
        .then(function(){
            console.log("Logout successful");
        })
        .catch(console.log())
}

signInBtn.onclick = () => googleLogin();
signOutBtn.onclick = () => logOut();


// Matchmaking
const matchmakingBtn = document.getElementById('lookForGameButton');
const gameBody = document.getElementById('gameBody');
let playerNumber;
let gameIDG;

function createGame(user){
    const db = firebase.firestore();
    let gamesRef = db.collection('test_games');
    const { serverTimestamp } = firebase.firestore.FieldValue;
         gamesRef.add({
            created: serverTimestamp(),
            moves: [],
            player1: user.uid,
            player2: "",
            status: 0,
            whoseMove: 2
    }).then(function(docRef){
        console.log(docRef.id);
        gameIDG = docRef.id;
    })
    console.log("Game created. Waiting for opponent.");
    gameBody.hidden = false;
}

function joinGame(gameID, user){
    gameIDG = gameID;
    const db = firebase.firestore();
    const docRef = db.collection('test_games').doc(gameID);
    docRef.update({
        player2: user.uid,
        status: 1 // Game is now in progress
    })
    console.log("Game found. Joining game.");
    gameBody.hidden = false;


}

var alreadySearching = false;
var joinedGame = false;
function checkAvailable(user){
    // If there is an open game, join that open game, if there are no open games, create one and wait for someone to join
    // Status Key:
    // 0 = Waiting for opoonent
    // 1 = Game in progress
    // 2 = Finished Game
    const db = firebase.firestore();
    db.collection('test_games').get().then((snapshot) => {
        snapshot.docs.some(doc => {
            if (doc.data().status == 0 && doc.data().player1 != user.uid){
                console.log(doc.id);
                gameIDG = doc.id;
                joinGame(doc.id, user);
                joinedGame = true;
                playerNumber = 2;
                return true;
            }
        })
        if (joinedGame == false){
            if (alreadySearching == false){
                alreadySearching = true;
                createGame(user);
                playerNumber = 1;
            }
            else{
                alert("Already searching for game");
            }
        }

    })
}

// Start Game
const db = firebase.firestore();
// On snapshot
let unsubscribe = db.collection('test_games').onSnapshot(snapshot => {
// Returns array of documents changes
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if (change.doc.id == gameIDG){
            updateGrid(change.doc.data().moves);
            // Function returns 2 if a win is detected and 1 if the game should continue
            if (checkWin(change.doc.data().moves) == 2){
                statusPlayer.innerHTML = `Game Over`;
            }
            else if (change.doc.data().status == 1){
                makeMove(change.doc.data().whoseMove, gameIDG, change.doc.data().moves);
            }
            else{
                console.log("Error");
            }
        }
        else{
            console.log("Different match ID: " + change.doc.id);
        }
    })
})


// Game 
const statusPlayer = document.getElementById('status');
const zeroBox = document.getElementById('0');
const zeroX = document.getElementById('x0');
let x0BoolHide = true;
const zeroO = document.getElementById('o0');
let o0BoolHide = true;

const oneBox = document.getElementById('1');
const oneX = document.getElementById('x1');
let x1BoolHide = true;
const oneO = document.getElementById('o1');
let o1BoolHide = true;

const twoBox = document.getElementById('2');
const twoX = document.getElementById('x2');
let x2BoolHide = true;
const twoO = document.getElementById('o2');
let o2BoolHide = true;

const threeBox = document.getElementById('3');
const threeX = document.getElementById('x3');
let x3BoolHide = true;
const threeO = document.getElementById('o3');
let o3BoolHide = true;

const fourBox = document.getElementById('4');
const fourX = document.getElementById('x4');
let x4BoolHide = true;
const fourO = document.getElementById('o4');
let o4BoolHide = true;

const fiveBox = document.getElementById('5');
const fiveX = document.getElementById('x5');
let x5BoolHide = true;
const fiveO = document.getElementById('o5');
let o5BoolHide = true;

const sixBox = document.getElementById('6');
const sixX = document.getElementById('x6');
let x6BoolHide = true;
const sixO = document.getElementById('o6');
let o6BoolHide = true;

const sevenBox = document.getElementById('7');
const sevenX = document.getElementById('x7');
let x7BoolHide = true;
const sevenO = document.getElementById('o7');
let o7BoolHide = true;

const eightBox = document.getElementById('8');
const eightX = document.getElementById('x8');
let x8BoolHide = true;
const eightO = document.getElementById('o8');
let o8BoolHide = true;

let opponentIDG;
let oponnentNameG;

const userName = document.getElementById('userName');
const userStats = document.getElementById('userStats');
const opponentStats = document.getElementById('opponentStats');
const opponentName = document.getElementById('opponentName');
function updateGrid(moveList){
    const db = firebase.firestore();
    db.collection('test_users').doc(userIDG).get().then((doc) => {
        userStats.innerHTML = `Wins: ${doc.data().wins} Losses: ${doc.data().losses} Draws: ${doc.data().draws}`;
        userName.innerHTML = `${doc.data().name}`;
    })
    
    const db2 = firebase.firestore();
    db2.collection('test_games').doc(gameIDG).get().then((doc) => {
        if (playerNumber == 1){
            console.log(doc.data().player2);
            opponentIDG = doc.data().player2;
            console.log(opponentIDG);
            const db3 = firebase.firestore();
            db3.collection('test_users').doc(opponentIDG).get().then((doc) => {
                opponentStats.innerHTML = `Wins: ${doc.data().wins} Losses: ${doc.data().losses} Draws: ${doc.data().draws}`;
                opponentName.innerHTML = `${doc.data().name}`;
            })
        }
        else{
            console.log(doc.data().player1);
            opponentIDG = doc.data().player1;

            console.log(opponentIDG);
            const db3 = firebase.firestore();
            db3.collection('test_users').doc(opponentIDG).get().then((doc) => {
                opponentStats.innerHTML = `Wins: ${doc.data().wins} Losses: ${doc.data().losses} Draws: ${doc.data().draws}`;
                opponentName.innerHTML = `${doc.data().name}`;
            })
        }
    })
    

    const list = moveList;
    console.log("Beginning Move Print");
    for (var i = 0; i < list.length; i++){
        if (i % 2 == 0){ // X
            switch(list[i]){
                case 0:
                    zeroX.hidden = false;
                    x0BoolHide = false;
                    break;
                case 1:
                    oneX.hidden = false;
                    x1BoolHide = false;
                    break;
                case 2:
                    twoX.hidden = false;
                    x2BoolHide = false;
                    break;
                case 3:
                    threeX.hidden = false;
                    x3BoolHide = false;
                    break;
                case 4:
                    fourX.hidden = false;
                    x4BoolHide = false;
                    break;
                case 5:
                    fiveX.hidden = false;
                    x5BoolHide = false;
                    break;
                case 6:
                    sixX.hidden = false;
                    x6BoolHide = false;
                    break;
                case 7:
                    sevenX.hidden = false;
                    x7BoolHide = false;
                    break;
                case 8:
                    eightX.hidden = false;
                    x8BoolHide = false;
                    break;
                default:
                    console.log("???");
            }

        }
        else if (i % 2 == 1){ // O
            switch(list[i]){
                case 0:
                    zeroO.hidden = false;
                    o0BoolHide = false;
                    break;
                case 1:
                    oneO.hidden = false;
                    o1BoolHide = false;
                    break;
                case 2:
                    twoO.hidden = false;
                    o2BoolHide = false;
                    break;
                case 3: 
                    threeO.hidden = false;
                    o3BoolHide = false;
                    break;
                case 4:
                    fourO.hidden = false;
                    o4BoolHide = false;
                    break;
                case 5:
                    fiveO.hidden = false;
                    o5BoolHide = false;
                    break;
                case 6:
                    sixO.hidden = false;
                    o6BoolHide = false;
                    break;
                case 7:
                    sevenO.hidden = false;
                    o7BoolHide = false;
                    break;
                case 8:
                    eightO.hidden = false;
                    o8BoolHide = false;
                    break;
                default:
                    console.log("???");
            }

        }
        else{
            console.log("Error, board not updated!");
        }
    }
    

}

function makeMove(whoseMove, gameID){
    console.log("Who's move: " + whoseMove);
    if (playerNumber == whoseMove){
        statusPlayer.innerHTML = `It is your move!`;

        if (playerNumber == whoseMove){
            zeroBox.onclick = () => changeBoxStatus(0, playerNumber, gameID);
            oneBox.onclick = () => changeBoxStatus(1, playerNumber, gameID);
            twoBox.onclick = () => changeBoxStatus(2, playerNumber, gameID);
            threeBox.onclick = () => changeBoxStatus(3, playerNumber, gameID);
            fourBox.onclick = () => changeBoxStatus(4, playerNumber, gameID);
            fiveBox.onclick = () => changeBoxStatus(5, playerNumber, gameID);
            sixBox.onclick = () => changeBoxStatus(6, playerNumber, gameID);
            sevenBox.onclick = () => changeBoxStatus(7, playerNumber, gameID);
            eightBox.onclick = () => changeBoxStatus(8, playerNumber, gameID);
        }
        else{
            console.log("Error, wrong playerNumber?");
        }
        

    }
    else{
        statusPlayer.innerHTML = `Waiting for opponent`;
    }

}

function changeBoxStatus(boxNumber, playerNumber, gameID){
    if (playerNumber == 1){
        if (boxNumber == 0 && x0BoolHide == true){
            zeroO.hidden = false;
            o0BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(0),
                whoseMove: 2
            })
        }
        else if (boxNumber == 1 && x1BoolHide == true){
            oneO.hidden = false;
            o1BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(1),
                whoseMove: 2
            })
        }
        else if (boxNumber == 2 && x2BoolHide == true){
            twoO.hidden = false;
            o2BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(2),
                whoseMove: 2
            })
        }
        else if (boxNumber == 3 && x3BoolHide == true){
            threeO.hidden = false;
            o3BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(3),
                whoseMove: 2
            })
        }
        else if (boxNumber == 4 && x4BoolHide == true){
            fourO.hidden = false;
            o4BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(4),
                whoseMove: 2
            })
        }
        else if (boxNumber == 5 && x5BoolHide == true){
            fiveO.hidden = false;
            o5BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(5),
                whoseMove: 2
            })
        }
        else if (boxNumber == 6 && x6BoolHide == true){
            sixO.hidden = false;
            o6BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(6),
                whoseMove: 2
            })
        }
        else if (boxNumber == 7 && x7BoolHide == true){
            sevenO.hidden = false;
            o7BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(7),
                whoseMove: 2
            })
        }
        else if (boxNumber == 8 && x8BoolHide == true){
            eightO.hidden = false;
            o8BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(8),
                whoseMove: 2
            })
        }
    }
    else if (playerNumber == 2){
        if (boxNumber == 0 && o0BoolHide == true){
            zeroX.hidden = false;
            x0BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(0),
                whoseMove: 1
            })
        }
        else if (boxNumber == 1 && o1BoolHide == true){
            oneX.hidden = false;
            x1BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(1),
                whoseMove: 1
            })
        }
        else if (boxNumber == 2 && o2BoolHide == true){
            twoX.hidden = false;
            x2BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(2),
                whoseMove: 1
            })
        }
        else if (boxNumber == 3 && o3BoolHide == true){
            threeX.hidden = false;
            x3BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(3),
                whoseMove: 1
            })
        }
        else if (boxNumber == 4 && o4BoolHide == true){
            fourX.hidden = false;
            x4BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(4),
                whoseMove: 1
            })
        }
        else if (boxNumber == 5 && o5BoolHide == true){
            fiveX.hidden = false;
            x5BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(5),
                whoseMove: 1
            })
        }
        else if (boxNumber == 6 && o6BoolHide == true){
            sixX.hidden = false;
            x6BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(6),
                whoseMove: 1
            })
        }
        else if (boxNumber == 7 && o7BoolHide == true){
            sevenX.hidden = false;
            x7BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(7),
                whoseMove: 1
            })
        }
        else if (boxNumber == 8 && o8BoolHide == true){
            eightX.hidden = false;
            x8BoolHide = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(8),
                whoseMove: 1
            })
        }

    }
    else{
        console.log("Error, whose move is it?");
        console.log(playerNumber);
    }
}

function checkWin(moves){
    let xMoves = [];
    let oMoves = [];
    let matrix = [[0, 0, 0],[0, 0, 0],[0, 0, 0]];


    for (var i = 0; i < moves.length; i++){
        if (i % 2 == 0){
            xMoves.push(moves[i]);
        }
        else{
            oMoves.push(moves[i]);
        }
    }

    for (var i = 0; i < 3; i++){
        for (var j = 0; j < 3; j++){
            if (i == 0){
                if (j == 0){
                    if (xMoves.includes(0)){
                        matrix[i][j] = 1;
                    }
                }
                else if (j == 1){
                    if (xMoves.includes(1)){
                        matrix[i][j] = 1;
                    }
                }
                else{
                    if (xMoves.includes(2)){
                        matrix[i][j] = 1;
                    }
                }
            }
            if (i == 1){
                if (j == 0){
                    if (xMoves.includes(3)){
                        matrix[i][j] = 1;
                    }
                }
                else if (j == 1){
                    if (xMoves.includes(4)){
                        matrix[i][j] = 1;
                    }
                }
                else{
                    if (xMoves.includes(5)){
                        matrix[i][j] = 1;
                    }
                }
            }
            if (i == 2){
                if (j == 0){
                    if (xMoves.includes(6)){
                        matrix[i][j] = 1;
                    }
                }
                else if (j == 1){
                    if (xMoves.includes(7)){
                        matrix[i][j] = 1;
                    }
                }
                else{
                    if (xMoves.includes(8)){
                        matrix[i][j] = 1;
                    }
                }
            }
        }
    }
    for (var i = 0; i < 3; i++){
        for (var j = 0; j < 3; j++){
            if (i == 0){
                if (j == 0){
                    if (oMoves.includes(0)){
                        matrix[i][j] = -1;
                    }
                }
                else if (j == 1){
                    if (oMoves.includes(1)){
                        matrix[i][j] = -1;
                    }
                }
                else{
                    if (oMoves.includes(2)){
                        matrix[i][j] = -1;
                    }
                }
            }
            if (i == 1){
                if (j == 0){
                    if (oMoves.includes(3)){
                        matrix[i][j] = -1;
                    }
                }
                else if (j == 1){
                    if (oMoves.includes(4)){
                        matrix[i][j] = -1;
                    }
                }
                else{
                    if (oMoves.includes(5)){
                        matrix[i][j] = -1;
                    }
                }
            }
            if (i == 2){
                if (j == 0){
                    if (oMoves.includes(6)){
                        matrix[i][j] = -1;
                    }
                }
                else if (j == 1){
                    if (oMoves.includes(7)){
                        matrix[i][j] = -1;
                    }
                }
                else{
                    if (oMoves.includes(8)){
                        matrix[i][j] = -1;
                    }
                }
            }
        }
    }
    
    // Win Conditions
    // Player 2 (X) Wins
    if (matrix[0][0] + matrix[0][1] + matrix[0][2] == 3){
        endGame(2);
        return 2;
    }
    else if (matrix[1][0] + matrix[1][1] + matrix[1][2] == 3){
        endGame(2);
        return 2;
    }
    else if (matrix[2][0] + matrix[2][1] + matrix[2][2] == 3){
        endGame(2);
        return 2;
    }
    else if (matrix[0][0] + matrix[1][0] + matrix[2][0] == 3){
        endGame(2);
        return 2;
    }
    else if (matrix[0][1] + matrix[1][1] + matrix[2][1] == 3){
        endGame(2);
        return 2;
    }
    else if (matrix[0][2] + matrix[1][2] + matrix[2][2] == 3){
        endGame(2);
        return 2;
    }
    else if (matrix[0][0] + matrix[1][1] + matrix[2][2] == 3){
        endGame(2);
        return 2;
    }
    else if (matrix[0][2] + matrix[1][1] + matrix[2][0] == 3){
        endGame(2);
        return 2;
    }
    // Player 1 (O) Wins
    else if (matrix[0][0] + matrix[0][1] + matrix[0][2] == -3){
        endGame(1);
        return 2;
    }
    else if (matrix[1][0] + matrix[1][1] + matrix[1][2] == -3){
        endGame(1);
        return 2;
    }
    else if (matrix[2][0] + matrix[2][1] + matrix[2][2] == -3){
        endGame(1);
        return 2;
    }
    else if (matrix[0][0] + matrix[1][0] + matrix[2][0] == -3){
        endGame(1);
        return 2;
    }
    else if (matrix[0][1] + matrix[1][1] + matrix[2][1] == -3){
        endGame(1);
        return 2;
    }
    else if (matrix[0][2] + matrix[1][2] + matrix[2][2] == -3){
        endGame(1);
        return 2;
    }
    else if (matrix[0][0] + matrix[1][1] + matrix[2][2] == -3){
        endGame(1);
        return 2;
    }
    else if (matrix[0][2] + matrix[1][1] + matrix[2][0] == -3){
        endGame(1);
        return 2;
    }
    else{
        if(moves.length == 9){
            endGame(3);
            return 2;
        }
        return 1;
    }
}

function endGame(winner){
    unsubscribe(); // Stops listening
    if (winner == 3){ // Draw
        alert("Draw!");
        const db = firebase.firestore();
        db.collection('test_games').doc(gameIDG).update({
            status: 2
        })
        db.collection('test_users').doc(userIDG).update({
            draws: firebase.firestore.FieldValue.increment(1)
        })
        setTimeout(location.reload.bind(location), 1500);
    }
    else if (winner == playerNumber){ // If Winner
        alert("You win!");
        const db = firebase.firestore();
        db.collection('test_games').doc(gameIDG).update({
            status: 2
        })
        db.collection('test_users').doc(userIDG).update({
            wins: firebase.firestore.FieldValue.increment(1)
        })
        setTimeout(location.reload.bind(location), 1500);
    }
    else{ // If loser
        alert("You lose!");
        const db = firebase.firestore();
        db.collection('test_users').doc(userIDG).update({
            losses: firebase.firestore.FieldValue.increment(1)
        })
        setTimeout(location.reload.bind(location), 1500);
        
    }

}
