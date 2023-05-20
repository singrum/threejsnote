import {
    Vector2,
    Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const Filter2 = {

    uniforms: {

        renderTex: { value: null },  // 입력 텍스처
        Weight: {value: []},
        PixOffset : {value : [0,1,2,3,4]}

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
        
        uniform int PixOffset[5];
        uniform float Weight[5];

        vec4 pass(){
            ivec2 pix = ivec2(gl_FragCoord.xy);
            vec4 sum = texelFetch(renderTex, pix,0) * Weight[0];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(1,0)) * Weight[1];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(-1,0)) * Weight[1];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(2,0)) * Weight[2];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(-2,0)) * Weight[2];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(3,0)) * Weight[3];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(-3,0)) * Weight[3];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(4,0)) * Weight[4];
            sum += texelFetchOffset(renderTex, pix, 0, ivec2(-4,0)) * Weight[4];
            return sum;
        }
        
        void main() {

        
        gl_FragColor = pass();
        }
        
    `

};
export { Filter2 };