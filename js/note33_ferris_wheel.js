import * as THREE from '../node_modules/three/build/three.module.js';

import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from '../node_modules/three/examples/jsm/shaders/FXAAShader.js';
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';

//https://funspotamericaatlanta.com/wp-content/uploads/2018/06/Ferris-Wheel-5.jpg


const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;

class App {
    constructor() {
        const domWebGL = document.createElement('div');
        document.body.appendChild(domWebGL);
        this._domWebGL = domWebGL;

        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio( window.devicePixelRatio );
        //renderer.shadowMap.enabled =  true;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        domWebGL.appendChild(renderer.domElement);

        this._renderer = renderer;

        const scene = new THREE.Scene();
        this._scene = scene;

        const bloomLayer = new THREE.Layers();
        bloomLayer.set(BLOOM_SCENE);
        this._bloomLayer = bloomLayer;
        this._darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
        this._materials = {};

        this._setupCamera();
        this._setupLight();
        this._setupPostprocessing();
        this._setupInteractions();
        this._setupModel();
        this._setupGUI();
        this._setupControls();
        //this._setupHelper();

        window.onresize = this.resize.bind(this);

        this.resize();
        this.render()
    }

    _setupInteractions() {
        const raycaster = new THREE.Raycaster();
        raycaster._mouse = new THREE.Vector2();

        window.addEventListener("pointerdown", this._onPointerDown.bind(this));

        this._raycaster = raycaster;
    }

    _setupPostprocessing() {
        const renderScene = new RenderPass(this._scene, this._camera);

        const params = {
            exposure: 1,
            bloomThreshold: 0,
            bloomStrength: 5,
            bloomRadius: 0,
            scene: "Scene with Glow"
        };

        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        
        
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        const bloomComposer = new EffectComposer(this._renderer);
        bloomComposer.renderToScreen = false;
        
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);
        bloomComposer.addPass(fxaaPass);
        // fxaaPass.renderToScreen = true;
        const finalPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D baseTexture;
                    uniform sampler2D bloomTexture;

                    varying vec2 vUv;

