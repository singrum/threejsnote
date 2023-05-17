import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const PhongShader = {
    uniforms : {
        
        Lights : {
            value :[{
                Position : new Vector4(10,0,0),
                La : new Vector3(0,0,0),
                Ld : new Vector3(0.992, 0.070, 0.070),
                Ls : new Vector3(1,1,1),
            },
            {
                Position : new Vector4(-20,0,0),
                La : new Vector3(0,0,0),
                Ld : new Vector3(0.152, 0.992, 0.070),
                Ls : new Vector3(1,1,1),
            },
            {
                Position : new Vector4(-10,0,0),
                La : new Vector3(0,0,0),
                Ld : new Vector3(0.141, 0.698, 0.976),
                Ls : new Vector3(1,1,1),
            },
            {
                Position : new Vector4(-20,10,0),
                La : new Vector3(0,0,0),
                Ld : new Vector3(129, 96, 195),
                Ls : new Vector3(1,1,1),
            },
            {
                Position : new Vector4(20,-10,0),
                La : new Vector3(0,0,0),
                Ld : new Vector3(99, 125, 84),
                Ls : new Vector3(1,1,1),
            }]
        },
        Material : {
            value :{
                Ka : new Vector3(0,0,0),
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
        } Lights[5];
        uniform struct MaterialInfo{
            vec3 Ka;
            vec3 Kd;
            vec3 Ks;
            float Shininess;
        } Material;

        /* out */
        varying vec3 LightIntensity;

        void getCamSpace(out vec3 norm, out vec3 pos){
            norm = normalize(normalMatrix * normal);
            pos = (modelViewMatrix * vec4(position, 1.0)).xyz;
        }

        vec3 phongModel(int lightIndex, vec3 pos, vec3 n){
            vec3 ambient = Lights[lightIndex].La * Material.Ka;
            vec3 s = normalize(Lights[lightIndex].Position.xyz - pos);
            float sDotN = max(dot(s,n), 0.0);
            vec3 diffuse = Lights[lightIndex].Ld * Material.Kd * sDotN;
            vec3 spec = vec3(0.0);
            if(sDotN > 0.0){
                vec3 v = normalize(-pos.xyz);
                vec3 r = reflect(-s,n);
                spec = Lights[lightIndex].Ls * Material.Ks * pow(max(dot(r,v), 0.0), Material.Shininess);
            }
            return ambient + diffuse + spec;
        }
        void main() {
            vec3 camNorm, camPosition;
            getCamSpace(camNorm, camPosition);
            LightIntensity = vec3(0.0);
            for(int i = 0; i< 3; i++){
                LightIntensity += phongModel(i, camPosition, camNorm);
            }
            
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