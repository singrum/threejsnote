import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const Shader = {
    uniforms : {
        
        Light : {
            value :{
                Position : new Vector4(-13,-10,27),
                La : new Vector3(0.6,0.6,0.6),
                Ld : new Vector3(1.0,1.0,1.0),
                Ls : new Vector3(1.0,1.0,1.0),
            }
        },
        Material : {
            value :{
                Ka : new Vector3(0.98, 0.451, 0.965),
                Kd : new Vector3(0.98, 0.451, 0.965),
                Ks : new Vector3(1,1,1),
                Shininess : 100,
            }
        },
        iResolution : {
            value : {
                x : window.innerWidth,
                y : window.innerHeight
            }
        },
        iTime : {value : null},
        normalMap : {value : null},
        uvMap : {value : null},



    },
    vertexShader : /* glsl */`
        

        /* out */
        varying vec3 LightIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;


        void main() {
            vPosition = position;
            vNormal = normal;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
        }
    `,
    fragmentShader : /* glsl */`
        #define PI 3.1415926536


        uniform struct LightInfo {
            vec4 Position;
            vec3 La;
            vec3 Ld;
            vec3 Ls;
        } Light;
        uniform struct MaterialInfo{
            vec3 Ka;
            vec3 Kd;
            vec3 Ks;
            float Shininess;
        } Material;
        uniform float iTime;
        uniform struct coord{float x; float y;} iResolution;

        varying vec3 LightIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform sampler2D NormalMap;
        uniform sampler2D uvMap;






        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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

        vec3 phongModel(vec3 color){
            vec3 ambient = Light.La * color;
            vec3 s = normalize(Light.Position.xyz - vPosition);
            float sDotN = max(dot(s,vNormal), 0.0);
            vec3 diffuse = Light.Ld * color * sDotN;
            vec3 spec = vec3(0.0);
            if(sDotN > 0.0){
                vec3 v = normalize(cameraPosition+vPosition.xyz);
                vec3 r = reflect(-s,vNormal);
                spec = Light.Ls * Material.Ks * pow(max(dot(r,v), 0.0), Material.Shininess);
            }
            return ambient + diffuse ;
        }





        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        const float strength = 0.04;

        vec3 grain(vec3 color){
            float grain = rand(vUv.xy) * 2.0 - 1.0;
            vec3 co = color + grain * strength;
            return co;
            
        }
        

        vec3 gradient(vec3 color1, vec3 color2){
            return mix(color1, color2, vPosition.z/22.0);
            // return smoothstep(color1, color2, vec3(1.0));
        }

        vec3 applyTex(){
            return texture2D(uvMap, vUv).xyz;
        }


        vec3 wave (vec3 color1, vec3 color2, float coord){
            float t = 1.0 - abs(fract(coord * 10.0) * 2.0 - 1.0);
            t = smoothstep(0.1,0.7,t);
            vec3 color = mix(color1, color2, t);
            return color;
        }

        vec3 gradient(vec3 color1, vec3 color2, float coord){
            float t = smoothstep(0.4,0.4,coord);
            
            vec3 color = mix(color1, color2, t);
            return color;
        }

        void main() {
            vec3 fragColor;
            vec2 coord = vUv;
            // coord.y += iTime;
            coord.x = noise(vec3(coord.xy, iTime));
            // coord.y = noise(vec3(coord.xy, 1.0));

            float dist = sqrt(pow(coord.x - 0.5,2.0) + pow(coord.y - 0.5,2.0));
            fragColor = gradient( vec3(0.996, 0.949, 0.957),fragColor, dist);
            // fragColor = applyTex();
            // fragColor = phongModel(fragColor);

            gl_FragColor = vec4(fragColor,1.0);
        }
    `
}







export {Shader};
