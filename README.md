前些天学习了`HTML5`的`<canvas>`元素，今天就来实践一下，用`canvas`做一个画板。

首先说一下要实现的功能：
- 切换画笔颜色
- 调整笔刷粗细
- 清空画布
- 橡皮擦擦除
- 撤销操作
- 保存成图片
- 兼容移动端（支持触摸）

好了，废话少说，先看最终效果：[https://hiseanchow.github.io/drawingborad](https://hiseanchow.github.io/drawingborad)

### 准备工作
首先，准备个容器,也就是画板了。
``` HTML
<canvas id="drawing-board"></canvas>
```
然后初始化js：
```JavaScript
let canvas = document.getElementById("drawing-board");
let ctx = canvas.getContext("2d");
```
我想把画板做成全屏的，所以接下来设置一下`canvas`的宽高。
```JavaScript
let pageWidth = document.documentElement.clientWidth;
let pageHeight = document.documentElement.clientHeight;

canvas.width = pageWidth;
canvas.height = pageHeight;
```
由于部分IE不支持`canvas`，如果要兼容IE，我们可以创建一个`canvas`，然后使用`excanvas`初始化，针对IE加上[exCanvas.js](http://code.google.com/p/explorercanvas/)，这里我们暂时先不考虑IE。

### 实现一个简单的画板
实现思路：监听鼠标事件，用`drawCircle()`方法把记录的数据画出来。

1. 设置初始化当前画布功能为画笔状态，`painting = false`，
2. 当鼠标按下时（`mousedown`），把`painting`设为`true`，表示正在画，鼠标没松开。把鼠标点记录下来。
3. 当按下鼠标的时候，鼠标移动（`mousemove`）就把点记录下来并画出来。
4. 如果鼠标移动过快，浏览器跟不上绘画速度，点与点之间会产品间隙，所以我们需要将画出的点用线连起来（`lineTo()`）。
5. 鼠标松开的时候（`mouseup`），把`painting`设为`false`。

代码：
```JavaScript
let painting = false;
let lastPoint = {x: undefined, y: undefined};

//鼠标按下事件
canvas.onmousedown = function (e) {
    painting = true;
    let x = e.clientX;
    let y = e.clientY;
    lastPoint = {"x": x, "y": y};
    drawCircle(x, y, 5);
};

//鼠标移动事件
canvas.onmousemove = function (e) {
    if (painting) {
        let x = e.clientX;
        let y = e.clientY;
        let newPoint = {"x": x, "y": y};
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y,clear);
        lastPoint = newPoint;
    }
};

//鼠标松开事件
canvas.onmouseup = function () {
    painting = false;
}

// 画点函数
function drawCircle(x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// 划线函数
function drawLine(x1, y1, x2, y2) {
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}
```

### 橡皮擦功能
实现思路
1. 获取橡皮擦元素
2. 设置橡皮擦初始状态，`clear = false`。
3. 监听橡皮擦`click`事件，点击橡皮擦，改变橡皮擦状态，`clear = true`。
4. `clear`为`true`时，移动鼠标使用`canvas`剪裁（`clip()`）擦除画布。

```JavaScript
let eraser = document.getElementById("eraser");
let clear = false;

eraser.onclick = function () {
    clear = true;
};

...
if (clear) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.restore();
}
...
```
注意，在`canvas`中的裁剪和平时的裁剪功能不一样在这里，裁剪是指在裁剪区域去显示我们所画的图

### 兼容移动端
实现思路：
1. 判断设备是否支持触摸
2. `true`，则使用`touch`事件；`false`，则使用`mouse`事件

代码：
```JavaScript
...
if (document.body.ontouchstart !== undefined) {
    // 使用touch事件
    anvas.ontouchstart = function (e) {
        // 开始触摸
    }
    canvas.ontouchmove = function (e) {
        // 开始滑动
    }
    canvas.ontouchend = function () {
        // 滑动结束
    }
}else{
    // 使用mouse事件
    ...
}
...
```
这里需要注意的一点是，在`touch`事件里，是通过`.touches[0].clientX`和`.touches[0].clientY`来获取坐标的，这点要和`mouse`事件区别开。

### 切换画笔颜色
实现思路：
1. 获取颜色元素节点。
2. 点击颜色返回其颜色值，并赋给画布的`ctx.strokeStyle`。

代码：
```JavaScript
let aColorBtn = document.getElementsByClassName("color-item");

for (let i = 0; i < aColorBtn.length; i++) {
    aColorBtn[i].onclick = function () {
    for (let i = 0; i < aColorBtn.length; i++) {
        activeColor = this.style.backgroundColor;
        ctx.strokeStyle = activeColor;
    }
}
```

### 清空画布
实现思路：
1. 获取元素节点。
2. 点击清空按钮清空canvas画布。

代码：
```JavsScript
let reSetCanvas = document.getElementById("clear");

reSetCanvas.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};
```

### 调整笔刷粗细
实现思路：
1. 创建input[type=range]
2. 滑动range获取其value值，并赋给`ctx.lineWidth`

代码：
```JavaScript
let range = document.getElementById("range");

range.onchange = function(){
    lWidth = this.value;
};
```

### 保存成图片
实现思路：
1. 获取canvas.toDateURL
2. 在页面里创建并插入一个a标签
3. a标签href等于canvas.toDateURL，并添加download属性
4. 点击保存按钮，a标签触发click事件

代码：
```JavaScript
let save = document.getElementById("save");

save.onclick = function () {
    let imgUrl = canvas.toDataURL("image/png");
    let saveA = document.createElement("a");
    document.body.appendChild(saveA);
    saveA.href = imgUrl;
    saveA.download = "zspic" + (new Date).getTime();
    saveA.target = "_blank";
    saveA.click();
};
```

### 撤销
实现思路：
1. 准备一个数组记录历史操作
2. 每次使用画笔前将当前绘图表面储存进数组
3. 点击撤销时，恢复到上一步的绘图表面

代码：

```
canvas.ontouchstart = function (e) {
     // 在这里储存绘图表面
    this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    saveData(this.firstDot);
    ...
}

let undo = document.getElementById("undo");
let historyDeta = [];

function saveData (data) {
    (historyDeta.length === 10) && (historyDeta.shift()); // 上限为储存10步，太多了怕挂掉
    historyDeta.push(data);
}
undo.onclick = function(){
    if(historyDeta.length < 1) return false;
    ctx.putImageData(historyDeta[historyDeta.length - 1], 0, 0);
    historyDeta.pop()
};
```

因为每次储存都是将一张图片存入内存，对性能影响较大，所以在这里设置了储存上限。

### 总结
这里用的知识点主要有：监听`mouse`、`touch`事件，以及`canvas`的`moveTo()`、`lineTo()`、`stroke()`、`clip()`、`clearRect()`等方法。我相信还有很多效果可以实现，比如说类似喷雾效果，铅笔字效果，艺术画效果，等等。日后有时间我会继续对这个画板进行优化，增加一些新的功能同时欢迎大家留言提问或者提出批评建议。

