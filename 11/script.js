var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;
var vertexIndexBuffer;

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

function setupBuffers(){
	vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
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
	vertexPositionBuffer.itemSize = 3;
	vertexPositionBuffer.numberOfItems = 24;

	vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
	var vertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 6, 5,      4, 7, 6,    // Back face
		8, 9, 10,     8, 10, 11,  // Left face
		12, 13, 14,   12, 14, 15, // Right face
		16, 17, 18,   16, 18, 19, // Top face
		20, 22, 21,   20, 23, 22  // Bottom face
			];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices),gl.STATIC_DRAW);
	vertexIndexBuffer.itemSize = 1;
	vertexIndexBuffer.numberOfItems = 36;
}

function draw() {
	gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	mat4.perspective(projectionMatrix, Math.PI * (60/180), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	mat4.identity(modelViewMatrix);
	mat4.lookAt(modelViewMatrix,[8, 5, -10],[0, 0, 0],[0, 1, 0]);
	gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix, false, modelViewMatrix);
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 1.0, 1.0, 1.0);
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numberOfItems,gl.UNSIGNED_SHORT,0);

}

function startup(){
	canvas = document.getElementById("myGLCanvas");
	gl = createGLContext(canvas);
	setupShaders();
	setupBuffers();
	gl.clearColor(0.0,0.0,0.0,1.0);
	draw();
}

