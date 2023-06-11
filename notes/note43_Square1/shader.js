import {
	Vector2,
	Vector3,
    Vector4
} from '../../node_modules/three/build/three.module.js';

const Shader = {
    uniforms : {
        pointer : {value : null},
        unit : { value : null},
        damping : {value: null}

    },


    vertexShader : /* glsl */`
        

        varying vec2 vUv;


        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,



    fragmentShader : /* glsl */`

        uniform float unit;
        uniform vec2 pointer;
        uniform float damping;

        varying vec2 vUv;






        float mapLinear(float value, float inMin, float inMax, float outMin, float outMax) {
            return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
        }

        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        vec3 color(){
            float t;
            vec3 color;

            vec2 index = floor(vUv / unit);
            vec2 squareLen = unit - index * pointer * damping / 100.0;
            if(all(lessThan(abs(vUv - unit * (index + 0.5)), squareLen / 2.0))) color = vec3(1.0,1.0,1.0);
            else{discard;}
            
            
            
            return color;
        }
        
        

        void main() {
            vec3 fragColor = color();

            gl_FragColor = vec4(fragColor,1.0);
        }
    `
}


export {Shader};
