import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const DiffusePerVertexShader = {
    uniforms : {
        LightPosition : {value : new Vector4(10,0,0, 1)}, /* w 값 0 이면 directional light */
        Kd : {value : new Vector3(1,1,1)},
        Ld : {value : new Vector3(1,1,1)},

    },
    vertexShader : /* glsl */`
        uniform vec4 LightPosition;
        uniform vec3 Kd;
        uniform vec3 Ld;
        varying vec3 LightIntensity;

        void main() {
            vec3 tnorm = normalize(normalMatrix * normal);
            vec4 camCoords = modelViewMatrix * vec4(position , 1.0);
            vec3 s = normalize(vec3(LightPosition - camCoords));
            
            LightIntensity = Ld * Kd * max(dot(s, tnorm), 0.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader : /* glsl */`
        varying vec3 LightIntensity;

        void main() {
            
            gl_FragColor = vec4(LightIntensity, 1.0);

        }
    `
}
export {DiffusePerVertexShader};