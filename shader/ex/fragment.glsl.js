export default /* glsl */`



varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;


void main() {
	vec3 color1 = vec3(1,1,0);
	vec3 color2 = vec3(1,0,1);
	vec3 lightPos = vec3(1,1,1);
	vec3 lightDir = normalize(lightPos - vPosition);
	float brightness = (dot(lightDir, vNormal) + 1.0) / 2.0;
	vec3 color = mix(color1,color2, vPosition.z) * brightness;
	
	gl_FragColor = vec4(mix(color1,color2, (vPosition.z+ 0.25) / 0.5), 1.0);

}







`;
