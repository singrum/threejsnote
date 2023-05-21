import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const BarShader = {
    uniforms : {
        
        Light : {
            value :{
                Position : new Vector4(-10,-5,25),
                La : new Vector3(0.4,0.4,0.4),
                Ld : new Vector3(1,1,1),
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
        iTime : {value : null}


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


        vec3 phongModel(vec3 color){
            vec3 ambient = Light.La * color;
            vec3 s = normalize(Light.Position.xyz - vPosition);
            float sDotN = max(dot(s,vNormal), 0.0);
            vec3 diffuse = Light.Ld * color * sDotN;
            return ambient + diffuse;
        }


        mat2 Rot(float a)
        {
            float s = sin(a);
            float c = cos(a);
            return mat2(c, -s, s, c);
        }


        // Created by inigo quilez - iq/2014
        // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
        vec2 hash( vec2 p )
        {
            p = vec2( dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)) );
            return fract(sin(p)*43758.5453);
        }

        float noise( in vec2 p )
        {
            vec2 i = floor( p );
            vec2 f = fract( p );
            
            vec2 u = f*f*(3.0-2.0*f);

            float n = mix( mix( dot( -1.0+2.0*hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                                dot( -1.0+2.0*hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                        mix( dot( -1.0+2.0*hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                                dot( -1.0+2.0*hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
            return 0.5 + 0.5*n;
        }


        void mainImage( out vec3 fragColor)
        {
            vec2 uv = vUv;
            float ratio = iResolution.x / iResolution.y;

            vec2 tuv = uv;
            tuv -= .5;

            // rotate with Noise
            float degree = noise(vec2(iTime*.1, tuv.x*tuv.y));

            tuv.y *= 1./ratio;
            tuv *= Rot(radians((degree-.5)*720.+180.));
            tuv.y *= ratio;

            
            // Wave warp with sin
            float frequency = 5.;
            float amplitude = 30.;
            float speed = iTime * 2.;
            tuv.x += sin(tuv.y*frequency+speed)/amplitude;
            tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
            
            
            // draw the image
            vec3 colorYellow = vec3(.957, .804, .623);
            vec3 colorDeepBlue = vec3(.192, .384, .933);
            vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
            
            vec3 colorRed = vec3(.910, .510, .8);
            vec3 colorBlue = vec3(0.350, .71, .953);
            vec3 layer2 = mix(colorRed, colorBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
            
            vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));
            
            vec3 col = finalComp;
            
            fragColor = col;
        }




        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        const float strength = 0.1;

        vec3 grain(vec3 color){
            float grain = rand(vUv.xy) * 2.0 - 1.0;
            vec3 co = color + grain * strength;
            return co;
            
        }
        

        vec3 gradient(vec3 color1, vec3 color2){
            return mix(color1, color2, vPosition.z/15.0);
        }

        void main() {
            vec3 fragColor;
            fragColor = vec3(1,0.57,0.8);
            // mainImage(fragColor);
            
            fragColor = gradient(vec3(1, 0.765, 0), vec3(0.996, 0.094, 1));
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
                Position : new Vector4(-10,10,5),
                La : new Vector3(1,1,1),
                Ld : new Vector3(0.1,0.1,0.1),
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
        vec3 phongModel(vec3 pos, vec3 n){
            vec3 ambient = Light.La * Material.Ka;
            vec3 s = normalize(Light.Position.xyz - pos);
            float sDotN = max(dot(s,n), 0.0);
            vec3 diffuse = Light.Ld * Material.Kd * sDotN;
            // vec3 spec = vec3(0.0);
            // if(sDotN > 0.0){
            //     vec3 v = normalize(cameraPosition+pos.xyz);
            //     vec3 r = reflect(-s,n);
            //     spec = Light.Ls * Material.Ks * pow(max(dot(r,v), 0.0), Material.Shininess);
            // }
            return ambient + diffuse;
        }
        void main() {
            
            gl_FragColor = vec4(phongModel(vPosition, vNormal), 1.0);

        }
    `
}
export {BarShader, StickShader};
