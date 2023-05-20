import {
    Vector2,
    Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const Filter = {

    uniforms: {

        renderTex: { value: null },  // 입력 텍스처
        edgeThreshold: { value: 0.1 }  // 엣지 감도

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
        uniform float edgeThreshold;  // 엣지 감도 설정 (0.1 ~ 1.0)

        const vec3 lum = vec3(0.2126, 0.7152, 0.0722);
        float luminance(vec3 color){
            return dot(lum, color);
        }

        vec4 pass(){
            ivec2 pix = ivec2(gl_FragCoord.xy);
            float s00 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(-1,1)).rgb);
            float s10 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(-1,0)).rgb);
            float s20 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(-1,-1)).rgb);
            float s01 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(0,1)).rgb);
            float s21 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(0,-1)).rgb);
            float s02 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(1,1)).rgb);
            float s12 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(1,0)).rgb);
            float s22 = luminance(texelFetchOffset(renderTex, pix, 0,ivec2(1,-1)).rgb);
            float sx = s00 + 2.0 * s10 + s20 - (s02 + 2.0 * s12 + s22);
            float sy = s00 + 2.0 * s01 + s02 - (s20 + 2.0 * s21 + s22);
            float g = sx * sx + sy * sy;
            // return vec4(vec3(luminance(texture(renderTex, vUv).rgb)), 1.0);
            if(g > edgeThreshold) return vec4(1.0,0.0,1.0,1.0);
            else return vec4(0.0, 0.0, 0.0, 1.0);
            
        }
        
        void main() {

        
        gl_FragColor = pass();
        }
        
    `

};
export { Filter };