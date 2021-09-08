precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float uSeuilMin; //Le seuil d'intensité
uniform int uCouleur; //Le paramètre poly/mono chromatique
uniform vec3 uLut1; //Les LUT
uniform vec3 uLut2;
uniform vec3 uLut3;
uniform vec3 uLut4;
uniform vec3 uLut5;

void main(void) {
	//Pour récupérer les valeurs RGB (ou 3 fois nuances de gris) issues de l'image de texture (via le sampler)
	vec4 texture = texture2D(uSampler, vec2(tCoords.s, tCoords.t));

	if (uCouleur==1) { //Si on veut les (fausses) couleurs
		
		if (texture[0] > uSeuilMin) { //Si le pixel a l'intensité minimum recquise 
			//Alors on affichera le pixel dans une certaine couleur, complètement opaque
			if (texture[0] < 0.2) {
				gl_FragColor = vec4(vec3(uLut1), 1.0);
			}
			else {
				if (texture[0] < 0.4) {
					gl_FragColor = vec4(vec3(uLut2), 1.0);
				}
				else {
					if (texture[0] < 0.6) {
						gl_FragColor = vec4(vec3(uLut3), 1.0);
					}
					else {
						if (texture[0] < 0.8) {
							gl_FragColor = vec4(vec3(uLut4), 1.0);
						}
						else {
							gl_FragColor = vec4(vec3(uLut5), 1.0);
						}
					}
				}
			}
		}
		else {
			gl_FragColor = vec4(vec3(texture), 0.0);
		}
	}
	else { //sinon on est sur l'affiche en nuances de gris
		if(texture[0] >= uSeuilMin) {
			//meme conditions sur l'intensité des pixels
			gl_FragColor = vec4(vec3(texture), 1.0);
		}
		else{
			gl_FragColor = vec4(vec3(texture), 0.0);
		}
	}
}