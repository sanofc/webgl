var gl;
var canvas;
var shaderProgram;
var vertexBuffer;
var vertexColorBuffer;
var elementBuffer;

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
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	var vertices = [
		-0.5, 0.2, 0.0,
		-0.1, 0.2, 0.0,
		-0.5,-0.2, 0.0,
		-0.1,-0.2, 0.0,	
		 0.1, 0.2, 0.0,
		 0.5, 0.2, 0.0,
		 0.1,-0.2, 0.0,
		 0.5,-0.2, 0.0	
	];
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
	vertexBuffer.itemSize=3;
	vertexBuffer.numberOfItems=8;

	elementBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elementBuffer);
	var indices = [
		0,1,2,3,
		3,3,4,
		4,5,6,7];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),gl.STATIC_DRAW);
	elementBuffer.numberOfItems = 11;
}

function draw_background() {
	gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);	
}

function draw_triangle(){
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,vertexBuffer.itemSize,gl.FLOAT,false,0,0);
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute,1.0,1.0,0.0,1.0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elementBuffer);
	gl.drawElements(gl.TRIANGLE_STRIP,elementBuffer.numberOfItems,gl.UNSIGNED_SHORT,0);
}

function draw_edge(){
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute,0.0,0.0,0.0,1.0);
	gl.drawArrays(gl.LINE_STRIP,0,vertexBuffer.numberOfItems);

}

function startup(){
	canvas = document.getElementById("myGLCanvas");
	gl = createGLContext(canvas);
	setupShaders();
	setupBuffers();
	gl.clearColor(0.7,0.7,0.7,1.0);
	draw_background();
	draw_triangle();
	draw_edge();
}

function test(){
	if(document.check_form.draw_edge.checked){
		draw_background();
		draw_triangle();
		draw_edge();
	}else{
		draw_background();
		draw_triangle();
	}
}
