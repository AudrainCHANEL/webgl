var dernierIndex = 360;
var nbcouche= 361;
var premierIndex = 0;
// =====================================================
var gl;
var shadersLoaded = 0;
var vertShaderTxt;
var fragShaderTxt;
var shaderProgram = null;
var vertexBuffer;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var objMatrix = mat4.create();
mat4.identity(objMatrix);

var texture = null;

var seuil_inf = 0.9;
var seuil_sup = 1.0;
var lut=getLUT();

// =====================================================
function webGLStart() {
	var canvas = document.getElementById("WebGL-test");
	canvas.onmousedown = handleMouseDown;//Les actions possibles et leur réaction
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;

	initGL(canvas);

	initBuffers();

	texture = new Array(nbcouche);
	for (let index=0 ; index <= (dernierIndex-premierIndex+1) ; index ++) {
		initTexture('./Scan300/scan'+(premierIndex+index)+'.jpg', index);
	}

	loadShaders('shader');

	gl.clearColor(0.7, 0.7, 0.7, 1.0); //couleur de remplissage quand l'image est réinitialisée
	gl.enable(gl.DEPTH_TEST);//initialisation de la gestion de la profondeur

//	drawScene();
	tick();
}

// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("experimental-webgl");//Comment récuperer un id pour avoir les fct de la carte graphique
		gl.viewportWidth = canvas.width;//taille du canvas
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);//Pour dire où on veut dessiner, et donc on peut le découper
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);//###
	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}

// =====================================================
function initBuffers() {
	// Vertices (array)
	vertices = [
		-0.3, -0.3, 0.0,
		-0.3,  0.3, 0.0,
		 0.3,  0.3, 0.0,
		 0.3, -0.3, 0.0];
	vertexBuffer = gl.createBuffer();//on crée un buffer et on recup l'id
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);//je l'active, je travaille mtn dessus
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);//J'envoie des données au buffer sur lequel je travaille
	vertexBuffer.itemSize = 3;
	vertexBuffer.numItems = 4;

	// Texture coords (array)
	texcoords = [ 
		/*
		Coordonnées pour la texture sur la surface
		C'est toujours entre 0 et 1
		Ordre des sommets (on doit avoir autant de points que dans le vertex)
		*/
		  1.0, 0.0,
		  1.0, 1.0,
		  0.0, 1.0,
		  0.0, 0.0 ];
	texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
	texCoordBuffer.itemSize = 2;
	texCoordBuffer.numItems = 4;

	// Index buffer (array)
	var indices = [ 0, 1, 2, 3];
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	indexBuffer.itemSize = 1;
	indexBuffer.numItems = indices.length;
}

// =====================================================
function initTexture(textureFileName, index)
{
	var texImage = new Image();
	texImage.src = textureFileName;

	texture[index] = gl.createTexture();//Creation et recuperation d'id
	texture[index].image = texImage;

	texImage.onload = function () {//On traite la lecture
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, texture[index]);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture[index].image); //j'envoie l'image sur la carte graphique
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //Pour l'interpolation (pck les pixels de la texture ne tombent jamais parafitement sur les pixels de la forme)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //peut aussi etre gl.NEAREST au lieu de gl.LINEAR
		gl.uniform1i(shaderProgram.samplerUniform, 0); //Utilisation d'un sampleur pour acceder au pixel de la texture
		gl.activeTexture(gl.TEXTURE0);	}
}


// =====================================================
function loadShaders(shader) {
	loadShaderText(shader,'.vs');
	loadShaderText(shader,'.fs');
}

// =====================================================
function loadShaderText(filename,ext) {   // technique car lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
			if(ext=='.vs') { vertShaderTxt = xhttp.responseText; shadersLoaded ++; }
			if(ext=='.fs') { fragShaderTxt = xhttp.responseText; shadersLoaded ++; }
			if(shadersLoaded==2) {
				initShaders(vertShaderTxt,fragShaderTxt);
				shadersLoaded=0;
			}
    }
  }
  xhttp.open("GET", filename+ext, true);
  xhttp.send();
}

// =====================================================
function initShaders(vShaderTxt, fShaderTxt) {

	vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vshader, vShaderTxt);
	gl.compileShader(vshader);
	if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(vshader));
		return null;
	}

	fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fshader, fShaderTxt);
	gl.compileShader(fshader);
	if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(fshader));
		return null;
	}

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vshader);
	gl.attachShader(shaderProgram, fshader);

	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.texCoordsAttribute = gl.getAttribLocation(shaderProgram, "texCoords");
	gl.enableVertexAttribArray(shaderProgram.texCoordsAttribute);
	
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	shaderProgram.opaciteinf = gl.getUniformLocation(shaderProgram, "uSeuilMin");
	gl.uniform1f(shaderProgram.opaciteinf, seuil_inf);

	shaderProgram.opacitesup = gl.getUniformLocation(shaderProgram, "uSeuilMax");
	gl.uniform1f(shaderProgram.opacitesup, seuil_sup);
	
	shaderProgram.lut = gl.getUniformLocation(shaderProgram, "uLUT");
	gl.uniform3fv(shaderProgram.lut, lut);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
     	vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.texCoordsAttribute,
      	texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
}


// =====================================================
function setMatrixUniforms() {
	if(shaderProgram != null) {
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
		gl.uniform1f(shaderProgram.opaciteinf, seuil_inf);
		gl.uniform1f(shaderProgram.opacitesup, seuil_sup);
	}
}

// =====================================================
function getLUT() {
	spot = [0.3, 0.5, 0.8];
	return spot;
}


// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	espace = 0.6/nbcouche
	if(shaderProgram != null) {
		for (let index=premierIndex ; index <= dernierIndex ; index++) {
			mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
			mat4.identity(mvMatrix);
			mat4.translate(mvMatrix, [0.0, 0.0, -3.0]);
			mat4.multiply(mvMatrix, objMatrix);
			mat4.translate(mvMatrix, [0.0, 0.0, (index-premierIndex)*espace-0.3])

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.bindTexture(gl.TEXTURE_2D, texture[index]);
			setMatrixUniforms();
			gl.drawElements(gl.TRIANGLE_FAN, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
}