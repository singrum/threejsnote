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
        this.prevAngle = 0;
        this.turnOn = false
        this.bulbIndex = 0;
        this._setupCamera();
        this._setupLight();
        this._setupPostprocessing();
        this._setupInteractions();
        this._setupModel();
        // this._setupGUI();
        this._setupControls();
        //this._setupHelper();

        window.onresize = this.resize.bind(this);

        this.resize();
        this.render()
    }

    _setupInteractions() {
        const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.startX = event.clientX
			this.startY = event.clientY
			this.pointerYOnPointerDown = event.clientY - window.innerWidth / 2;
			this.targetRotationOnPointerDown = this.targetRotation;

			document.addEventListener( 'pointermove', onPointerMove );
			document.addEventListener( 'pointerup', onPointerUp );

		}

		const onPointerMove = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.pointerY = event.clientY - window.innerWidth / 2;

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerY - this.pointerYOnPointerDown ) * 0.005;
			


		}

		const onPointerUp = (event) => {
			
			if ( event.isPrimary === false ) return;
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'pointerup', onPointerUp );

		}
        this.angle = 0;
		this.targetRotation = 0;
		this.targetRotationOnPointerDown = 0;
		this.pointerY = 0;
		this.pointerYOnPointerDown = 0;
		this._domWebGL.style.touchAction = 'none';
		this._domWebGL.addEventListener( 'pointerdown', onPointerDown );
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
        const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.startX = event.clientX
			this.startY = event.clientY
			this.pointerYOnPointerDown = event.clientY - window.innerWidth / 2;
			this.targetRotationOnPointerDown = this.targetRotation;

			document.addEventListener( 'pointermove', onPointerMove );
			document.addEventListener( 'pointerup', onPointerUp );

		}

		const onPointerMove = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.pointerY = event.clientY - window.innerWidth / 2;

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerY - this.pointerYOnPointerDown ) * 0.001;
			


		}

		const onPointerUp = (event) => {
			
			if ( event.isPrimary === false ) return;
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'pointerup', onPointerUp );

		}
        this.angle = 0;
		this.targetRotation = 0;
		this.targetRotationOnPointerDown = 0;
		this.pointerY = 0;
		this.pointerYOnPointerDown = 0;
		this._domWebGL.style.touchAction = 'none';
		this._domWebGL.addEventListener( 'pointerdown', onPointerDown );
    }

    _setupModel() {
        this._scene.traverse(this._disposeMaterial.bind(this));
        this._scene.children.length = 0;

        // material
        const basicMat = new THREE.MeshBasicMaterial({color : 0x146C94})
        const whiteMat = new THREE.MeshBasicMaterial({color : 0xffffff})
        const blackMat = new THREE.MeshBasicMaterial({color : 0x111111})


        // bulb
        
        class Bulb{
            constructor(rad,color){
                this.mesh = new THREE.Mesh(new THREE.SphereGeometry(rad, 4,4), new THREE.MeshBasicMaterial({color : color}));
            }
        }



        // frame
        const lineRad = 0.1, bigRad = 30, depth = 6;
        
        const bigRod = new THREE.Object3D();
        const bigRodBody = new THREE.Mesh(new THREE.CylinderGeometry(lineRad * 2, lineRad * 2, bigRad,4), basicMat);
        const bigRodBulb = new THREE.Object3D();
        const bigRodBulbLen = 40
        for(let i = 0; i<bigRodBulbLen; i++){
            
            const bulb = new Bulb(lineRad*2, new THREE.Color(`hsl(${Math.floor(360 / bigRodBulbLen * i)}, 100%, 50%)`)).mesh
            bulb.name = `bigRodBulb${i}`; 
            bigRodBulb.add(bulb)
            bigRodBulb.children[i].position.set(lineRad * 2, bigRad / bigRodBulbLen * (i + 0.5) - bigRad/2,0);

        }
        bigRod.add(bigRodBody, bigRodBulb)
        bigRod.name = "bigRod"



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
        const plate = new THREE.Object3D();
        const plateBody = new THREE.Mesh(new THREE.BoxGeometry(bigRad / 5, 2 * lineRad, 3 * depth / 4), whiteMat);
        const purpleMat = new THREE.MeshBasicMaterial({color : 0xD800A6})
        const skyblueMat = new THREE.MeshBasicMaterial({color : 0x08c6ff})
        const plateBulb = new THREE.Mesh(new THREE.BoxGeometry(bigRad / 5 / 2 * 0.6, 2 * lineRad, 3 * depth / 4 / 2 * 0.6));
        plateBulb.name = "plateBulb";

        plate.add(plateBody, plateBulb.clone(), plateBulb.clone(),plateBulb.clone(),plateBulb.clone());
        
        plate.children[1].position.set(bigRad / 5 * 0.25, -lineRad * 2, 3 * depth / 4 * 0.25)
        plate.children[2].position.set(bigRad / 5 * 0.25, -lineRad * 2, -3 * depth / 4 * 0.25)
        plate.children[3].position.set(-bigRad / 5 * 0.25, -lineRad * 2, 3 * depth / 4 * 0.25)
        plate.children[4].position.set(-bigRad / 5 * 0.25, -lineRad * 2, -3 * depth / 4 * 0.25)
        // for(let i = 1; i<5; i++){plate.children[i].layers.enable(BLOOM_SCENE)}

        const stick = new THREE.Mesh(new THREE.CylinderGeometry(lineRad, lineRad, depth / 2), whiteMat);



        const bodyW = bigRad / 7;
        const bodySW = bigRad / 10;
        const bodyH = bigRad / 8;
        const bodyFront = new THREE.Object3D();
        bodyFront.add(
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad,lineRad,bodyW), whiteMat),
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad,lineRad,bodyH), whiteMat),
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad,lineRad,Math.hypot((bodyW - bodySW)/2, bodyH)), whiteMat),
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad,lineRad,Math.hypot((bodyW - bodySW)/2, bodyH)), whiteMat)
        )
        bodyFront.children[0].rotation.set(0,0,Math.PI/2);
        bodyFront.children[1].position.set(0,-bodyH/2,0);
        bodyFront.children[2].position.set((bodySW + bodyW)/4, - bodyH / 2,0);
        bodyFront.children[2].rotation.set(0,0,-Math.atan((bodyW - bodySW)/2 / bodyH));
        bodyFront.children[3].position.set(-(bodySW + bodyW)/4, - bodyH / 2,0);
        bodyFront.children[3].rotation.set(0,0,Math.atan((bodyW - bodySW)/2 / bodyH));
        
        const bodySide = new THREE.Object3D();
        const bodySideBulb =new THREE.Mesh(new THREE.BoxGeometry(lineRad * 10 ,Math.hypot((bodyW - bodySW)/2, bodyH) / 2 * 0.8, bodyW* 0.8),basicMat)
        bodySideBulb.name = "bodySideBulb";
        bodySide.add(
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad,lineRad,bodyW),whiteMat),
            bodySideBulb
        )
        bodySide.children[0].position.set(-bodyW/2,0,0)
        bodySide.children[0].rotation.set(Math.PI/2,0, 0)
        bodySide.children[1].position.set(-(bodyW + 3 * bodySW)/8, - bodyH *3/ 4,0)
        bodySide.children[1].rotation.set(0,0,Math.atan((bodyW - bodySW)/2 / bodyH))

        const bodyFloor = new THREE.Object3D();
        bodyFloor.add(
            new THREE.Mesh(new THREE.BoxGeometry(bodySW, lineRad, bodyW),whiteMat)
        )
        bodyFloor.children[0].position.set(0,-bodyH,0);

        const body = new THREE.Object3D();
        body.add(bodyFront.clone(), bodyFront.clone(), bodySide.clone(), bodySide.clone(), bodyFloor);
        body.children[0].position.set(0,0,bodyW /2);
        body.children[1].position.set(0,0,-bodyW /2);
        body.children[3].rotation.set(0,Math.PI,0);
        


        const car = new THREE.Object3D();
        car.add(plate, stick, body);
        car.children[0].position.set(0, - lineRad, 0)
        car.children[1].position.set(0, - depth / 4, 0)
        car.children[2].position.set(0, - depth / 2, 0)
        car.name = "car"
        
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
            const bigRod = wheel.children[i].getObjectsByProperty("name","bigRod")
            if(i % 2 === 0){
                bigRod.forEach(e=>{e.rotation.y = Math.PI})
            }
            const plateBulb = wheel.children[i].getObjectsByProperty("name", "plateBulb");
            const bodySideBulb = wheel.children[i].getObjectsByProperty("name", "bodySideBulb");
            if(i % 2 !== 0) {
                plateBulb.forEach(e=>{e.material = purpleMat;})
                bodySideBulb.forEach(e=>{e.material = purpleMat;})
                
            }
            else {
                plateBulb.forEach(e=>{e.material = skyblueMat})
                bodySideBulb.forEach(e=>{e.material = skyblueMat;})
                
            }
            this.carArr = wheel.getObjectsByProperty("name", "car");
            
        }
        
        
        const outerTorus = new THREE.Object3D();
        const outerTorusBody = new THREE.Mesh(new THREE.TorusGeometry(bigRad, lineRad * 2, 4,64), basicMat);
        const outerTorusBulb = new THREE.Object3D();
        const outerTorusBulbLen = 16;
        
        for(let j = 0; j<16; j++){
            for(let i =0;i<outerTorusBulbLen;i++){
                let bulb;
                bulb = new Bulb(lineRad*2, new THREE.Color(`hsl(${Math.floor(360 / outerTorusBulbLen * i)}, 100%, 50%)`)).mesh
                
                
                bulb.name = `outerTorusBulb${i}`
                
                // bulb.layers.enable(BLOOM_SCENE)
                
                if(j % 2 === 0){
                    const theta = Math.PI/8 * j + Math.PI/8 / outerTorusBulbLen * (i + 0.5);
                    bulb.position.set(bigRad * Math.cos(theta), bigRad * Math.sin(theta), lineRad * 2);
                }
                else{
                    const theta = Math.PI/8 * (j+1) - Math.PI/8 / outerTorusBulbLen * (i + 0.5);
                    bulb.position.set(bigRad * Math.cos(theta), bigRad * Math.sin(theta), lineRad * 2);
                }
                
    
                outerTorusBulb.add(bulb)
            }
        }

        
        outerTorus.add(outerTorusBody, outerTorusBulb)
        wheel.add(outerTorus.clone(), outerTorus.clone());
        wheel.children[16].position.set(0, 0, depth / 2)
        wheel.children[17].position.set(0, 0, -depth / 2)
        wheel.children[17].rotation.set(0, Math.PI , 0)

        const innerTorus = new THREE.Mesh(new THREE.TorusGeometry( bigRad / 2, lineRad, 4, 16), basicMat);
        wheel.add(innerTorus.clone(), innerTorus.clone());
        wheel.children[18].position.set(0,0,depth /2);
        wheel.children[19].position.set(0,0,-depth /2);



        
        const smallAxisLen = depth * 3 / 2
        const bigAxisLen = depth  / 4
        const smallAxis = new THREE.Mesh(new THREE.CylinderGeometry(bigRad/24, bigRad/24, smallAxisLen, 4), basicMat);
        const bigAxis = new THREE.Mesh(new THREE.CylinderGeometry(bigRad / 14,bigRad / 14, bigAxisLen, 32), whiteMat);
        // smallAxis.layers.enable(BLOOM_SCENE)
        // bigAxis.layers.enable(BLOOM_SCENE)
        const axis = new THREE.Object3D();
        const bigAxis1 = bigAxis.clone();
        const bigAxis2 = bigAxis.clone();
        
        axis.add(smallAxis, bigAxis1, bigAxis2);
        axis.children[1].position.set(0,smallAxisLen /2 + bigAxisLen /2,0)
        axis.children[2].position.set(0,-smallAxisLen /2 - bigAxisLen /2,0)
        
        wheel.add(axis);
        axis.rotation.set(Math.PI/2,0,0)
        this._scene.add(wheel)
        this.wheel = wheel


        // leg

        const leg = new THREE.Object3D();
        const legW = bigRad / 10;
        const legH = 100;
        leg.add(
            new THREE.Mesh(new THREE.BoxGeometry( legW, legH, lineRad), whiteMat),
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad, lineRad, legW), whiteMat),
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad, lineRad, legH), whiteMat),
            new THREE.Mesh(new THREE.CylinderGeometry(lineRad, lineRad, legH), whiteMat)
        )
        leg.children[0].position.set(0,-legH / 2,0);
        leg.children[1].rotation.set(Math.PI/2, 0,0);
        leg.children[2].position.set(legW/2, -legH /2,0);
        leg.children[3].position.set(-legW/2, -legH /2,0);
        leg.children[1].name = "legBulb"
        leg.children[2].name = "legBulb"
        leg.children[3].name = "legBulb"
        
        const legSet = new THREE.Object3D();
        
        legSet.add(leg.clone(),leg.clone(),leg.clone(),leg.clone())
        legSet.children[0].position.set(0,0,depth*2/3)
        legSet.children[0].rotation.set(0,0,Math.PI/6)
        legSet.children[1].position.set(0,0,depth*2/3)
        legSet.children[1].rotation.set(0,0,-Math.PI/6)
        legSet.children[2].position.set(0,0,-depth*2/3)
        legSet.children[2].rotation.set(0,0,Math.PI/6)
        legSet.children[3].position.set(0,0,-depth*2/3)
        legSet.children[3].rotation.set(0,0,-Math.PI/6)
        
        
        this._scene.add(legSet)
            
        
        // set bulbs class
        const bulbClass = [];
        for(let i = 0; i<bigRodBulbLen; i++){
            bulbClass.push(this.wheel.getObjectsByProperty("name", `bigRodBulb${i}`));
        }
        for(let i=0; i<outerTorusBulbLen;i++){
            bulbClass.push(this.wheel.getObjectsByProperty("name", `outerTorusBulb${i}`));
        }
        bulbClass.push([smallAxis,bigAxis1,bigAxis2].concat(legSet.getObjectsByProperty("name", "legBulb")));
        bulbClass.push(this.wheel.getObjectsByProperty("name", "plateBulb").concat(this.wheel.getObjectsByProperty("name", "bodySideBulb")));
        this.bulbClass = bulbClass

        // bulbClass.forEach(e=>{e.forEach(e=>e.layers.toggle(BLOOM_SCENE))})

        
        
        


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
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(-50,-50, 70);
        camera.lookAt(-15, 0, 0);
        camera.zoom = 0.9
        this._camera = camera;
    }

    _setupControls() {
        // const controls = new OrbitControls(this._camera, this._renderer.domElement);
        
        // controls.minDistance = 1;
        // controls.maxDistance = 1000;
    }

    _setupLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff);
        // this._scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(100,100,100)
        // this._scene.add(ambientLight);
    }

    update() {
        
        this.angle += ( this.targetRotation - this.angle ) * 0.001;
        this.wheel.rotation.z = this.angle
        for(let i = 0; i<16; i++){
            
            
            this.wheel.children[i].children[1].rotation.set(0,0,-Math.PI / 8 * i - this.angle)
        }
        this.deltaAngle = this.angle - this.prevAngle;
        this.prevAngle = this.angle
        // console.log(this.deltaAngle)
        let enableLevel = Math.floor(Math.abs(this.deltaAngle) *this.bulbClass.length / 0.01 - 20);
        if(enableLevel < 0) enableLevel = 0;
        if(enableLevel > this.bulbClass.length) enableLevel = this.bulbClass.length;
        
        
        if(this.bulbIndex < enableLevel){
            for(let i = this.bulbIndex; i<enableLevel;i++){
                
                this.bulbClass[i].forEach(e=>{e.layers.toggle(BLOOM_SCENE)});
            }
        }
        else{
            for(let i = enableLevel; i<this.bulbIndex;i++){
                this.bulbClass[i].forEach(e=>{e.layers.toggle(BLOOM_SCENE)});
            }
        }
        
        this.bulbIndex = enableLevel;
        
        


        
    }

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