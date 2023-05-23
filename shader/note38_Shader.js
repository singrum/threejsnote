import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const BarShader = {
    uniforms : {
        
        Light : {
            value :{
                Position : new Vector4(-13,-10,27),
                La : new Vector3(0.6,0.6,0.6),
                Ld : new Vector3(0.8,0.8,0.8),
                Ls : new Vector3(1,1,1),
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

        /* out */
        varying vec3 LightIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;


        void main() {
            vPosition = position;
            vNormal = normal;
            vUv = uv;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader : /* glsl */`

        #define S(a,b,t) smoothstep(a,b,t)
        #define PI 3.1415926535



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






        // vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        // vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        // vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        // float pNoise(vec3 P){
        // vec3 Pi0 = floor(P); // Integer part for indexing
        // vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        // Pi0 = mod(Pi0, 289.0);
        // Pi1 = mod(Pi1, 289.0);
        // vec3 Pf0 = fract(P); // Fractional part for interpolation
        // vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        // vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        // vec4 iy = vec4(Pi0.yy, Pi1.yy);
        // vec4 iz0 = Pi0.zzzz;
        // vec4 iz1 = Pi1.zzzz;

        // vec4 ixy = permute(permute(ix) + iy);
        // vec4 ixy0 = permute(ixy + iz0);
        // vec4 ixy1 = permute(ixy + iz1);

        // vec4 gx0 = ixy0 / 7.0;
        // vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
        // gx0 = fract(gx0);
        // vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        // vec4 sz0 = step(gz0, vec4(0.0));
        // gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        // gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        // vec4 gx1 = ixy1 / 7.0;
        // vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
        // gx1 = fract(gx1);
        // vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        // vec4 sz1 = step(gz1, vec4(0.0));
        // gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        // gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        // vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        // vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        // vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        // vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        // vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        // vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        // vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        // vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        // vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        // g000 *= norm0.x;
        // g010 *= norm0.y;
        // g100 *= norm0.z;
        // g110 *= norm0.w;
        // vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        // g001 *= norm1.x;
        // g011 *= norm1.y;
        // g101 *= norm1.z;
        // g111 *= norm1.w;

        // float n000 = dot(g000, Pf0);
        // float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        // float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        // float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        // float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        // float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        // float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        // float n111 = dot(g111, Pf1);

        // vec3 fade_xyz = fade(Pf0);
        // vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        // vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        // float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        // return 2.2 * n_xyz;
        // }


        const int cell_amount = 4;
        const vec2 period = vec2(5., 10.);

        vec2 modulo(vec2 divident, vec2 divisor){
            vec2 positiveDivident = mod(divident, divisor) + divisor;
            return mod(positiveDivident, divisor);
        }

        vec2 random(vec2 value, float seed){
            value = vec2( dot(value, vec2(127.1,311.7) ),
                        dot(value, vec2(269.5,183.3) ) );
            return -1.0 + 2.0 * fract(sin(value) * seed);
        }

        float seamless_noise(vec2 uv, vec2 _period) {
            uv = uv * float(cell_amount);
            vec2 cellsMinimum = floor(uv);
            vec2 cellsMaximum = ceil(uv);
            vec2 uv_fract = fract(uv);
            
            cellsMinimum = modulo(cellsMinimum, _period);
            cellsMaximum = modulo(cellsMaximum, _period);
            
            vec2 blur = smoothstep(0.0, 1.0, uv_fract);
            
            vec2 lowerLeftDirection = random(vec2(cellsMinimum.x, cellsMinimum.y), 123.0);
            vec2 lowerRightDirection = random(vec2(cellsMaximum.x, cellsMinimum.y), 123.0);
            vec2 upperLeftDirection = random(vec2(cellsMinimum.x, cellsMaximum.y), 123.0);
            vec2 upperRightDirection = random(vec2(cellsMaximum.x, cellsMaximum.y), 123.0);
            
            vec2 fraction = fract(uv);
            
            return mix( mix( dot( lowerLeftDirection, fraction - vec2(0, 0) ),
                            dot( lowerRightDirection, fraction - vec2(1, 0) ), blur.x),
                        mix( dot( upperLeftDirection, fraction - vec2(0, 1) ),
                            dot( upperRightDirection, fraction - vec2(1, 1) ), blur.x), blur.y) * 0.8 + 0.5;
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


        // mat2 Rot(float a)
        // {
        //     float s = sin(a);
        //     float c = cos(a);
        //     return mat2(c, -s, s, c);
        // }


        // // Created by inigo quilez - iq/2014
        // // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
        // vec2 hash( vec2 p )
        // {
        //     p = vec2( dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)) );
        //     return fract(sin(p)*43758.5453);
        // }

        // float noise( in vec2 p )
        // {
        //     vec2 i = floor( p );
        //     vec2 f = fract( p );
            
        //     vec2 u = f*f*(3.0-2.0*f);

        //     float n = mix( mix( dot( -1.0+2.0*hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
        //                         dot( -1.0+2.0*hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
        //                 mix( dot( -1.0+2.0*hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
        //                         dot( -1.0+2.0*hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
        //     return 0.5 + 0.5*n;
        // }


        // void mainImage( out vec3 fragColor)
        // {
        //     float ratio = 1.0;
        //     vec2 tuv = vec2((abs(atan(vPosition.y,vPosition.x)))/ 3.14, vPosition.z / 22.0);
        //     tuv -= .5;

        //     // rotate with Noise
        //     float degree = noise(vec2(iTime*.1, tuv.x*tuv.y));

        //     tuv.y *= 1./ratio;
        //     tuv *= Rot(radians((degree-.5)*720.+180.));
        //     tuv.y *= ratio;

            
        //     // Wave warp with sin
        //     float frequency = 5.;
        //     float amplitude = 30.;
        //     float speed = iTime * 6.;
        //     tuv.x += sin(tuv.y*frequency+speed)/amplitude;
        //     tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
            
            
        //     // draw the image
        //     // vec3 colorYellow = vec3(0.718, 0.6, 1);
        //     // vec3 colorDeepBlue = vec3(0.675, 0.737, 1);
        //     vec3 colorYellow = vec3(1, 0.333, 0.733);
        //     vec3 colorDeepBlue = vec3(1, 0.827, 0.639);
        //     vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
            
        //     vec3 colorRed = vec3(0.988, 1, 0.698);
        //     vec3 colorBlue = vec3(0.714, 0.918, 0.98);
        //     vec3 layer2 = mix(colorRed, colorBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
            
        //     vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));
            
        //     vec3 col = finalComp;
            
        //     fragColor = col;
        // }




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
            return texture2D(uvMap, vec2((atan(vPosition.y / vPosition.x) * 1.5 + 1.0 ), vPosition.z / 22.0)).xyz;
        }


        vec3 wave (vec3 color1, vec3 color2, float coord){
            float t = 1.0 - abs(fract(coord * 7.0) * 2.0 - 1.0);
            t = smoothstep(0.1,0.9,t);
            vec3 color = mix(color1, color2, t);
            return color;
        }

        void main() {
            vec3 fragColor;
            // mainImage(fragColor);
            vec2 psuv = vec2(atan(vPosition.y,vPosition.x)/ (2.0 * PI) + 0.5, vPosition.z / 22.0);
            // fragColor = vec3(seamless_noise(psuv,vec2(4.0,4.0)));
            fragColor = wave( vec3(0.996, 0.949, 0.957),vec3(0.906, 0.275, 0.275), psuv.y + seamless_noise(psuv + iTime / 10.0, vec2(4.0,4.0)));
            // fragColor = applyTex();
            fragColor = phongModel(fragColor);
            fragColor = grain(fragColor);
            

            gl_FragColor = vec4(fragColor,1.0);
        }
    `
}






















const StickShader = {
    uniforms : {
        
        Light : {
            value :{
                Position : new Vector4(-10,0,5),
                La : new Vector3(1,1,1),
                Ld : new Vector3(0.5,0.5,0.5),
                Ls : new Vector3(1,1,1),
            }
        },
        Material : {
            value :{
                Ka : new Vector3(0.631, 0.482, 0.224),
                Kd : new Vector3(1,1,1),
                Ks : new Vector3(1,1,1),
                Shininess : 100,
            }
        },


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
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader : /* glsl */`

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

        varying vec3 LightIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        

        vec3 phongModel(vec3 color){
            vec3 ambient = Light.La * color;
            vec3 s = normalize(Light.Position.xyz - vPosition);
            float sDotN = max(dot(s,vNormal), 0.0);
            vec3 diffuse = Light.Ld * color * sDotN;
            return ambient + diffuse;
        }

        const float strength = 0.05;
        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        vec3 grain(vec3 color){
            float grain = rand(vUv.xy) * 2.0 - 1.0;
            vec3 co = color + grain * strength;
            return co;
            
        }
        vec3 gradient(vec3 color1, vec3 color2){
            return mix(color1, color2, (vPosition.y + 4.0)/8.0);
        }
        void main() {
            vec3 fragColor;
            fragColor = gradient(vec3(0.639, 0.58, 0.443),vec3(0.388, 0.353, 0.271));
            
            fragColor = phongModel(fragColor);
            fragColor = grain(fragColor);
            gl_FragColor = vec4(fragColor, 1.0);

        }
    `
}
export {BarShader, StickShader};
