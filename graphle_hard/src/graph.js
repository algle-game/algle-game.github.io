var version = 0.2;
var num_tries = 0;
var N = 0
var svg = document.getElementById('area');
var svgNS = svg.namespaceURI;
var node = null;
var incMatrix = null;
var knownEdges = null;
const date = new Date();
const zeroPad = (num, places) => String(num).padStart(places, '0')
var num_secret_edges = getNumSecretEdges();

Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

window.onload = init();

function nodeClick(id){
	if (node == null){
		node = id;
		document.getElementById(node).setAttribute("fill", "blue");
	}else if (node == id){
		clear();
	}else if (incMatrix[node][id] == 0){
		if (num_secret_edges - getNumEdges() > 0){
			incMatrix[node][id] = 1;
			incMatrix[id][node] = 1;
			createEdge(parseInt(id) < parseInt(node) ? id : node, parseInt(id) < parseInt(node) ? node : id);
		}else{
			alert("No edges left. Remove an edge before inserting more edges");
		}
		clear();
	}
};

function createEdge(s, t){
	var edges = document.getElementById('edges');
	var line = document.createElementNS(svgNS, 'line');
	start = document.getElementById(s);
	target = document.getElementById(t);
	line.setAttribute("x1", start.getAttribute("cx"));
	line.setAttribute("y1", start.getAttribute("cy"));
	line.setAttribute("x2", target.getAttribute("cx"));
	line.setAttribute("y2", target.getAttribute("cy"));
	line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:2");
	id = s+"-"+t;
	line.setAttribute('id', id);
	line.setAttribute('onclick', "deleteEdge('"+id+"')");
	edges.appendChild(line);
	var nodes = document.getElementById('nodes');
	printNumEdgesToSVG();
};

function deleteEdge(id){
	var elem = id.split("-");
	incMatrix[elem[0]][elem[1]] = 0;
	incMatrix[elem[1]][elem[0]] = 0;
	document.getElementById(id).remove();
	printNumEdgesToSVG();
}

function clear(){
	if (node != null){
		document.getElementById(node).setAttribute("fill", "black");
		node = null;
	}
};

function clearAll(){
	for(var i = 0; i < N; i++){
		for(var j = i+1; j < N; j++){
			if (incMatrix[i][j]){
				var id = i+"-"+j;
				incMatrix[i][j] = 0;
				incMatrix[j][i] = 0;
				document.getElementById(id).remove();
			}
		}
	}
	clear();
}

function setKnownEdges(){
	if (knownEdges == null){return;}
	clearAll();
	//console.log(knownEdges + "");
	for (var i = 0; i < N; i++){
		for (var j = i+1; j < N; j++){
			if (knownEdges[i][j] == 1){
				incMatrix[i][j] = 1;
				incMatrix[j][i] = 1;
				createEdge(i, j);
			}
		}
	}
}

function createNode(x, y, r){
	var nodes = document.getElementById('nodes');
	var circ = document.createElementNS(svgNS, 'circle');
	circ.setAttribute('cx', x);
	circ.setAttribute('cy', y);
	circ.setAttribute('r', r);
	id = ""+N;
	circ.setAttribute('id', id)
	circ.setAttribute('onclick', "nodeClick('"+id+"')");
	nodes.appendChild(circ);	
	N += 1;
};

function initNodes(){
	rad = 3;
	var coords = getCoords();
	for (var i = 0; i < getNum(); i++){
		createNode(coords[i][0], coords[i][1], rad);
	}
	incMatrix = new Array(N)
	knownEdges = new Array(N);
	for (var i = 0; i < N; i++){
		incMatrix[i] = new Array(N).fill(0);
		knownEdges[i] = new Array(N).fill(0);
	}
};

function saveData(){
	//console.log(date.getFullYear() + zeroPad(date.getMonth()+1,2) + zeroPad(date.getDate()));
	localStorage.setItem("version", version);
	localStorage.setItem("date", date.getFullYear() + zeroPad(date.getMonth()+1,2) + zeroPad(date.getDate()));
	localStorage.setItem("tries", num_tries);
	var innerhtml = document.getElementById("try"+(num_tries)).innerHTML
	localStorage.setItem("try"+(num_tries), innerhtml);
	localStorage.setObj("knownEdges", knownEdges);
}

