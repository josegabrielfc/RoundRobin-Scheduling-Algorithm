/**
 * crea un objetode tipo proceso que sea manipulable para las colas
 * @param {int} id  el id del proceso (Pid)
 * @param {int} at  en tiempo de entrada (Arraiving time)
 * @param {int} ext  el tiempo de ejecucion (Execution Time)
 * @returns {object} RR process object
 */
function RRprocess(id, at, ext, color) {
  this.id = id;
  this.at = at;
  this.ext = ext;
  this.totalduration = ext;
  this.realtimeBuffer = ext;
  this.color = color;
}

var processesCounter = 1;
var prlis = [];
var realTimeQueue = [];
var currentProcess;
var burstcounter;
var quantum;
var running = false;

function setup() {
  frameRate(12);
  burstcounter = 0;
  currentProcess = {};
  createCanvas(1170, 340);
  addcontainer();
  addTable();
  quantum = 0 | document.getElementById("inputQ").value;
}

function draw() {
  updateTables();
  if (running) {
    drawstuff();
  } else {   
    if(realTimeQueue.length == 0){
        background(225);
    }
  }
}

/**
 * dibuja lo eferente al canvas
 * @returns {any}
 */
function drawstuff() {
  drawPNames();
  prlis.forEach((element) => {
    if (element.at == burstcounter) {
      realTimeQueue.push(element);
      console.log("agregado a la RTQ");
    }
  });

  if (realTimeQueue.length > 0) {
    if (
      realTimeQueue[0].realtimeBuffer >
        realTimeQueue[0].totalduration - quantum &&
      realTimeQueue[0].totalduration - quantum >= 0
    ) {
      realTimeQueue[0].realtimeBuffer--;
    } else if (
      realTimeQueue[0].realtimeBuffer == 0 ||
      realTimeQueue[0].realtimeBuffer ==
        realTimeQueue[0].totalduration - quantum
    ) {      
      headToBack();
    } else if (
      realTimeQueue[0].realtimeBuffer > 0 &&
      realTimeQueue[0].totalduration - quantum < 0
    ) {
      realTimeQueue[0].realtimeBuffer--;
    }
  }
  drawlines();
  burstcounter++;
}

/**
 * dibuja las lineas de tiempo
 * @returns {any}
 */
function drawlines() {  
  strokeWeight(4);
  for (index = 1; index <= prlis.length; index++) {
    if (realTimeQueue.length > 0) {
      try {
        if (realTimeQueue[0].id == index) {
          drawRedLine(index,realTimeQueue[0].color);
        } else {
          drawWhiteLine(index);
        }
      } catch (error) {
        drawWhiteLine(index);
      }
    } else {
      drawWhiteLine(index);
    }
  }
}

/**
 * dibuja unalinea eferente al proceso con su color
 * @param {any} index
 * @param {any} color
 * @returns {any}
 */
function drawRedLine(index,color) {
  htime = getHTime();
  var x = 50 + map(burstcounter, 0, htime, 20, 300);
  var y = 29 * index;
  color2 = exToRGB(color);
  stroke(color2.r,color2.g, color2.b);
  line(x, y, x, y + 16);
  stroke(255);
}

/**
 * convierte exadecimal a rgb
 * @param {any} exColor
 * @returns {any}
 */
