export default /* glsl */`



varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;


void main() {
	vec3 lightPosition = vec3(1,1,1);
	float color = (dot(normalize(lightPosition - vPosition),vNormal) + 1.0) / 2.0;
	gl_FragColor = vec4(vec3(color), 1);
}







`;
