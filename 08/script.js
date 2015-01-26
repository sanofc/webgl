var gl;
var canvas;
var shaderProgram;
var squareVertexBuffer;
var squareElementBuffer;
var circleVertexBuffer;
var circleVertexBuffer;
var draw_edge;

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
	squareVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,squareVertexBuffer);
	var squareVertices = [
		-0.75, 0.5, 0.0,
		 0.75, 0.5, 0.0,
		-0.75,-0.5, 0.0,
		 0.75,-0.5, 0.0,	
	];
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(squareVertices),gl.STATIC_DRAW);
	squareVertexBuffer.itemSize=3;
	squareVertexBuffer.numberOfItems=4;

	squareElementBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,squareElementBuffer);
	var squareIndices = [
		0,1,2,3
		];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(squareIndices),gl.STATIC_DRAW);
	squareElementBuffer.numberOfItems = 4; 

	circleVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,circleVertexBuffer);
	var circleVertices = [
		 0.0, 0.0, 0.0,
	];

	var div = 360;
	var rad = 0.3;

	for(var i = 0; i <= div; i++){
		circleVertices.push(Math.sin(Math.PI * i / (div / 2)) * rad);
		circleVertices.push(Math.cos(Math.PI * i / (div / 2)) * rad);
		circleVertices.push(0.0);
	}

	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(circleVertices),gl.STATIC_DRAW);
	circleVertexBuffer.itemSize=3;
	circleVertexBuffer.numberOfItems= div + 2;

	circleElementBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,circleElementBuffer);
	var circleIndices = [
		0
	];

	for(var i = 1; i <= div + 1; i++){
		circleIndices.push(i);
	}


	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(circleIndices),gl.STATIC_DRAW);
	circleElementBuffer.numberOfItems= div + 2;
}

function draw(){
	gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);	

	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER,squareVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,squareVertexBuffer.itemSize,gl.FLOAT,false,0,0);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute,1.0,1.0,1.0,1.0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,squareElementBuffer);
	gl.drawElements(gl.TRIANGLE_STRIP,squareElementBuffer.numberOfItems,gl.UNSIGNED_SHORT,0);

	gl.bindBuffer(gl.ARRAY_BUFFER,circleVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,circleVertexBuffer.itemSize,gl.FLOAT,false,0,0);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute,1.0,0.0,0.0,1.0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,circleElementBuffer);
	gl.drawElements(gl.TRIANGLE_FAN,circleElementBuffer.numberOfItems,gl.UNSIGNED_SHORT,0);

}

function startup(){
	canvas = document.getElementById("myGLCanvas");
	gl = createGLContext(canvas);
	setupShaders();
	setupBuffers();
	gl.clearColor(0.7,0.7,0.7,1.0);
	draw();
}