function exToRGB(exColor){
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(exColor); 
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


/**
 * dibuja las linear referentes a momentos en los que el proceso no
 * se esta ejecutando
 * @param {any} index
 * @returns {any}
 */
function drawWhiteLine(index) {
  htime = getHTime();
  var x = 50 + map(burstcounter, 0, htime, 20, 300);
  var y = 29 * index;
  stroke(255, 255, 255);
  line(x, y, x, y + 16);
}

/**
 * muestra la cola en tiempo real de los procesos
 * @returns {any}
 */
function headToBack() {
  // reiniciendo el buffer
  if (realTimeQueue.length > 0) {
    realTimeQueue[0].totalduration = realTimeQueue[0].realtimeBuffer;
    if (realTimeQueue[0].totalduration > 0) {
      var buffer = realTimeQueue[0];
      realTimeQueue.splice(0, 1);
      realTimeQueue.push(buffer);
    } else {
      realTimeQueue.splice(0, 1);
      //console.log("eliminado de la cabeza");
    }
  }
  // colocando el de mayor prioridad en la cola
  higestP = Math.max.apply(null,realTimeQueue.map(o => {return parseInt(o.prl);}));  
  prbuffer = realTimeQueue.filter(o => o.prl == higestP)[0];  
  if(prbuffer){
    realTimeQueue.splice(realTimeQueue.indexOf(prbuffer), 1);
    realTimeQueue.unshift(prbuffer);
    if(prbuffer.prl>1){prbuffer.prl--;}
  }
  
}

/**
 *dibuja los nobres P1,P2... en el canvas
 * @returns {any}
 */
function drawPNames() {
  prlis.forEach((process) => {
    textSize(32);
    text("P" + process.id, 9, 15 + 29 * (prlis.indexOf(process) + 1));
  });
}

/**
 * obtiene el tiempo maximo de ejecucion
 * @returns {any}
 */
function getHTime() {
  var res = -1;
  prlis.forEach((element) => {
    var at = parseInt("" + element.at);
    var ext = parseInt("" + element.ext);   
    res += ext;
  });
  res = res/prlis.length;// tiempo medio de ejecucion  
  return res+(2.4*prlis.length)*(map(quantum, 1, 1000, 5, 1));
}

/**
 * metodo que se ejecuta cuando el proceso se pausa
 * @returns {any}
 */
function drawPause() {
  clear();
  background(225);
  textFont("Georgia");
  textSize(32);
  text("Add processes to the list and then", 50, 130);
  text("Press start to see the Execution timeline", 50, 170);
  fill(0, 102, 153);
}

/**
 *metodo que coloca la tabla de procesos
 * @returns {any}
 */
function addTable() {
  tableContainer = createDiv();
  tableContainer.position(200, 420);
  tableContainer.size(600, 300);
  tableContainer.style("left", "22rem");
  tableContainer.addClass("tables-container");
  RRproclist = createDiv(`
    <table class="processT">
    <thead>
        <tr>
            <th>Pid</th>
            <th>Arriving time</th>
            <th>Execution time</th>
        </tr> 
    </thead> 
    <tbody id="processT">    
    </tbody>
    </table>`);
  RRproclist.addClass("processes-table");
  tableContainer.child(RRproclist);
  queue = createDiv(`
    <table class="processT"">
    <thead>
        <tr>
            <th>Real time Queue</th>
        </tr> 
    </thead> 
    <tbody id="processQ">    
    </tbody> 
    </table>`);
  queue.addClass("queue-table");
  tableContainer.child(queue);
}

/**
 * metodo que agrega el contenedor conde se coloca la mayoria de items
 * @returns {any}
 */
function addcontainer() {
  container = createDiv();
  container.position(1320, 0);
  container.style("top", "4rem");
  title = createP("<h1>Round Robin Scheduling</h1>");
  container.child(title);
  labelAT = createP("<p>Arriving Time (aT)</p>");
  container.child(labelAT);
  inputAT = createInput(null, "number");
  inputAT.id("inputAT");
  container.child(inputAT);
  LabelET = createP("<p>Execution time (xT)</p>");
  container.child(LabelET);
  inputET = createInput(null, "number");
  inputET.id("inputET");
  container.child(inputET);
  btnSend = createButton("Add Process", "").size(200, 60);
  btnSend.mousePressed(addProcess);
  btnSend.addClass("btn-send");
  container.child(btnSend);
  labelQ = createP("<p>OS Quantum</p>");
  container.child(labelQ);
  inputQ = createInput(10, "number");
  inputQ.id("inputQ");
  container.child(inputQ);
  btnPlay = createButton("start", "").size(200, 35);
  btnPlay.mousePressed(playRR);
  btnPlay.addClass("btn-send");
  container.child(btnPlay);
  btnPause = createButton("pause", "").size(200, 35);
  btnPause.mousePressed(pauseRR);
  btnPause.addClass("btn-send");
  container.child(btnPause);
  btnRestart = createButton("reset", "").size(200, 35);
  btnRestart.mousePressed(function () {
    resetThis();
  });
  btnRestart.addClass("btn-send");
  container.child(btnRestart);
  container.size(300, 850);
  container.addClass("form-Container");
}


/**
 * metodo para arancar
 * @returns {any}
 */
function playRR() {
  quantum = document.getElementById("inputQ").value;
  running = true;
}

/**
 * metodo para pausar
 * @returns {any}
 */
function pauseRR() {
  running = false;
}

/**
 * metodo para agregar un proceso
 * @returns {any}
 */
function addProcess() {
  inputAT = document.getElementById("inputAT").value;
  inputET = document.getElementById("inputET").value;
  if (inputAT && inputET) {
    newprocess = new RRprocess(
      processesCounter,
      inputAT,
      inputET,
      getRandomColor()
    );
    processesCounter++;
    prlis.push(newprocess);
  } else {
    alert("Los campos no deben estar vacios");
  }
}

/**
 * metodo para resetear el sistema
 * @returns {any}
 */
function resetThis() {
  processesCounter = 1;
  prlis = [];
  realTimeQueue = [];
  currentProcess = {};
  burstcounter = 0;
  quantum = 0 | document.getElementById("inputET").value;
  running = false;
}

/**
 * metodo para actualizar las tablas
 * @returns {any}
 */
function updateTables() {
  document.getElementById("processT").innerHTML = "";
  document.getElementById("processQ").innerHTML = "";
  for (i = 0; i < prlis.length; i++) {
    row = document.getElementById("processT").insertRow(i);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = prlis[i].id;
    cell2.innerHTML = prlis[i].at;
    cell3.innerHTML = prlis[i].ext;
  }
  for (j = 0; j < realTimeQueue.length; j++) {
    row = document.getElementById("processQ").insertRow(j);
    var cellP = row.insertCell(0);
    try {
      cellP.innerHTML = "P" + realTimeQueue[j].id+ '-' + realTimeQueue[j].realtimeBuffer;
    } catch (error) {      
    }
    
  }
}

/**
 * metodo para obtener un color aleatorio
 * @returns {any}
 */
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
