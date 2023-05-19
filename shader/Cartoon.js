import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const PhongShader = {
    uniforms : {
        
        Light : {
            value :{
                Position : new Vector4(15,2,10),
                La : new Vector3(0,0.1,0.1),
                Ld : new Vector3(0.6,0.6,0.6),
            }
        },
        Material : {
            value :{
                Ka : new Vector3(1,1,1),
                Kd : new Vector3(1,0,1),
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
        } Light;
        uniform struct MaterialInfo{
            vec3 Ka;
            vec3 Kd;
            float Shininess;
        } Material;

        varying vec3 LightIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        const float levels = 3.0;
        const float scaleFactor = 0.5;
        vec3 toonShade(vec3 pos, vec3 n){
            vec3 ambient = Light.La * Material.Ka;
            vec3 s = normalize(Light.Position.xyz - pos);
            float sDotN = max(dot(s,n), 0.0);
            vec3 diffuse = Light.Ld * Material.Kd * floor(sDotN * levels) * scaleFactor;
            return ambient + diffuse;
        }
        void main() {
            
            gl_FragColor = vec4(toonShade(vPosition, vNormal), 1.0);

        }
    `
}
export {PhongShader};
