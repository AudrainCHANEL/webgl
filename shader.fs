
precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float alpha;



void main(void) {

	vec4 texture = 	texture2D(uSampler, vec2(tCoords.s, tCoords.t));
	
	texture[3] = texture[0];

	gl_FragColor = vec4(texture);
}

