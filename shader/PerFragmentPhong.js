import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const PhongShader = {
    uniforms : {
        
        Light : {
            value :{
                Position : new Vector4(10,0,0),
                La : new Vector3(0,0,0),
                Ld : new Vector3(1,1,1),
                Ls : new Vector3(1,1,1),
            }
        },
        Material : {
            value :{
                Ka : new Vector3(0,0,0),
                Kd : new Vector3(1,1,1),
                Ks : new Vector3(1,1,1),
                Shininess : 10,
            }
        },


    },


    vertexShader : /* glsl */`
        



        /* out */
        varying vec3 camNorm;
        varying vec3 camPosition;
        void getCamSpace(out vec3 norm, out vec3 pos){
            norm = normalize(normalMatrix * normal);
            pos = (modelViewMatrix * vec4(position, 1.0)).xyz;
        }

        void main() {
            vec3 camNorm, camPosition;
            
            varying vec3 LightIntensity;
            getCamSpace(camNorm, camPosition);
            LightIntensity = phongModel(camPosition, camNorm);
            
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

        varying vec3 camNorm;
        varying vec3 camPosition;
        varying vec3 LightIntensity;

        vec3 phongModel(vec3 pos, vec3 n){
            vec3 ambient = Light.La * Material.Ka;
            vec3 s = normalize(Light.Position.xyz - pos);
            float sDotN = max(dot(s,n), 0.0);
            vec3 diffuse = Light.Ld * Material.Kd * sDotN;
            vec3 spec = vec3(0.0);
            if(sDotN > 0.0){
                vec3 v = normalize(-pos.xyz);
                vec3 r = reflect(-s,n);
                spec = Light.Ls * Material.Ks * pow(max(dot(r,v), 0.0), Material.Shininess);
            }
            return ambient + diffuse + spec;
        }

        void main() {
            
            
            gl_FragColor = vec4(LightIntensity, 1.0);

        }
    `
}
export {PhongShader};