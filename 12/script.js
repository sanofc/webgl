"use strict";
var gl;
var canvas;
var shaderProgram;

var squareVertexPositionBuffer;
var squareVertexIdexBuffer;
var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;
var bathtubVertexPositionBuffer;
var bathtubVertexIndexBuffer;

var modelViewMatrix;
var projectionMatrix;
var modelViewMatrixStack;

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

	modelViewMatrix = mat4.create();
	projectionMatrix = mat4.create();
	modelViewMatrixStack = [];
}

function setupFloorBuffers(){
	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);

	var floorVertexPosition = [
		1.0, 0.0, 1.0,
		1.0, 0.0,-1.0,
		-1.0, 0.0,-1.0,
		-1.0, 0.0, 1.0
			];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexPosition),gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numberOfItems = 4;

	squareVertexIdexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIdexBuffer);
	var floorVertexIndices = [0,1,2,3];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices),gl.STATIC_DRAW);
	squareVertexIdexBuffer.itemSize = 1;
	squareVertexIdexBuffer.numberOfItems = 4;
}

function setupCubeBuffers(){
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	var vertices= [
		// Front face
		1.0,  1.0,  1.0, //v0
		-1.0,  1.0,  1.0, //v1
		-1.0, -1.0,  1.0, //v2
		1.0, -1.0,  1.0, //v3

		// Back face
		1.0,  1.0, -1.0, //v4
		-1.0,  1.0, -1.0, //v5
		-1.0, -1.0, -1.0, //v6
		1.0, -1.0, -1.0, //v7
		// Left face
		-1.0,  1.0,  1.0, //v8
		-1.0,  1.0, -1.0, //v9
		-1.0, -1.0, -1.0, //v10
		-1.0, -1.0,  1.0, //v11

		// Right face
		1.0,  1.0,  1.0, //12
		1.0, -1.0,  1.0, //13
		1.0, -1.0, -1.0, //14
		1.0,  1.0, -1.0, //15

		// Top face
		1.0,  1.0,  1.0, //v16
		1.0,  1.0, -1.0, //v17
		-1.0,  1.0, -1.0, //v18
		-1.0,  1.0,  1.0, //v19

		// Bottom face
		1.0, -1.0,  1.0, //v20
		1.0, -1.0, -1.0, //v21
		-1.0, -1.0, -1.0, //v22
		-1.0, -1.0,  1.0, //v23
		];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numberOfItems = 24;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	var vertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 6, 5,      4, 7, 6,    // Back face
		8, 9, 10,     8, 10, 11,  // Left face
		12, 13, 14,   12, 14, 15, // Right face
		16, 17, 18,   16, 18, 19, // Top face
		20, 22, 21,   20, 23, 22  // Bottom face
			];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices),gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numberOfItems = 36;

}

function setupBathtubBuffers(){
	bathtubVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bathtubVertexPositionBuffer);
	var vertices= [
		// Front face
		0.9,  0.1,  1.0, //v0
		0.9,  0.1,  -1.0, //v1
		-0.9, 0.1,  -1.0, //v2
		-0.9, 0.1,  1.0, //v3

		// Back face
		1.0,  0.0, 1.0, //v4
		1.0,  0.0, -1.0, //v5
		-1.0, 0.0, -1.0, //v6
		-1.0, 0.0, 1.0, //v7

		// Left face
		0.9,  0.1, -1.0,  //v8
		-0.9, 0.1, -1.0,  //v9
		-1.0, 0.0, -1.0,  //v10
		1.0,  0.0, -1.0,  //v11

		// Right face
		0.9, 0.1, 1.0, //12
		-0.9, 0.1, 1.0, //13
		-1.0, 0.0, 1.0,  //14
		1.0,  0.0, 1.0,  //15

		// Top face
		0.9,  0.1,  1.0, //v16
		1.0,  0.0, 1.0, //v17
		1.0,  0.0, -1.0, //v18
		0.9,  0.1,  -1.0, //v19

		// Bottom face
		-0.9,  0.1,  1.0, //v20
		-1.0, 0.0, 1.0,  //v21
		-1.0, 0.0, -1.0, //v22
		-0.9, 0.1,  -1.0 //v23
			];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.STATIC_DRAW);
	bathtubVertexPositionBuffer.itemSize = 3;
	bathtubVertexPositionBuffer.numberOfItems = 24;

	bathtubVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bathtubVertexIndexBuffer);
	var vertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 6, 5,      4, 7, 6,    // Back face
		8, 9, 10,     8, 10, 11,  // Left face
		12, 13, 14,   12, 14, 15, // Right face
		16, 17, 18,   16, 18, 19, // Top face
		20, 22, 21,   20, 23, 22  // Bottom face
			];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices),gl.STATIC_DRAW);
	bathtubVertexIndexBuffer.itemSize = 1;
	bathtubVertexIndexBuffer.numberOfItems = 36;

}



