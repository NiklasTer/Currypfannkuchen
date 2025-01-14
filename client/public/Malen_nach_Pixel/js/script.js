// Connecting to server. Don't touch this :-) 
let socket = io();

//------------globale Variablen------------------

let playerCount = 0;
let allI = ['#0f8', '#8f0', '#f08', '#0f8', '#8f0', '#f08', '#0f8', '#8f0', '#f08'];
let playerColors = [
    ['#439E5F', '#7C0023', '#FFBC00'],
    ['#000200', '#E50000', '#FF8908'],
    ['#99C7F8', '#FF6600', '#910677'],
    ['#070496', '#FFFF04', '#BC0036']
];
let myPlayerIndex = 0;
let selectedColorIndex = 0;
let pixelColors = [];
let str = "!!!!!!!!"


//------------Div-Grid------------------

let gridSize = 55;
$('.wrapper').children().remove();
$('.wrapper').css("grid-template-columns", "repeat(" + gridSize + ", 14px)");
for (let i = 0; i < gridSize * gridSize; i++) {
    console.log("log")
    $('.wrapper').append('<div class="cell empty"></div>');
}

var _img = document.getElementById('id1');
var newImg = new Image;
newImg.onload = function () {
    _img.src = this.src;
}
newImg.src = './assets/Schmetterling770x770.png';

//------------Farb-Buttons------------------

$('#brush1').click(function () {
    selectedColorIndex = 0;
    $("#brush1").removeClass("transparent");
    $("#brush2").addClass("transparent");
    $("#brush3").addClass("transparent");

});

$('#brush2').click(function () {
    selectedColorIndex = 1;
    $("#brush2").removeClass("transparent");
    $("#brush1").addClass("transparent");
    $("#brush3").addClass("transparent");
});

$('#brush3').click(function () {
    selectedColorIndex = 2;
    $("#brush3").removeClass("transparent");
    $("#brush1").addClass("transparent");
    $("#brush2").addClass("transparent");
});


// //------------RGBA zu HEX Konvertieren------------------

function rgbToHex(r, g, b) {

    if (r > 255 || g > 255 || b > 255)

        throw "Invalid color component";

    return ((r << 16) | (g << 8) | b).toString(16);
}


//------------Aufrufen des Bildes und Canvas------------------

function initContext(canvasID, contextType) {
    var canvas = document.getElementById(canvasID);
    var context = canvas.getContext(contextType);
    return context;
}

function loadImage(imageSource, context) {
    var imageObj = new Image();
    imageObj.onload = function () {
        context.imageSmoothingEnabled = false;
        context.drawImage(imageObj, 0, 0, 55, 55);
        var imageData = context.getImageData(0, 0, 55, 55);
        readImage(imageData);

    };
    imageObj.src = imageSource;
    return imageObj;
}
function readImage(imageData) {
    for (let i = 0; i < imageData.data.length; i += 4) {
        var red = imageData.data[i];
        var green = imageData.data[i + 1];
        var blue = imageData.data[i + 2];
        var hex = "#" + ("000000" + rgbToHex(red, green, blue)).slice(-6);
        pixelColors.push({
            hex: hex,
            str: str
        });


    }
    console.log(pixelColors);


    //------------If-Sortierung nach HEX-Codes------------------

    for (let i = 0; i < pixelColors.length; i++) {

        if (pixelColors[i].hex === "#439e5f") {
            pixelColors[i].str = "A"
        }
        if (pixelColors[i].hex === "#000200") {
            pixelColors[i].str = "B"
        }
        if (pixelColors[i].hex === "#070496") {
            pixelColors[i].str = "C"
        }
        if (pixelColors[i].hex === "#99c7f8") {
            pixelColors[i].str = "D"
        }
        if (pixelColors[i].hex === "#e50000") {
            pixelColors[i].str = "E"
        }
        if (pixelColors[i].hex === "#ffff04") {
            pixelColors[i].str = "F"
        }
        if (pixelColors[i].hex === "#bc0036") {
            pixelColors[i].str = "G"
        }
        if (pixelColors[i].hex === "#ff6600") {
            pixelColors[i].str = "H"
        }
        if (pixelColors[i].hex === "#910677") {
            pixelColors[i].str = "I"
        }
        if (pixelColors[i].hex === "#ff8908") {
            pixelColors[i].str = "J"
        }
        if (pixelColors[i].hex === "#7c0023") {
            pixelColors[i].str = "K"
        }
        if (pixelColors[i].hex === "#ffbc00") {
            pixelColors[i].str = "L"
        }
    }
}

var context = initContext('canvas', '2d');
var imageObj = loadImage('./assets/Schmetterling55x55px.png', context);

//------------Buchtsaben in den Zellen------------------

setTimeout(forloop, 500)

function forloop() {
    for (let i = 0; i < gridSize * gridSize; i++) {

        $('.wrapper > div:nth-child(' + i + ')').text(pixelColors[i].str)
    }
}
//------------Klicken&Senden------------------

$('.cell').click(function () {
    console.log(myPlayerIndex)
    socket.emit('serverEvent', {
        type: "played",
        playerIndex: myPlayerIndex,
        selectedColorIndex: selectedColorIndex,
        cellIndex: $(this).index()
    });
    if (whosTurn == myPlayerIndex && $(this).hasClass("empty")) {

    }
});

//------------Eingehende Aktionen------------------

socket.on('connected', function (msg) {
    console.log(msg);
    socket.emit('serverEvent', {
        type: "reset"
    });
});

socket.on('serverEvent', function (message) {
    console.log("Incoming event: ", message);

    if (message.type == "reset") {
        whosTurn = 0;
        $('.cell').addClass("empty");
        $('.cell').css("background-color", "white");
    }
    if (message.type == "played") {
        let cell = $('.wrapper').children()[message.cellIndex];
        cell = $(cell);
        cell.removeClass("empty");

        //------------Abfrage ausgewählte Farbe und Abgleich mit Zellfarbe------------------

        let brushColor = playerColors[message.playerIndex][message.selectedColorIndex].toUpperCase();
        let cellColor = pixelColors[message.cellIndex].hex.toUpperCase();

        console.log(brushColor, cellColor)
        if (brushColor == cellColor) {

            cell.css("background-color", brushColor);
        }
    }
    if (whosTurn >= playerCount) {
        whosTurn = 1;
    }
    updateStatus();
});

//------------Reset/Neuer Nutzer kommt hinzu------------------

socket.on('newUsersEvent', function (myID, myIndex, userList) {
    console.log("New users event: ");
    console.log("That's me: " + myID);
    console.log("My index in the list: " + myIndex);
    console.log("That's the new users: ");
    console.log(userList);

    playerCount = userList.length;
    myPlayerIndex = myIndex;

    $('#brush1').css("fill", playerColors[myPlayerIndex][0]);
    $('#brush2').css("fill", playerColors[myPlayerIndex][1]);
    $('#brush3').css("fill", playerColors[myPlayerIndex][2]);

    updateStatus();
});

//------------Update-Funktion------------------

function updateStatus() {
    $('#player-status').html("Es sind " + playerCount + " Spieler verbunden");
}