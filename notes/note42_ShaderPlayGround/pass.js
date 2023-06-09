import {
    Vector2,
    Vector3,
    Vector4
} from '../../node_modules/three/build/three.module.js';

const Filter = {

    uniforms: {

        renderTex: { value: null },  // 입력 텍스처
        iTime : {value: null},
        ratio : {value : null}

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
        uniform float iTime;
        uniform float ratio;




        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec3 permute(vec3 x) {
            return mod((34.0 * x + 1.0) * x, 289.0);
          }
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
        
        float noise(vec3 P){
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod(Pi0, 289.0);
          Pi1 = mod(Pi1, 289.0);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;
        
          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);
        
          vec4 gx0 = ixy0 / 7.0;
          vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        
          vec4 gx1 = ixy1 / 7.0;
          vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        
          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
        
          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;
        
          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);
        
          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
          return 2.2 * n_xyz;
        }

        

        vec3 gradient(vec3 color1, vec3 color2, float coord){
            float t = smoothstep(0.13,0.4,coord);
            vec3 color = mix(color1, color2, t);
            return color;
        }

        const float freq = 4.0;
        const float amp = 0.2;
        vec3 circleNoise(){
            
            vec2 coord = (vUv - vec2(0.5, 0.5));
            coord.x *= ratio;
            float dist = length(coord);
            float t = dist + noise(vec3(coord.xy * freq, iTime / 2.0)) * amp;
            
            return gradient( vec3(0.996, 0.949, 0.957),vec3(1, 0.325, 0.439), t);
            
        }

        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        const float strength = 0.07;

        vec3 grain(vec3 color){
            float grain = rand(vUv.xy) * 2.0 - 1.0;
            vec3 co = color + grain * strength;
            return co;
            
        }


        vec2 cellular(vec2 P) {
            #define K 0.142857142857 // 1/7
            #define Ko 0.428571428571 // 3/7
            #define jitter 1.0 // Less gives more regular pattern
            vec2 Pi = mod(floor(P), 289.0);
             vec2 Pf = fract(P);
            vec3 oi = vec3(-1.0, 0.0, 1.0);
            vec3 of = vec3(-0.5, 0.5, 1.5);
            vec3 px = permute(Pi.x + oi);
            vec3 p = permute(px.x + Pi.y + oi); // p11, p12, p13
            vec3 ox = fract(p*K) - Ko;
            vec3 oy = mod(floor(p*K),7.0)*K - Ko;
            vec3 dx = Pf.x + 0.5 + jitter*ox;
            vec3 dy = Pf.y - of + jitter*oy;
            vec3 d1 = dx * dx + dy * dy; // d11, d12 and d13, squared
            p = permute(px.y + Pi.y + oi); // p21, p22, p23
            ox = fract(p*K) - Ko;
            oy = mod(floor(p*K),7.0)*K - Ko;
            dx = Pf.x - 0.5 + jitter*ox;
            dy = Pf.y - of + jitter*oy;
            vec3 d2 = dx * dx + dy * dy; // d21, d22 and d23, squared
            p = permute(px.z + Pi.y + oi); // p31, p32, p33
            ox = fract(p*K) - Ko;
            oy = mod(floor(p*K),7.0)*K - Ko;
            dx = Pf.x - 1.5 + jitter*ox;
            dy = Pf.y - of + jitter*oy;
            vec3 d3 = dx * dx + dy * dy; // d31, d32 and d33, squared
            // Sort out the two smallest distances (F1, F2)
            vec3 d1a = min(d1, d2);
            d2 = max(d1, d2); // Swap to keep candidates for F2
            d2 = min(d2, d3); // neither F1 nor F2 are now in d3
            d1 = min(d1a, d2); // F1 is now in d1
            d2 = max(d1a, d2); // Swap to keep candidates for F2
            d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx; // Swap if smaller
            d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx; // F1 is in d1.x
            d1.yz = min(d1.yz, d2.yz); // F2 is now not in d2.yz
            d1.y = min(d1.y, d1.z); // nor in  d1.z
            d1.y = min(d1.y, d2.x); // F2 is in d1.y, we're done.notes/note40_Saturn/design.css notes/note40_Saturn/main.js notes/note40_Saturn/pass.js notes/note40_Saturn/Saturn.html notes/note40_Saturn/shader.js
            return sqrt(d1.xy);
        }

        vec3 filterBG(){
            ivec2 pix = ivec2(gl_FragCoord.xy);
            vec3 renderColor = texelFetch(renderTex, pix ,0).xyz;




            vec3 color;
            float s,t;
            s = vUv.x * ratio + 0.0 / 10.0;
            t = vUv.y;
            
            color = vec3(cellular(vec2(s,t) * 10.0).x);
            // if(cellular(vec2(s,t) * 10.0).x > 0.2){
            //     color = vec3(1.0,1.0,1.0);
            // }
            // else{color = vec3(0.0,0.0,0.0);}
            return color;
            
        }

        
        void main() {
            vec3 fragColor;
            fragColor = filterBG();
            gl_FragColor = vec4(fragColor, 1.0);
        }
        
    `

};
export { Filter };