function setupBuffers(){
	setupFloorBuffers();
	setupCubeBuffers();
	setupBathtubBuffers();
}

function drawSquare(){
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,squareVertexPositionBuffer.itemSize,gl.FLOAT,false,0,0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,squareVertexIdexBuffer);
	gl.drawElements(gl.TRIANGLE_FAN,squareVertexIdexBuffer.numberOfItems,gl.UNSIGNED_SHORT,0);
}

function drawFloor(){
  mat4.scale(modelViewMatrix,modelViewMatrix,[ 5.0 , 0.0,  5.0]);
	uploadModelViewMatrixToShader();
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 0.0, 0.0, 1.0);
	drawSquare();
}

function drawWater(){
  mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,1.6,0.0]);
  mat4.scale(modelViewMatrix,modelViewMatrix,[ 2.0, 0.0, 2.0]);
	uploadModelViewMatrixToShader();
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 0.0, 0.0, 1.0, 1.0);
	drawSquare();
}

function drawCube(){
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 1.0, 1.0, 1.0);
	gl.bindBuffer(gl.ARRAY_BUFFER,cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,cubeVertexIndexBuffer);
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numberOfItems,gl.UNSIGNED_SHORT,0);
}

function drawBathtub(){
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 0.7, 0.5, 0.0, 1.0);
	gl.bindBuffer(gl.ARRAY_BUFFER,bathtubVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,bathtubVertexPositionBuffer.itemSize, gl.FLOAT, false , 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bathtubVertexIndexBuffer);
	gl.drawElements(gl.TRIANGLES, bathtubVertexIndexBuffer.numberOfItems, gl.UNSIGNED_SHORT,0);
}

function pushModelViewMatrix(){
	var copyMatrix = mat4.clone(modelViewMatrix);			
	modelViewMatrixStack.push(copyMatrix);
}

function popModelViewMatrix(){
	if(modelViewMatrixStack.length == 0){
		throw "Error modelViewMatrixStack is empty";	
	}	
	modelViewMatrix = modelViewMatrixStack.pop();
}

function uploadProjectionMatrixToShader(){
	gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix, false, projectionMatrix);	
}

function uploadModelViewMatrixToShader(){
	gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix,false, modelViewMatrix);
}

function drawBath(){
	
	//front,back face
	for(var i = -2; i <= 2; i+=4){
		pushModelViewMatrix();
		mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,1.0,-i ]);
		mat4.rotate(modelViewMatrix,modelViewMatrix,  Math.PI * 90/180 ,[i ,0.0,0.0]); 
		mat4.scale(modelViewMatrix,modelViewMatrix,[ 2.0 , 2.0,  1.0]);
		uploadModelViewMatrixToShader();
		drawBathtub();
		popModelViewMatrix();
	}

	//right,left face
  for(var i = -2; i <= 2; i+=4){
		pushModelViewMatrix();
		mat4.translate(modelViewMatrix,modelViewMatrix,[i ,1.0,0.0]);
		mat4.rotate(modelViewMatrix,modelViewMatrix,Math.PI * 90/180 ,[0,-i,0]); 
		mat4.rotate(modelViewMatrix,modelViewMatrix,Math.PI * 90/180 ,[1,0,0]); 
		mat4.scale(modelViewMatrix,modelViewMatrix,[ 2.0 , 2.0,  1.0]);
		uploadModelViewMatrixToShader();
		drawBathtub();
		popModelViewMatrix();
	}

}



function draw() {
	gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(projectionMatrix, Math.PI * (60/180), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	mat4.identity(modelViewMatrix);
	mat4.lookAt(modelViewMatrix,vec3.scale([],[8, 5, 10],1.0),[0, 0, 0],[0, 1, 0]);
	uploadProjectionMatrixToShader();
	pushModelViewMatrix();
	drawFloor();
	popModelViewMatrix();
	pushModelViewMatrix();
	drawBath();
	popModelViewMatrix();
	pushModelViewMatrix();
	drawWater();
	popModelViewMatrix();

}

function startup(){
	canvas = document.getElementById("myGLCanvas");
	gl = createGLContext(canvas);
	setupShaders();
	setupBuffers();
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.enable(gl.DEPTH_TEST);
	draw();
}

