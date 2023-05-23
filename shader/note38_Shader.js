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
            float ratio = 1.0;
            vec2 tuv = vec2((abs(atan(vPosition.y,vPosition.x)))/ 3.14, vPosition.z / 22.0);
            tuv -= .5;

            // rotate with Noise
            float degree = noise(vec2(iTime*.1, tuv.x*tuv.y));

            tuv.y *= 1./ratio;
            tuv *= Rot(radians((degree-.5)*720.+180.));
            tuv.y *= ratio;

            
            // Wave warp with sin
            float frequency = 5.;
            float amplitude = 30.;
            float speed = iTime * 6.;
            tuv.x += sin(tuv.y*frequency+speed)/amplitude;
            tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
            
            
            // draw the image
            // vec3 colorYellow = vec3(0.718, 0.6, 1);
            // vec3 colorDeepBlue = vec3(0.675, 0.737, 1);
            vec3 colorYellow = vec3(1, 0.255, 0.804);
            vec3 colorDeepBlue = vec3(0.784, 0, 1);
            vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
            
            vec3 colorRed = vec3(0.996, 1, 0);
            vec3 colorBlue = vec3(1, 0.616, 0);
            vec3 layer2 = mix(colorRed, colorBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
            
            vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));
            
            vec3 col = finalComp;
            
            fragColor = col;
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
            return texture2D(uvMap, vec2((atan(vPosition.y / vPosition.x) * 1.5 + 1.0 ), vPosition.z / 22.0)).xyz;
        }


        vec3 wave (vec3 color1, vec3 color2, float coord){
            float t = 1.0 - abs(fract(coord * 1.0) * 2.0 - 1.0);
            t = smoothstep(0.1,0.7,t);
            vec3 color = mix(color1, color2, t);
            return color;
        }

        void main() {
            vec3 fragColor;
            // mainImage(fragColor);
            vec2 psuv = vec2(atan(vPosition.y,vPosition.x)/ (2.0 * PI) + 0.5, vPosition.z / 22.0);
            fragColor = vec3(1, 0.325, 0.439);
            fragColor = wave( vec3(0.996, 0.949, 0.957),fragColor, psuv.y + seamless_noise(psuv - iTime / 10.0, vec2(4.0,4.0)));
            
            fragColor = phongModel(fragColor);
            // fragColor = grain(fragColor);
            

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
