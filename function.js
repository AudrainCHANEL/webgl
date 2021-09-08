// =====================================================
function seuillage(seuil_curseur) {
    /**Pour changer la valeur du seuil d'intensité */
	document.getElementById("inf_value").innerHTML=seuil_curseur;
	seuil_inf = seuil_curseur;
}

// =====================================================
function setLayer(inputvalue){
    /**Pour changer la valeur de la couche que l'on veut afficher lors de l'affichage 2D */
	premierIndex=inputvalue;
	dernierIndex=premierIndex;
	document.getElementById("change-couche").innerHTML = inputvalue;
}

// =====================================================
function changeView2D(){
    /**Pour passer sur la vue 2D */
	premierIndex = document.getElementById("change-couche").innerHTML;
	dernierIndex = premierIndex;
	document.getElementById("div-change-couche").style.display="block";
}

function changeView3D(){
    /**Pour passer sur la vue 3D */
	premierIndex=0;
	dernierIndex=360;
	document.getElementById("div-change-couche").style.display="none";
}

// =====================================================
function setCouleur(index, color){
    /**Pour changer la couleur d'une des fausses couleurs */
    //On convertit la valeur hexadecimale en tableau de réel.
	newColor = [];
	newColor.push(parseInt(color.substring(1,3), 16)/255);
	newColor.push(parseInt(color.substring(3,5), 16)/255);
	newColor.push(parseInt(color.substring(5), 16)/255);

    //Puis on mets la nouvelle valeur dans la bonne LUT
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
    /**Pour passer de la vue mono à polychromatique
     * On prend 1 pour les couleurs,
     * On prend 0 pour les nuances de gris.
    */
	if(inputValue==1){ 
		document.getElementById("div-couleur").style.display="block";
	}
	else{
		document.getElementById("div-couleur").style.display="none";
	}

	couleur=inputValue;
}