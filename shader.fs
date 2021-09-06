precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float uSeuil;

void main(void) {

	vec4 texture = texture2D(uSampler, vec2(tCoords.s, tCoords.t));

	if(uSeuil < texture[0]){
		gl_FragColor = vec4(vec3(texture), texture[0]);
	}
	else{
		gl_FragColor = vec4(vec3(texture), 0.0);
	}	
	
}