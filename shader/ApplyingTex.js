import {
	Vector2,
	Vector3,
    Vector4,
    TextureLoader
} from '../node_modules/three/build/three.module.js';

const PhongShader = {
    uniforms : {
        
        Light : {
            value :{
                Position : new Vector4(10,0,10),
                La : new Vector3(0.1,0.1,0.1),
                L : new Vector3(1,1,1),
                Ls : new Vector3(1,1,1),
            }
        },
        Material : {
            value :{
                Ka : new Vector3(1,1,1),
                Kd : new Vector3(1,1,1),
                Ks : new Vector3(1,1,1),
                Shininess : 100,
            }
        },
        Tex1 : {
            value : new TextureLoader().load('../data/uv_grid.jpg')
        }

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
        varying vec3 LightIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;


        uniform struct LightInfo {
            vec4 Position;
            vec3 L;
            vec3 La;
            vec3 Ls;
        } Light;
        uniform struct MaterialInfo{
            vec3 Ka;
            vec3 Kd;
            vec3 Ks;
            float Shininess;
        } Material;
        uniform sampler2D Tex1;

        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        vec3 blinnPhong(vec3 pos, vec3 n){
            vec3 texColor = texture(Tex1,  vUv).rgb;
            vec3 ambient = Light.La * texColor;
            vec3 s = normalize(Light.Position.xyz - pos);
            float sDotN = max(dot(s,n), 0.0);
            vec3 diffuse = texColor * sDotN;
            vec3 spec = vec3(0.0);
            if(sDotN > 0.0){
                vec3 v = normalize(cameraPosition+pos.xyz);
                vec3 h = normalize(v+s);
                spec =  Material.Ks * pow(max(dot(h,n), 0.0), Material.Shininess);
            }
            return ambient + (diffuse + spec) * Light.L;
        }
        const float strength = 0.05;

        void main() {

            vec3 texColor = blinnPhong(vPosition, vNormal);
            texColor.rgb += grain * strength;
            
            gl_FragColor = vec4(texColor,1);

        }
    `
}
export {PhongShader};