                    void main() {
                        gl_FragColor = (texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv));
                    }
                `,
                defines: {}
            }), "baseTexture"
        );

        finalPass.needsSwap = true;

        const finalComposer = new EffectComposer(this._renderer);
        finalComposer.addPass(renderScene);
        finalComposer.addPass(finalPass);
        finalComposer.addPass(fxaaPass);
        
        console.log(fxaaPass)

        this._bloomComposer = bloomComposer;
        this._finalComposer = finalComposer;
        this._bloomPass = bloomPass;
        this._params = params;
    }

    _disposeMaterial(obj) {
        if(obj.material) {
            obj.material.dispose();
        }
    }

    _onPointerDown(event) {
        this._raycaster._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this._raycaster._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this._raycaster.setFromCamera(this._raycaster._mouse, this._camera);
        const intersects = this._raycaster.intersectObjects(this._scene.children);

        if(intersects.length > 0) {
            const object = intersects[0].object;
            object.layers.toggle(BLOOM_SCENE);
        }
    }

    _setupModel() {
        this._scene.traverse(this._disposeMaterial.bind(this));
        this._scene.children.length = 0;

        // const geometry = new THREE.IcosahedronGeometry(1, 2);

        // for(let i=0; i<10; i++) {
        //     const color = new THREE.Color();
        //     color.setHSL(Math.random(), 0.7, Math.random()*0.2+0.05);

        //     const material = new THREE.MeshBasicMaterial({ color: color, wireframe : true});
        //     const sphere = new THREE.Mesh(geometry, material);

        //     sphere.position.x = Math.random() * 10 - 5;
        //     sphere.position.y = Math.random() * 10 - 5;
        //     sphere.position.z = Math.random() * 10 - 5;
        //     sphere.position.normalize().multiplyScalar(Math.random()*4.0+2.0);
        //     sphere.scale.setScalar(Math.random()*Math.random()+0.5);
        //     this._scene.add(sphere);

        //     if(Math.random() < 0.25) sphere.layers.enable(BLOOM_SCENE);
        // }

        // bulb
        
        class Bulb{
            constructor(rad,color){
                this.mesh = new THREE.Mesh(new THREE.SphereGeometry(rad, 4,4), new THREE.MeshBasicMaterial({color : color}));
            }
        }



        // frame
        const lineRad = 0.1, bigRad = 30, depth = 6;
        const basicMat = new THREE.MeshBasicMaterial({color : 0x394867})
        const bigRod = new THREE.Object3D();
        const bigRodBody = new THREE.Mesh(new THREE.CylinderGeometry(lineRad * 2, lineRad * 2, bigRad,4), basicMat);
        const bigRodBulb = new THREE.Object3D();
        const bigRodBulbLen = 30
        for(let i = 0; i<bigRodBulbLen; i++){
            const bulb = new Bulb(lineRad*2, new THREE.Color(`hsl(${Math.floor(360 / bigRodBulbLen * (bigRodBulbLen - i - 1))}, 100%, 50%)`)).mesh
            bulb.layers.enable(BLOOM_SCENE)
            bigRodBulb.add(bulb)
            bigRodBulb.children[i].position.set(lineRad * 2, bigRad / bigRodBulbLen * (i + 0.5) - bigRad/2,0);
        }
        
        bigRod.add(bigRodBody, bigRodBulb)
        



        const smallRod = new THREE.Mesh(new THREE.CylinderGeometry(lineRad, lineRad, depth, 4), basicMat);
        const diagRod = new THREE.Mesh(new THREE.CylinderGeometry(lineRad, lineRad, Math.hypot(bigRad / 4, depth / 2), 4), basicMat);
        
    
        const tempGroup1 = new THREE.Object3D();
        tempGroup1.add(smallRod.clone(), diagRod.clone(), diagRod.clone());
        tempGroup1.children[0].position.set(bigRad/4, 0,0);
        tempGroup1.children[1].position.set(bigRad/8, depth / 4, 0);
        tempGroup1.children[1].rotation.set(0,0,Math.atan(bigRad / 2 / depth));
        tempGroup1.children[2].position.set(bigRad/8, -depth / 4, 0);
        tempGroup1.children[2].rotation.set(0,0,-Math.atan(bigRad / 2 / depth));
    
        const frame = new THREE.Object3D();
        frame.add(tempGroup1.clone(),tempGroup1.clone(),tempGroup1.clone(),smallRod.clone(), bigRod.clone(), bigRod.clone())
        frame.children[1].position.set(bigRad / 4, 0, 0)
        frame.children[2].position.set(bigRad / 2, 0, 0)
        frame.children[3].position.set(bigRad, 0, 0)
        frame.children[4].position.set(bigRad/2, depth/2, 0)
        frame.children[4].rotation.set(Math.PI, 0, -Math.PI/2)
        frame.children[5].position.set(bigRad/2, -depth/2, 0)
        frame.children[5].rotation.set(0,0, -Math.PI/2)

        


        // car
        const board = new THREE.Mesh(new THREE.BoxGeometry(bigRad / 5, 2 * lineRad, 3 * depth / 4),basicMat)
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(lineRad, lineRad, depth / 2), basicMat);
        const shape = new THREE.Shape();
        shape.moveTo(0,0);
        shape.lineTo(bigRad / 10, 0);
        shape.lineTo(bigRad / 14, -bigRad/8);
        shape.lineTo(-bigRad / 14, -bigRad/8);
        shape.lineTo(-bigRad / 10, 0);
        const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth: bigRad /6 ,bevelEnabled: false}), basicMat)
        

        const car = new THREE.Object3D();
        car.add(board, stick, body);
        car.children[0].position.set(0, - lineRad, 0)
        car.children[1].position.set(0, - depth / 4, 0)
        car.children[2].position.set(0, - depth / 2, -body.geometry.parameters.options.depth / 2)
        

        
        // frame, car cloning
        const tempGroup2 = new THREE.Object3D();
        tempGroup2.add(frame.clone(), car.clone());
        tempGroup2.children[0].rotation.set(Math.PI/2, 0, 0);
        tempGroup2.children[1].position.set(bigRad, 0,0);
        

        
        //wheel
        const wheel = new THREE.Object3D();
        for(let i = 0; i<16; i++){
            wheel.add(tempGroup2.clone());
            wheel.children[i].rotation.set(0,0,Math.PI / 8 * i);
            wheel.children[i].children[1].rotation.set(0,0,-Math.PI / 8 * i)
        }
        
        
        const outerTorus = new THREE.Mesh(new THREE.TorusGeometry(bigRad, lineRad, 4,64), basicMat);
        wheel.add(outerTorus.clone(), outerTorus.clone());
        wheel.children[16].position.set(0, 0, depth / 2)
        wheel.children[17].position.set(0, 0, -depth / 2)

        const innerTorus = new THREE.Mesh(new THREE.TorusGeometry( bigRad / 2, lineRad, 4, 16), basicMat);
        wheel.add(innerTorus.clone(), innerTorus.clone());
        wheel.children[18].position.set(0,0,depth /2);
        wheel.children[19].position.set(0,0,-depth /2);



        
        const smallAxisLen = depth * 5 / 4
        const bigAxisLen = depth  / 4
        const smallAxis = new THREE.Mesh(new THREE.CylinderGeometry(bigRad/24, bigRad/24, smallAxisLen, 4), basicMat);
        const bigAxis = new THREE.Mesh(new THREE.CylinderGeometry(bigRad / 16,bigRad / 16, bigAxisLen, 32), basicMat);
        const axis = new THREE.Object3D();
        axis.add(smallAxis, bigAxis.clone(), bigAxis.clone());
        axis.children[1].position.set(0,smallAxisLen /2 + bigAxisLen /2,0)
        axis.children[2].position.set(0,-smallAxisLen /2 - bigAxisLen /2,0)
        
        wheel.add(axis);
        axis.rotation.set(Math.PI/2,0,0)
        this._scene.add(wheel)

    }

    _setupHelper() {
        //.
    }

    _setupGUI() {
        const gui = new GUI();

        gui.add(this._params, "scene", ["Scene with Glow", "Glow only", "Scene only"]).onChange((value) => {
            switch(value) {
                case "Scene with Glow":
                    this._bloomComposer.renderToScreen = false;
                    break;
                case "Glow only":
                    this._bloomComposer.renderToScreen = true;
                    break;
                case "Scene only":
                    //.
                    break;
            }
        });

        const folder = gui.addFolder("Bloom Parameters");

        folder.add(this._params, "exposure", 0.1, 2).onChange((value) => {
            this._renderer.toneMappingExposure = Math.pow(value, 4.0);
        });

        folder.add(this._params, "bloomThreshold", 0.0, 1.0).onChange((value) => {
            this._bloomPass.threshold = Number(value);
        });

        folder.add(this._params, "bloomStrength", 0.0, 3.0).onChange((value) => {
            this._bloomPass.strength = Number(value);
        });

        folder.add(this._params, "bloomRadius", 0.0, 1.0).step(0.01).onChange((value) => {
            this._bloomPass.radius = Number(value);
        });
    }

    _setupCamera() {
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 200);
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);
        this._camera = camera;
    }

    _setupControls() {
        const controls = new OrbitControls(this._camera, this._renderer.domElement);
        // controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 1;
        controls.maxDistance = 1000;
    }

    _setupLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff);
        // this._scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(100,100,100)
        // this._scene.add(ambientLight);
    }

    update() {}

    _renderBloom(mask) {
        if(mask) {
            this._scene.traverse(this._darkenNonBloomed.bind(this));
            this._bloomComposer.render();
            this._scene.traverse(this._restoreMaterial.bind(this));
        } else {
            this._camera.layers.set(BLOOM_SCENE);
            this._bloomComposer.render();
            this._camera.layers.set(ENTIRE_SCENE);
        }
    }

    _darkenNonBloomed(obj) {
        if(obj.isMesh && this._bloomLayer.test(obj.layers) === false) {
            this._materials[obj.uuid] = obj.material;
            obj.material = this._darkMaterial;
        }
    }

    _restoreMaterial(obj) {
        if(this._materials[obj.uuid]) {
            obj.material = this._materials[obj.uuid];
            delete this._materials[obj.uuid];
        }
    }

    render() {
        requestAnimationFrame(this.render.bind(this));
        
        this.update();

        switch(this._params.scene) {
            case "Scene only":
                this._renderer.render(this._scene, this._camera);
                break;
            case "Glow only":
                this._renderBloom(false);
                break;
            case "Scene with Glow":
            default:
                this._renderBloom(true);
                this._finalComposer.render();
                break;
        }
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize(width, height);

        this._bloomComposer.setSize(width, height);
        this._finalComposer.setSize(width, height);
    }
}

window.onload = function () {
    new App();
}