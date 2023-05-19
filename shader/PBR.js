import {
	Vector2,
	Vector3,
    Vector4
} from '../node_modules/three/build/three.module.js';

const PhongShader = {
    uniforms : {
        
        Light : {
            value :[{
                Position : new Vector4(15,2,10),
                L : new Vector3(1,1,1),
            }]
        },
        Material : {
            value :{
                Rough : 0.5,
                Metal : true,
                Color : new Vector3(1,1,0),
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
        # define PI 3.14
        uniform struct LightInfo {
            vec4 Position;
            vec3 L;
        } Light[1];
        uniform struct MaterialInfo{
            float Rough;
            bool Metal;
            vec3 Color;
        } Material;


        varying vec3 LightIntensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        vec3 schlickFresnel(float lDotH){
            vec3 f0 = vec3(0.04);
            if(Material.Metal){
                f0 = Material.Color;
            }
            return f0 + (vec3(1.0) - f0) * pow(1.0 - lDotH, 5.0);
        }

        float geomSmith(float dotProd){
            float k = (Material.Rough + 1.0) * (Material.Rough + 1.0) / 8.0;
            float denom = dotProd * (1.0 - k) + k;
            return 1.0 / denom;
        }

        float ggxDistribution(float nDotH){
            float alpha2 = Material.Rough * Material.Rough * Material.Rough * Material.Rough;
            float d = (nDotH * nDotH) * (alpha2 - 1.0) + 1.0;
            return alpha2 / (PI * d * d);
        }
        vec3 microfacetModel(int lightIdx, vec3 position, vec3 n){
            vec3 diffuseBrdf = vec3(0.0);
            if(!Material.Metal){
                diffuseBrdf = Material.Color;
            }
            vec3 l = vec3(0.0), lightI = Light[lightIdx].L;
            if(Light[lightIdx].Position.w == 0.0){
                l = normalize(Light[lightIdx].Position.xyz);
            }else{
                l = Light[lightIdx].Position.xyz - position;
                float dist = length(l);
                l = normalize(l);
                lightI /= (dist * dist);
            }
            vec3 v = normalize(-position);
            vec3 h = normalize(v + l);
            float nDotH = dot(n,h);
            float lDotH = dot(l,h);
            float nDotL = max(dot(n,l), 0.0);
            float nDotV = dot(n,v);
            vec3 specBrdf = 0.25 * ggxDistribution(nDotH) * schlickFresnel(lDotH) * geomSmith(nDotL) * geomSmith(nDotV);
            return (diffuseBrdf + PI * specBrdf) * lightI * nDotL;
        }


        void main() {
            vec3 sum = vec3(0), n = normalize(vNormal);
            for(int i =0;i<3;i++){
                sum += microfacetModel(i,vPosition,n);
            }
            sum = pow(sum, vec3(1.0/2.2));
            gl_FragColor = vec4(sum, 1.0);

        }
    `
}
export {PhongShader};
