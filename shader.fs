
precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float alpha;



void main(void) {

	vec4 texture = 	texture2D(uSampler, vec2(tCoords.s, tCoords.t));

	texture[1] = texture[0];
	
	// if (texture[0]==texture[1] && texture[1]==texture[2]){
		gl_FragColor = vec4(texture);
	// }
	// else{
	// 	gl_FragColor = vec4(1.0,0.0,1.0, 1.0);
	// }
	

	
}

