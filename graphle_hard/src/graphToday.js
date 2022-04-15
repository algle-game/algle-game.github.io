				
function getCoords(){
	return coords;
}


function getAdjacencyList(){
	return graph;
}

function getNum(){
	return num;
}

function getNumSecretEdges(){
	var num_secret = 0;
	for (var i = 0; i < num; i++){
		for (var j = i+1; j < num; j++){
			 num_secret += graph[i][j];
		}
	}
	return  num_secret;
}


function compareArrays(a, b){
	if (a.length != b.length){return false;}
	for (var i = 0; i < a.length; i++){
		if (a[i] != b[i]){return false;}
	}
	return true;
}

function compareDegree(a, b){
	if (a.length != b.length){return false;}
	ca = 0;
	cb = 0;
	for (var i = 0; i < a.length; i++){
		ca += a[i];
		cb += b[i];
	}
	return ca == cb;
}

function compareGraph(input){
	var result = new Array(num);

	for (var i = 0; i < num; i++){
		result[i] = new Array(num).fill("black");
	}
	//Check if there are correct nodes or if their degree is correct
	for (var i = 0; i < num; i++){
		if (compareArrays(input[i], graph[i])){
			result[i][i] = "green";
		}else if (compareDegree(input[i], graph[i])){
			result[i][i] = "orange";
		}
	}
	
	//check if there are correct edges, or if their adjacent nodes have correct degree.
	for (var i = 0; i < num; i++){
		for (var j = i+1; j < num; j++){
			if (!input[i][j]){continue;}
			if (input[i][j] == graph[i][j]){
				result[i][j] = "green";
				result[j][i] = "green";
			}else{
				if((compareDegree(input[i],graph[i]) && compareDegree(input[j],graph[j])) ||
					(compareDegree(input[i],graph[j]) && compareDegree(input[j],graph[i]))){	
					result[i][j] = "orange";
					result[j][i] = "orange";
				}
			}
		}
	}

	//console.log(result);
	return result;
}