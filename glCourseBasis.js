// =====================================================
/*Les variables déjà présentent*/
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

/*Les infos sur le jeu de données*/
var dernierIndex=360;
var nbcouche=360;
var premierIndex=0;

/*Les variables que nous avons rajouté*/
var texture = null;
var seuil = 0.9;
var couleur=0; //0 pour monochromatique et 1 pour fausses couleurs

/*Les LookUp Table pour les fausses couleurs (valeurs par défaut)*/
var lut1 = [1.0, 0.0, 0.0];
var lut2 = [0.0, 1.0, 0.0];
var lut3 = [0.0, 0.0, 1.0];
var lut4 = [1.0, 1.0, 0.0];
var lut5 = [0.0, 1.0, 1.0];

// =====================================================
function webGLStart() {
	/**Point d'entrée de WebGL */
	var canvas = document.getElementById("WebGL-test");
	canvas.onmousedown = handleMouseDown;//Les actions possibles et leur réaction
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;

	//Initialisation des buffers et du canvas webGL
	initGL(canvas);
	initBuffers();

	//Chargement de toutes les textures du jeu de données
	texture = new Array(nbcouche);
	for (let index=0 ; index <= (dernierIndex-premierIndex+1) ; index ++) {
		initTexture('./Scan300/scan'+(premierIndex+index)+'.jpg', index);
	}

	//Chargement des shaders
	loadShaders('shader');

	gl.clearColor(0.4, 0.4, 0.4, 1.0); //couleur de remplissage quand l'image est réinitialisée
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
	/**Initialisation d'un carré pouvant contenir une texture, ce carré fait 0,6 unité de large*/
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
function initTexture(textureFileName, index){
	/**Fonction de chargement d'une texture et envoie à la carte graphique + définition du sampleur*/

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
	/**Pour charger les shaders*/
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
	/**Initialisation des shaders et des variables que nous enverrons à la carte graphique (uniform et attrib) */
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

	//On rajoute les 5 LUT, le seui; d'affichage, una variable de selection du mode d'affichage (monochrome ou polychrome)
	shaderProgram.opacite = gl.getUniformLocation(shaderProgram, "uSeuil");
	shaderProgram.lut1 = gl.getUniformLocation(shaderProgram, "uLut1");
	shaderProgram.lut2 = gl.getUniformLocation(shaderProgram, "uLut2");
	shaderProgram.lut3 = gl.getUniformLocation(shaderProgram, "uLut3");
	shaderProgram.lut4 = gl.getUniformLocation(shaderProgram, "uLut4");
	shaderProgram.lut5 = gl.getUniformLocation(shaderProgram, "uLut5");
	shaderProgram.color = gl.getUniformLocation(shaderProgram, "uCouleur");
	
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
		//On envoie le seuil (float)
		gl.uniform1f(shaderProgram.opacite, seuil);
		//On envoie les 5 LUT (5* vec3)
		gl.uniform3fv(shaderProgram.lut1, lut1);
		gl.uniform3fv(shaderProgram.lut2, lut2);
		gl.uniform3fv(shaderProgram.lut3, lut3);
		gl.uniform3fv(shaderProgram.lut4, lut4);
		gl.uniform3fv(shaderProgram.lut5, lut5);
		//On envoie le parametre mono/poly-chrome
		gl.uniform1i(shaderProgram.color, couleur);
	}
}

// =====================================================
function drawScene() {
	/**Pour afficher tous les quads,
	 * On va afficher le même quad, mais avec une texture différente et une translation.
	 */
	gl.clear(gl.COLOR_BUFFER_BIT);

	espace = 0.6/nbcouche
	if(shaderProgram != null) {
		for (let index=premierIndex ; index <= dernierIndex ; index++) {
			mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
			mat4.identity(mvMatrix);
			mat4.translate(mvMatrix, [0.0, 0.0, -3.0]);
			mat4.multiply(mvMatrix, objMatrix);
			//Pour faire la translation et avoir un volume, et pas seulement un plan
			mat4.translate(mvMatrix, [0.0, 0.0, (index-premierIndex)*espace-0.3])

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			//On selectionne le buffer que l'on veut
			gl.bindTexture(gl.TEXTURE_2D, texture[index]);
			setMatrixUniforms();
			gl.drawElements(gl.TRIANGLE_FAN, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
}