import {
    Vector2,
    Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const Filter = {

    uniforms: {

        renderTex: { value: null },  // 입력 텍스처

    },

    vertexShader: /* glsl */`
        varying vec2 vUv;
    
        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
            
    `,

    fragmentShader: /* glsl */`

        varying vec2 vUv;
    
        uniform sampler2D renderTex;
        const float strength = 0.05;
        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        vec4 pass(){
            ivec2 pix = ivec2(gl_FragCoord.xy);
            
            float grain = rand(gl_FragCoord.xy) * 2.0 - 1.0;
            vec4 color = texelFetch(renderTex, pix,0) + grain * strength;
            return color;
            
        }
        
        void main() {
            
        
        gl_FragColor = pass();
        }
        
    `

};
export { Filter };