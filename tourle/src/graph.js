var version = 0.2;
var num_tries = 0;
var N = 0
var svg = document.getElementById('area');
var svgNS = svg.namespaceURI;
var node = null;
var incMatrix = null;
const date = new Date();
const zeroPad = (num, places) => String(num).padStart(places, '0')

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
		incMatrix[node][id] = 1;
		incMatrix[id][node] = 1;
		createEdge(parseInt(id) < parseInt(node) ? id : node, parseInt(id) < parseInt(node) ? node : id);
		
		clear();
		node = id;
		document.getElementById(node).setAttribute("fill", "blue");
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
};

function deleteEdge(id){
	var elem = id.split("-");
	incMatrix[elem[0]][elem[1]] = 0;
	incMatrix[elem[1]][elem[0]] = 0;
	document.getElementById(id).remove();
	clear();
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
	localStorage.setItem("version_tour", version);
	localStorage.setItem("date_tour", date.getFullYear() + zeroPad(date.getMonth()+1,2) + zeroPad(date.getDate()));
	localStorage.setItem("tries_tour", num_tries);
	var innerhtml = document.getElementById("try"+(num_tries)).innerHTML
	localStorage.setItem("try_tour"+(num_tries), innerhtml);
}

function loadData(){
	var today = date.getFullYear() + zeroPad(date.getMonth()+1,2) + zeroPad(date.getDate());
	if (today.localeCompare(localStorage.getItem("date_tour")) == 0){
		num_tries = localStorage.getItem("tries_tour");
		
		for (var i = 0; i < num_tries; i++){
			//console.log("Restoring Try " +(i+1));
			
			var div = document.createElement("div");
			div.setAttribute("class", "w3-center w3-block w3-border w3-quarter");
			var par = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			par.setAttribute('width',"100%")
			par.setAttribute('viewBox', "-10 -10 140 140")
			par.setAttribute('style', "max-width: 200px")
			par.setAttribute('xmlns', "http://www.w3.org/2000/svg")
			par.setAttribute('id', "try"+ (i+1));
			par.innerHTML = localStorage.getItem("try_tour"+(i+1));
			div.appendChild(par);
			document.getElementById('try').insertBefore(div, document.getElementById("tryrest"));
		} 
	}
}

function init(){
	initNodes();
	//localStorage.clear();
	loadData();
};

function getLocalDistance(){
	dist = 0;
	coords = getCoords();
	for (var i = 0; i < N; i++){
		for (var j = i+1; j < N; j++){
			if (incMatrix[i][j]){
				dist += Math.sqrt((coords[i][0]-coords[j][0])**2 + (coords[i][1]-coords[j][1])**2);
				//console.log("i: " + coords[i] + ", j: " + coords[j] + ", dist: " + dist);
			}
		}
	}
	return dist;
}

function getNumEdges(){
	num_edges = 0;
	for (var i = 0; i < N; i++){
		for (var j = i+1; j < N; j++){
			num_edges += incMatrix[i][j]			
		}
	}
	return num_edges;
}

function isConnected(){
	var R = []
	var Y = [0]
	while (Y.length > 0){
		el = Y.pop();
		for (var i = 0; i < N; i++){
			if (incMatrix[i][el] && !R.includes(i)){
				Y.push(i);
				R.push(i);
			}
		}
	}
	return R.length == N;
}

function isValid(){
	for (var i = 0; i < N; i++){
		degree = 0;
		for (var j = 0; j < N; j++){
			degree += incMatrix[i][j];
		}
		if (degree != 2){return false;}
	}
	return isConnected();
}

function check(){
	if (!isValid()){
		alert("You do not have a tour!");
		return;
	}
	var dist = getDistance();
	var localDist = getLocalDistance();
	
	if (localDist - dist < 0.001 && localDist - dist > -0.001){
		alert("Wow! You found the shortest tour in " + (1+num_tries) + (num_tries == 0 ? " try!" : " tries!"));
	}
	drawTry((100*(localDist/dist-1)).toFixed(2));
	saveData();
}

function drawTry(error){
	var rad = 2.5;
	var div = document.createElement("div");
	div.setAttribute("class", "w3-center w3-block w3-border w3-quarter");
	var par = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	//var parNS = par.namespaceURI;
	var coords = getCoords();
	par.setAttribute('width',"100%")
	par.setAttribute('viewBox', "-10 -10 140 140")
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
				line.setAttribute("style", "stroke:black;stroke-width:1.5");	
				par.append(line);
			}
		}
	}
	
	var tex = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	tex.setAttribute("x", 0);
	tex.setAttribute("y", 120);
	tex.setAttribute("font-size", "9pt")
	tex.innerHTML = error + "% longer";
	par.append(tex);
	
	//Create Nodes
	for (var i = 0; i < N; i++){
		var circ = document.createElementNS(svgNS, 'circle');
		circ.setAttribute('cx', coords[i][0]);
		circ.setAttribute('cy', coords[i][1]);
		circ.setAttribute('r', rad);
		circ.setAttribute('fill', "black");
		par.append(circ);
	}
	div.appendChild(par);
	document.getElementById('try').insertBefore(div, document.getElementById("tryrest"));
}