function loadData(){
	var today = date.getFullYear() + zeroPad(date.getMonth()+1,2) + zeroPad(date.getDate());
	if (today.localeCompare(localStorage.getItem("date")) == 0){
		num_tries = localStorage.getItem("tries");
		
		for (var i = 0; i < num_tries; i++){
			//console.log("Restoring Try " +(i+1));
			
			var div = document.createElement("div");
			div.setAttribute("class", "w3-center w3-block w3-border w3-quarter");
			var par = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			par.setAttribute('width',"100%")
			par.setAttribute('viewBox', "0 0 100 100")
			par.setAttribute('style', "max-width: 200px")
			par.setAttribute('xmlns', "http://www.w3.org/2000/svg")
			par.setAttribute('id', "try"+ (i+1));
			par.innerHTML = localStorage.getItem("try"+(i+1));
			div.appendChild(par);
			document.getElementById('try').insertBefore(div, document.getElementById("tryrest"));
		} 
		if (localStorage.getItem("knownEdges") != null){
			knownEdges = localStorage.getObj("knownEdges");
		}
	}
}

function init(){
	initNodes();
	//localStorage.clear();
	printNumEdgesToSVG();
	loadData();
};

function getNumEdges(){
	var num_edges = 0
	for (var i = 0; i < N; i++){
		for (var j = i+1; j < N; j++){
			num_edges += incMatrix[i][j];
		}
	}
	return num_edges;
}
function printNumEdgesToSVG(){
	var tex = document.getElementById("sequence");
	tex.innerHTML = "Edges left: " + (num_secret_edges - getNumEdges())
}

function check(){
	//console.log(sequence + " vs " + getDegreeListToday());
	if (num_secret_edges - getNumEdges() > 0){
		alert("There are edges missing")
		return;
	}
	colorMap = compareGraph(incMatrix);
	var valid = true;
	for (var i = 0; i < N; i++){
		for (var j = i+1; j < N; j++){
			if (incMatrix[i][j] == 0){continue;}
			if (colorMap[i][j].localeCompare("green") != 0){
				valid = false;
			}else{
				knownEdges[i][j] = 1;
			}	
		}
	}
	if (valid){
		alert("Congratulations! You found the secret Graph in " + (1+num_tries) + (num_tries == 0 ? " try!" : " tries!"));
	}
	drawTry(colorMap);
	saveData();
}

function drawTry(colorMap){
	var rad = 2.5;
	var div = document.createElement("div");
	div.setAttribute("class", "w3-center w3-block w3-border w3-quarter");
	var par = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	//var parNS = par.namespaceURI;
	var coords = getCoords();
	par.setAttribute('width',"100%")
	par.setAttribute('viewBox', "0 0 100 100")
	par.setAttribute('style', "max-width: 200px")
	par.setAttribute('xmlns', "http://www.w3.org/2000/svg")
	par.setAttribute('id', "try"+ (++num_tries));
	
	//Draw Edges
	for (var i = 0; i < N; i++){
		for (var j = i+1; j < N; j++){
			if(incMatrix[i][j]){
				var line = document.createElementNS(svgNS, 'line');
				line.setAttribute("x1", coords[i][0]);
				line.setAttribute("y1", coords[i][1]);
				line.setAttribute("x2", coords[j][0]);
				line.setAttribute("y2", coords[j][1]);
				line.setAttribute("style", "stroke:"+colorMap[i][j]+";stroke-width:1.5");	
				par.append(line);
			}
		}
	}
	
	//Create Nodes
	for (var i = 0; i < N; i++){
		var circ = document.createElementNS(svgNS, 'circle');
		circ.setAttribute('cx', coords[i][0]);
		circ.setAttribute('cy', coords[i][1]);
		circ.setAttribute('r', rad);
		circ.setAttribute('fill', colorMap[i][i]);
		par.append(circ);
	}
	div.appendChild(par);
	document.getElementById('try').insertBefore(div, document.getElementById("tryrest"));
}
