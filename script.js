class Ink {
    constructor(xcoords, ycoords, times) {
        this.xcoords = xcoords;
        this.ycoords = ycoords;
        this.times = times;
    }
}


// VARIABLES
var canvas = document.getElementById("canvas");
var canvas2 = document.getElementById("canvas2");
var canvas3 = document.getElementById("canvas3");
var ctx = canvas.getContext("2d");
var ctx2 = canvas2.getContext("2d");
var ctx3 = canvas3.getContext("2d");
var radius = 3;
var dragging = false;
var startTime = 0;
ctx.lineWidth = radius * 2;
var inkArray = [];
var tempStroke = [];
var x = document.body;
var offsetX = x.offsetLeft;
var offsetY = x.offsetTop;
var emptyArray2 = []; //y
var emptyArray = []; //x
var emptyArray3 = []; //times

var sgs = document.getElementById('suggestions');

function displaySuggestions(arr) {

    console.log(inkArray);
    // console.log(elem.innerHTML);
    var appnd = '';
    sgs.innerHTML = '';
    //var i = j = 0;
    arr.forEach(function (a) {
        if (a in window.stencils) {
            window.stencils[a].forEach(function (b) {
                sgs.innerHTML += '<img class="img" src="' + b.src + '" s-name=""/>';
            });
        }
    });

    document.getElementById('suggestions').addEventListener('click', btn);


}


// DRAW METHOD + COORDINATES
var putPoint = function (e) {
    if (dragging) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
        canvas.style.cursor = "none";


        var mouseX = parseInt(e.clientX - offsetX);
        var mouseY = parseInt(e.clientY - offsetY);
        var time = Date.now() - startTime;
        emptyArray3.push(time);
        emptyArray.push(mouseX);
        emptyArray2.push(mouseY);
    }
};


/* function putWhite() {
    ctx.strokeStyle = "white";
    inkArray.forEach(function (a) {
        a.xcoords.forEach(function (b, i) {

            //ctx.strokeStyle = "pink";
            ctx.beginPath();
            ctx.lineWidth="5";

            ctx.moveTo(a.xcoords[i], a.ycoords[i]);
            ctx.lineTo(a.xcoords[i+1], a.ycoords[i+1]);
            ctx.stroke();


            //ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            //ctx.beginPath();
            ctx.fillStyle = "purple";

            ctx.beginPath();
        });
    });
} */

var srcG;
var xAv, yAv, h, w;
var sgsComplete = 1;

var btn = function (e) {
    try {
        sgsComplete = 0;
        var xMax = canvas.width;
        var yMax = canvas.height;

        var img = new Image();
        srcG = e.target.src.toString();
        img.src = srcG;

        xAv = (Math.max.apply(null, inkArray[0].xcoords) + Math.min.apply(null, inkArray[0].xcoords)) / 2;
        yAv = (Math.max.apply(null, inkArray[0].ycoords) + Math.min.apply(null, inkArray[0].ycoords)) / 2;

        //xAv = xAv > xMax?xMax:xAv;
        //yAv = yAv > yMax?yMax:xAv;


        w = 200;
        h = 200;

        //console.log(xAv);
        //console.log('y avg:'+Math.min.apply(null, inkArray[0].ycoords)+', max canvas');

        //clearFunction();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        img.onload = function () {
            ctx2.drawImage(img, (xAv - w / 2), (yAv - h / 2), w, h);
            //inkArray.length = 0;
            //ctx.clearRect(x, y, w, h);
        };
        // no chance to choose again after first choice from the suggestions
        //sgs.innerHTML = "";
    }
    catch (err) {
        console.warn('Null click has been handled.');
    }
}


var engage = function (e) {
    dragging = true;
    emptyArray = [];     // ready for a new stroke
    emptyArray2 = [];    // ready for a new stroke
    emptyArray3 = [];   // ready for a new stroke
    startTime = Date.now();
    ctx.fillStyle = "black";

    if (!sgsComplete) {
        var img = new Image();
        console.log(srcG);
        img.src = srcG;

        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        img.onload = function () {
            console.log(ctx3);
            console.log(img + ' ' + (xAv - w / 2) + ' ' + (yAv - h / 2) + ' ' + w + ' ' + h);
            ctx3.drawImage(img, (xAv - w / 2), (yAv - h / 2), w, h);
            inkArray.length = 0;
        };
        // no chance to choose again after first choice from the suggestions
        sgs.innerHTML = "";
        sgsComplete = 0;
    }
    putPoint(e); // one click = a point
};

var disengage = function () {
    if (dragging === true) {
        dragging = false;
        ctx.beginPath();   //to leave where we left
        canvas.style.cursor = "pointer";

        var stroke = new Ink(emptyArray, emptyArray2, emptyArray3); //ink object created with x and y

        inkArray.push(stroke); // put the completed stroke into array
        //console.log("stroke'un 0. x coordu: " + stroke.xcoords[0]);
        var postArray = inkArray.map(function (inkObj) {
            return [inkObj.xcoords, inkObj.ycoords, inkObj.times];
        });

        var url = 'https://inputtools.google.com/request?ime=handwriting&app=autodraw&dbg=1&cs=1&oe=UTF-8';
        var requestBody = {
            input_type: 0,
            requests: [{
                ink: postArray,
                language: 'autodraw',
                writing_guide: {
                    height: 400,
                    width: 700
                }
            }]
        };
        fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8'
            }),
            body: JSON.stringify(requestBody),
        }).then(function (response) {
            return response.json();
        }).then(function (jsonResponse) {

            //console.log(jsonResponse[1][0][1]);
            displaySuggestions(jsonResponse[1][0][1]);
        });
    }
};

var mouseoutEvent = function () {
    dragging = false;
    ctx.beginPath();   //to leave where we left
    canvas.style.cursor = "pointer";
};

/*var mouseinEvent = function (){
  dragging = true;
};*/

// CLEAR BUTTON
document.getElementById("clear").addEventListener(
    "click", function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        inkArray.length = 0;
        sgs.innerHTML = "";
    });
document.getElementById("reset").addEventListener(
    "click", function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx3.clearRect(0, 0, canvas.width, canvas.height);
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        inkArray.length = 0;
        sgs.innerHTML = "";
        sgsComplete = 1;
    });

/// EVENT LISTENERS ///
canvas.addEventListener("mousemove", putPoint);
canvas.addEventListener("mousedown", engage);
canvas.addEventListener("mouseup", disengage);
canvas.addEventListener("mouseout", disengage);
//canvas.addEventListener("mouseout", mouseoutEvent);
//canvas.addEventListener("mousein", mouseinEvent);
