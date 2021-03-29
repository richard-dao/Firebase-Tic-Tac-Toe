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
db.collection('test_games').onSnapshot(snapshot => {
// Returns array of documents changes
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if (change.doc.id == gameIDG){
            if (change.doc.data().status == 1){
                updateGrid(change.doc.data().moves);
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
const zeroO = document.getElementById('o0');

const oneBox = document.getElementById('1');
const oneX = document.getElementById('x1');
const oneO = document.getElementById('o1');

const twoBox = document.getElementById('2');
const twoX = document.getElementById('x2');
const twoO = document.getElementById('o2');

const threeBox = document.getElementById('3');
const threeX = document.getElementById('x3');
const threeO = document.getElementById('o3');

const fourBox = document.getElementById('4');
const fourX = document.getElementById('x4');
const fourO = document.getElementById('o4');

const fiveBox = document.getElementById('5');
const fiveX = document.getElementById('x5');
const fiveO = document.getElementById('o5');

const sixBox = document.getElementById('6');
const sixX = document.getElementById('x6');
const sixO = document.getElementById('o6');

const sevenBox = document.getElementById('7');
const sevenX = document.getElementById('x7');
const sevenO = document.getElementById('o7');

const eightBox = document.getElementById('8');
const eightX = document.getElementById('x8');
const eightO = document.getElementById('o8');

function updateGrid(moveList){
    const list = moveList;
    console.log("Beginning Move Print");
    for (var i = 0; i < list.length; i++){
        if (i % 2 == 0){ // X
            switch(list[i]){
                case 0:
                    zeroX.hidden = false;
                    break;
                case 1:
                    oneX.hidden = false;
                    break;
                case 2:
                    twoX.hidden = false;
                    break;
                case 3:
                    threeX.hidden = false;
                    break;
                case 4:
                    fourX.hidden = false;
                    break;
                case 5:
                    fiveX.hidden = false;
                    break;
                case 6:
                    sixX.hidden = false;
                    break;
                case 7:
                    sevenX.hidden = false;
                    break;
                case 8:
                    eightX.hidden = false;
                    break;
                default:
                    console.log("???");
            }

        }
        else if (i % 2 == 1){ // O
            switch(list[i]){
                case 0:
                    zeroO.hidden = false;
                    break;
                case 1:
                    oneO.hidden = false;
                    break;
                case 2:
                    twoO.hidden = false;
                    break;
                case 3: 
                    threeO.hidden = false;
                    break;
                case 4:
                    fourO.hidden = false;
                    break;
                case 5:
                    fiveO.hidden = false;
                    break;
                case 6:
                    sixO.hidden = false;
                    break;
                case 7:
                    sevenO.hidden = false;
                    break;
                case 8:
                    eightO.hidden = false;
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

function makeMove(whoseMove, gameID, moves){
    console.log("Who's move: " + whoseMove);
    if (playerNumber == whoseMove){
        statusPlayer.innerHTML = `It is your move!`;
        updateGrid(moves);

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
        if (boxNumber == 0){
            zeroO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(0),
                whoseMove: 2
            })
        }
        else if (boxNumber == 1){
            oneO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(1),
                whoseMove: 2
            })
        }
        else if (boxNumber == 2){
            twoO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(2),
                whoseMove: 2
            })
        }
        else if (boxNumber == 3){
            threeO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(3),
                whoseMove: 2
            })
        }
        else if (boxNumber == 4){
            fourO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(4),
                whoseMove: 2
            })
        }
        else if (boxNumber == 5){
            fiveO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(5),
                whoseMove: 2
            })
        }
        else if (boxNumber == 6){
            sixO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(6),
                whoseMove: 2
            })
        }
        else if (boxNumber == 7){
            sevenO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(7),
                whoseMove: 2
            })
        }
        else if (boxNumber == 8){
            eightO.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(8),
                whoseMove: 2
            })
        }
    }
    else if (playerNumber == 2){
        if (boxNumber == 0){
            zeroX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(0),
                whoseMove: 1
            })
        }
        else if (boxNumber == 1){
            oneX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(1),
                whoseMove: 1
            })
        }
        else if (boxNumber == 2){
            twoX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(2),
                whoseMove: 1
            })
        }
        else if (boxNumber == 3){
            threeX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(3),
                whoseMove: 1
            })
        }
        else if (boxNumber == 4){
            fourX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(4),
                whoseMove: 1
            })
        }
        else if (boxNumber == 5){
            fiveX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(5),
                whoseMove: 1
            })
        }
        else if (boxNumber == 6){
            sixX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(6),
                whoseMove: 1
            })
        }
        else if (boxNumber == 7){
            sevenX.hidden = false;
            const db = firebase.firestore();
            db.collection('test_games').doc(gameID).update({
                moves: firebase.firestore.FieldValue.arrayUnion(7),
                whoseMove: 1
            })
        }
        else if (boxNumber == 8){
            eightX.hidden = false;
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
