var gl;
var canvas;
var shaderProgram;
var vertexBuffer;
var vertexColorBuffer;

var modelViewMatrix;
var projectionMatrix;

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
	shaderProgram.uniformMVMatrix = gl.getUniformLocation(shaderProgram,"uMVMatrix");
	shaderProgram.uniformProjMatrix = gl.getUniformLocation(shaderProgram,"uPMatrix");

	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	modelViewMatrix = mat4.create();
	projectionMatrix = mat4.create();
	
}

function setupBuffers(){
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var vertices = [
		 0.0, 0.5, 0.0,
		-0.5,-0.5, 0.0,
		 0.5,-0.5, 0.0,
			];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.STATIC_DRAW);
	vertexBuffer.itemSize = 3;
	vertexBuffer.numberOfItems = 3;

	vertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexColorBuffer);
	var colors = [
		1.0,0.0,0.0,1.0,
		0.0,1.0,0.0,1.0,
		0.0,0.0,1.0,1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);
	vertexColorBuffer.itemSize=4;
	vertexColorBuffer.numberOfItems=3;
	
}

function draw() {
	gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	mat4.perspective(projectionMatrix, Math.PI * (60/180), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	mat4.identity(modelViewMatrix);
	mat4.lookAt(modelViewMatrix,[8, 5, -10],[0, 0, 0],[0, 1, 0]);
	console.log(projectionMatrix);
	console.log(modelViewMatrix);
	gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix, false, modelViewMatrix);
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES,0,vertexBuffer.numberOfItems);

}

function startup(){
	canvas = document.getElementById("myGLCanvas");
	gl = createGLContext(canvas);
	setupShaders();
	setupBuffers();
	gl.clearColor(0.0,0.0,0.0,1.0);
	draw();
}

