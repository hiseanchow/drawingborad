var canvas = document.getElementById("drawing-board");
var ctx = canvas.getContext("2d");
var eraser = document.getElementById("eraser");
var brush = document.getElementById("brush");
var reSetCanvas = document.getElementById("clear");
var save = document.getElementById("save");
var undo = document.getElementById("undo");
var range = document.getElementById("range");
var clear = false;
var aColorBtn = document.getElementsByClassName("color-item");
var activeColor = 'black';
var lWidth = 4;

autoSetSize(canvas);

setCanvasBg('white');

listenToUser(canvas);

getColor();

window.onbeforeunload = function(e){
    return "Reload site?";
}

function autoSetSize(canvas) {
    canvasSetSize();

    function canvasSetSize() {
        var pageWidth = document.documentElement.clientWidth;
        var pageHeight = document.documentElement.clientHeight;

        canvas.width = pageWidth;
        canvas.height = pageHeight;
    }

    window.onresize = function () {
        canvasSetSize();
    }
}

function setCanvasBg(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
}

function listenToUser(canvas) {
    let painting = false;
    let lastPoint = {x: undefined, y: undefined};

    if (document.body.ontouchstart !== undefined) {
        canvas.ontouchstart = function (e) {
            painting = true;
            let x = e.touches[0].clientX;
            let y = e.touches[0].clientY;
            lastPoint = {"x": x, "y": y};
            ctx.save();
            drawCircle(x, y, 0);
        }
        canvas.ontouchmove = function (e) {
            if (painting) {
                let x = e.touches[0].clientX;
                let y = e.touches[0].clientY;
                let newPoint = {"x": x, "y": y};
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
                lastPoint = newPoint;
            }
        }

        canvas.ontouchend = function (e) {
            painting = false;
        }
    } else {
        canvas.onmousedown = function (e) {
            painting = true;
            let x = e.clientX;
            let y = e.clientY;
            lastPoint = {"x": x, "y": y};
            ctx.save();
            drawCircle(x, y, 0);
        }
        canvas.onmousemove = function (e) {
            if (painting) {
                let x = e.clientX;
                let y = e.clientY;
                let newPoint = {"x": x, "y": y};
                // drawCircle(x, y, lWidth);
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y,clear);
                lastPoint = newPoint;
            }
        }

        canvas.onmouseup = function (e) {
            painting = false;
        }
    }
}

function drawCircle(x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (clear) {
        ctx.clip();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.lineWidth = lWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (clear) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();
    }else{
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
}

range.onchange = function(){
    lWidth = this.value;
}

eraser.onclick = function () {
    clear = true;
    this.classList.add("active");
    brush.classList.remove("active");
}

brush.onclick = function () {
    clear = false;
    this.classList.add("active");
    eraser.classList.remove("active");
}

reSetCanvas.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

save.onclick = function () {
    var imgUrl = canvas.toDataURL("image/png");
    var saveA = document.createElement("a");
    document.body.appendChild(saveA);
    saveA.href = imgUrl;
    saveA.download = "zspic" + (new Date).getTime();
    saveA.target = "_blank";
    saveA.click();
}

function getColor(){
    for (var i = 0; i < aColorBtn.length; i++) {
        aColorBtn[i].onclick = function () {
            for (var i = 0; i < aColorBtn.length; i++) {
                aColorBtn[i].classList.remove("active");
                this.classList.add("active");
                activeColor = this.style.backgroundColor;
                ctx.fillStyle = activeColor;
                ctx.strokeStyle = activeColor;
            }
        }
    }
}

// var historyUndo = [];