

// =====================================================
// Mouse management
// =====================================================
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var rotY = 0;
var rotX = 0;

// =====================================================
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback,
									/* DOMElement Element */ element)
         {
            window.setTimeout(callback, 1000/60);
         };
})();

// ==========================================
function tick() {
	requestAnimFrame(tick);
	drawScene();
}

// =====================================================
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

// =====================================================
function handleMouseDown(event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}


// =====================================================
function handleMouseUp(event) {
	mouseDown = false;
}


// =====================================================
function handleMouseMove(event) {
	if (!mouseDown) {
		return;
	}
	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;

	rotY += degToRad(deltaX / 2);
	rotX += degToRad(deltaY / 2);

	mat4.identity(objMatrix);
	mat4.rotate(objMatrix, rotX, [1, 0, 0]);
	mat4.rotate(objMatrix, rotY, [0, 1, 0]);

	lastMouseX = newX
	lastMouseY = newY;
}

// =====================================================
function seuillage(seuil_curseur, borne) {
	if (borne == 'inf') {
		document.getElementById("inf_value").innerHTML=seuil_curseur;
		seuil_inf = seuil_curseur;
	}
	else {
		document.getElementById("sup_value").innerHTML=seuil_curseur;
		seuil_sup = seuil_curseur;
	}
}

// =====================================================
function setLayer(inputvalue){
	premierIndex=inputvalue;
	dernierIndex=premierIndex;
	document.getElementById("change-couche").innerHTML = inputvalue;
}

// =====================================================
function changeView2D(){
	premierIndex = document.getElementById("change-couche").innerHTML;
	dernierIndex = premierIndex;
	document.getElementById("div-change-couche").style.display="block";
}

function changeView3D(){
	premierIndex=0;
	dernierIndex=360;
	document.getElementById("div-change-couche").style.display="none";
}

// =====================================================
function setCouleur(index, color){
	newColor = [];
	newColor.push(parseInt(color.substring(1,3), 16)/255);
	newColor.push(parseInt(color.substring(3,5), 16)/255);
	newColor.push(parseInt(color.substring(5), 16)/255);

	switch (index) {
		case 1 :
			lut1 = newColor;
			break;
		case 2 :
			lut2 = newColor;
			break;
		case 3 :
			lut3 = newColor;
			break;
		case 4 :
			lut4 = newColor;
			break;
		case 5 :
			lut5 = newColor;
			break;			
	}
}

//=====================================================
function setMonochromatique(inputValue){
	if(inputValue==1){
		document.getElementById("div-couleur").style.display="block";
	}
	else{
		document.getElementById("div-couleur").style.display="none";
	}

	couleur=inputValue;
}
