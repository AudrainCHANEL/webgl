precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float uSeuilMin;
uniform int uCouleur;
uniform vec3 uLut1;
uniform vec3 uLut2;
uniform vec3 uLut3;
uniform vec3 uLut4;
uniform vec3 uLut5;
//const float lut = 0.9;

void main(void) {
	vec4 texture = texture2D(uSampler, vec2(tCoords.s, tCoords.t));

	if (uCouleur==1) {
		if (texture[0] > uSeuilMin) {
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
	else {
		if(texture[0] >= uSeuilMin) {
			gl_FragColor = vec4(vec3(texture), 1.0);
		}
		else{
			gl_FragColor = vec4(vec3(texture), 0.0);
		}
	}

	/*
	if (texture[0] < lut) {
		texture[0]=texture[0]/texture2D(uSamplerLUT, vec2(texture[0], 0))[0];
		texture[1] = 0.0;
		texture[2] = 0.0;
	}
	else {
		texture[0] = (1.0-texture[0])/lut;
		texture[1] = 0.0;
		texture[2] = 0.0;
	}*/

	//gl_FragColor = vec4(vec3(texture), alpha);
}