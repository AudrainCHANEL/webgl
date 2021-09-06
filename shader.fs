precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

void main(void) {
	vec4 texture = texture2D(uSampler, vec2(tCoords.s, tCoords.t));
	
	gl_FragColor = vec4(vec3(texture), texture[0]);
}