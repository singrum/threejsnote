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

        void main() {
            vec3 n = normalize(normalMatrix * normal);
            vec4 camCoords = modelViewMatrix * vec4(position , 1.0);
            vec3 ambient = Light.La * Material.Ka;
            vec3 s = normalize(vec3(Light.Position - camCoords));
            float sDotN = max(dot(s,n), 0.0);
            vec3 diffuse = Light.Ld * Material.Kd * sDotN;
            vec3 spec = vec3(0.0);
            if(sDotN > 0.0){
                vec3 v = normalize(-camCoords.xyz);
                vec3 r = reflect(-s,n);
                spec = Light.Ls * Material.Ks * pow(max(dot(r,v), 0.0), Material.Shininess);

            }

            LightIntensity = ambient + diffuse + spec;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader : /* glsl */`
        varying vec3 LightIntensity;

        void main() {
            
            gl_FragColor = vec4(LightIntensity, 1.0);

        }
    `
}
export {PhongShader};