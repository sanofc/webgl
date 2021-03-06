var gl;
var canvas;
var shaderProgram;
var vertexBuffer;

function createGLContext(canvas){
	var context = null;
	context = canvas.getContext("webgl");
	if(context){
		context.viewportWidth = canvas.width;
		context.viewportHeight = canvas.height;
	} else {
		alert("Failed to create WebGL context");
	}
	return context;
}

function loadShaderFromDOM(id){
	var shaderScript = document.getElementById(id);
	if(!shaderScript){
		return null;
	}

	var shaderSource = "";
	var currentChild = shaderScript.firstChild;
	while(currentChild){
		if(currentChild.nodeType == 3){
			shaderSource += currentChild.textContent;
		}
		currentChild = currentChild.nextSibling;
	}

	var shader;
	if(shaderScript.type == "x-shader/x-fragment"){
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}else if(shaderScript.type == "x-shader/x-vertex"){
		shader = gl.createShader(gl.VERTEX_SHADER);
	}else{
		return null;
	}

	gl.shaderSource(shader,shaderSource);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
		alert("Error compiling shader " + gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;

}

function setupShaders(){
	var vertexShader = loadShaderFromDOM("shader-vs");
	var fragmentShader = loadShaderFromDOM("shader-fs");
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram,vertexShader);
	gl.attachShader(shaderProgram,fragmentShader);
	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
		alert("Failed to setup shaders");
	}
	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,"aVertexPosition");
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,"aVertexColor");
	
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

}

function setupBuffers(){
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var vertices = [
		 0.0, 0.5, 0.0, 255,   0,   0, 255, // v0
		-0.5,-0.5, 0.0,   0, 255,    , 255, // v1
		 0.5,-0.5, 0.0,   0,   0, 255, 255  // v2
	];

	var nbrOfVertices = 3;
	var vertexSizeInBytes = 3 * Float32Array.BYTES_PER_ELEMENT + 4 * Uint8Array.BYTES_PER_ELEMENT;
	var vertexSizeInFloats = vertexSizeInBytes / Float32Array.BYTES_PER_ELEMENT;
	var buffer = new ArrayBuffer(nbrOfVertices * vertexSizeInBytes);
	var positionView = new Float32Array(buffer);
	var colorView = new Uint8Array(buffer);
	var positionOffsetInFloats = 0;
	var colorOffsetInBytes = 12;
	var k = 0;
	for(var i = 0 ; i < nbrOfVertices; i++){
		positionView[positionOffsetInFloats] = vertices[k];
		positionView[1+positionOffsetInFloats] = vertices[k+1];
		positionView[2+positionOffsetInFloats] = vertices[k+2];
		colorView[colorOffsetInBytes] = vertices[k+3];
		colorView[1+colorOffsetInBytes] = vertices[k+4];
		colorView[2+colorOffsetInBytes] = vertices[k+5];
		colorView[3+colorOffsetInBytes] = vertices[k+6];
		
		positionOffsetInFloats += vertexSizeInFloats;
		colorOffsetInBytes += vertexSizeInBytes;
		k += 7;
	}

	gl.bufferData(gl.ARRAY_BUFFER, buffer ,gl.STATIC_DRAW);
	vertexBuffer.itemSize = 3;
	vertexBuffer.colorSize = 4;
	vertexBuffer.numberOfItems = 3;
}

function draw() {
	gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,vertexBuffer.itemSize, gl.FLOAT, false, 16, 0);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,vertexBuffer.colorSize,gl.UNSIGNED_BYTE, true, 16, 12);
	gl.drawArrays(gl.TRIANGLES,0,vertexBuffer.numberOfItems);
}

function startup(){
	canvas = document.getElementById("myGLCanvas");
	gl = createGLContext(canvas);
	if(window.WebGLDebugUtils){
			gl = WebGLDebugUtils.makeDebugContext(gl);
	}
	setupShaders();
	setupBuffers();
	gl.clearColor(1.0,1.0,1.0,1.0);
	draw();
}

