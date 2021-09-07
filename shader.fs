precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float uSeuilMin;
uniform float uSeuilMax;

const float lut = 0.9;

uniform vec3 uLUT;

void main(void) {
	float alpha;
	vec4 texture = texture2D(uSampler, vec2(tCoords.s, tCoords.t));

	if(uSeuilMin < texture[0] && uSeuilMax > texture[0]) {
		alpha = texture[0];
	}
	else{
		alpha = 0.0;
	}	

	if (texture[0] < lut) {
		texture[0]=texture[0]/uLUT[0];
		texture[1] = 0.0;
		texture[2] = 0.0;
	}
	else {
		texture[0] = (1.0-texture[0])/lut;
		texture[1] = 0.0;
		texture[2] = 0.0;
	}

	gl_FragColor = vec4(vec3(texture), alpha);

	//vec3 rvb = uLUT[int(texture[0]*255.0)];
	//gl_FragColor = vec4(rvb, alpha);
}