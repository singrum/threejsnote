
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';

// https://sketchfab.com


class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio( window.devicePixelRatio );
		const scene = new THREE.Scene();
		this._scene = scene;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.time = 0;
		
		this.prevTime = performance.now()

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();
		this._setupBackground();
		this._setupGUI();

		window.onresize = this.resize.bind(this);
		this.resize();
		this.temp = 0;
		requestAnimationFrame(this.render.bind(this));
	}
	_setupGUI(){
		const gui = new GUI();
		var guiElement = gui.domElement;
		console.log(guiElement)
		guiElement.style.position = 'absolute';  // 절대 위치 설정
		guiElement.style.top = '0';          // 원하는 상단 위치
		guiElement.style.right = '0';   
		guiElement.style.margin = '0';
		gui.addColor( this, 'seedColor1' )
		.onChange( ()=> {
			this.attachedSeeds.forEach((e,i,arr)=>{
				e.traverse(line=>{
					const color = this.gradientFit(i / arr.length, new THREE.Color(this.seedColor1), new THREE.Color(this.seedColor2));
					line.material.color = color
					
				})
			})
		} );

		gui.addColor( this, 'seedColor2' )
		.onChange( () => {
			
			this.attachedSeeds.forEach((e,i,arr)=>{
				e.traverse(line=>{
					
					const color = this.gradientFit(i / arr.length, new THREE.Color(this.seedColor1), new THREE.Color(this.seedColor2));
					line.material.color = color
					
				})
			})
		} )
		.domElement.addEventListener('touchstart', function(event) {
			event.stopPropagation();
		});

		gui.addColor( {backgroundColor : 0xcae2f5}, 'backgroundColor' )
		.onChange( value => {
			this._scene.background.set(value)
		} );

		gui.addColor( {stemColor : 0xBAFFB4}, 'stemColor' )
		.onChange( value => {
			this.stemMaterial.color = new THREE.Color(value);
			
		} );
		gui.addColor({coreColor : 0x8D7B68}, 'coreColor' )
		.onChange( value => {
			this.dandelionCoreMate.color = new THREE.Color(value);
			
		} );
	}
    _setupBackground(){
		this.backgroundColor = 0xcae2f5
        this._scene.background = new THREE.Color(this.backgroundColor);
		this._scene.fog = new THREE.Fog( 0xcccccc, 10, 100 );
    }
	_setupControls(){ 
		const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.startX = event.clientX
			this.startY = event.clientY
			this.pointerXOnPointerDown = event.clientX - window.innerWidth / 2;
			this.targetRotationOnPointerDown = this.targetRotation;

			document.addEventListener( 'pointermove', onPointerMove );
			document.addEventListener( 'pointerup', onPointerUp );

		}

		const onPointerMove = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.pointerX = event.clientX - window.innerWidth / 2;

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerX - this.pointerXOnPointerDown ) * 0.014;
			


		}

		const onPointerUp = (event) => {
			
			if ( event.isPrimary === false ) return;
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'pointerup', onPointerUp );

		}
		this.targetRotation = 0;
		this.targetRotationOnPointerDown = 0;
		this.pointerX = 0;
		this.pointerXOnPointerDown = 0;
		this._divContainer.style.touchAction = 'none';
		this._divContainer.addEventListener( 'pointerdown', onPointerDown );





	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		
		camera.position.set(0,0,18)
		camera.lookAt(0,0,0)
		// camera.zoom = 0.1
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 0.5;

		const defaultLight = new THREE.AmbientLight(0xffffff, 0.5);
		this._scene.add(defaultLight)

		const light = new THREE.DirectionalLight(color, 0.7);
		
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 1000;
		light.shadow.camera.bottom = light.shadow.camera.left = -1000;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 2048 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 1;
		light.position.set(10, 10, 10);
		
		
		this._camera.add(light);
		
	}
	numArrayToVectorArray(numArray){
		const vectorArray = [];
		for (let i = 0; i < numArray.length; i += 3) {
			const x = numArray[i];
			const y = numArray[i + 1];
			const z = numArray[i + 2];
			const vector = new THREE.Vector3(x, y, z);
			vectorArray.push(vector);
		}
		return vectorArray
	}
	debugPoint(pos){
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute([pos.x, pos.y, pos.z], 3)
		);

		const material = new THREE.PointsMaterial({
			color:0xff38a2,
			size: 5,
			sizeAttenuation : false
		})
		const points = new THREE.Points(geometry, material);
		this._scene.add(points)
	}
	_setupModel() {
		const hairLen = 1;
		const seedLen = 1;
		const coreRad = 1;
		const dandelionSeedHelperGeom = new THREE.SphereGeometry(hairLen, 16,16); 
		dandelionSeedHelperGeom.positionVectors = this.numArrayToVectorArray(dandelionSeedHelperGeom.attributes.position.array);

		const seedColor = 0xAEE2FF;
		const dandelionSeed = new THREE.Object3D();
		const dandelionSeedStem = new THREE.Line( new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0, seedLen)] ), new THREE.LineBasicMaterial({color : seedColor}) );

		const dandelionCoreGeom = new THREE.IcosahedronGeometry(coreRad, 1);
		this.dandelionCoreMate = new THREE.MeshPhysicalMaterial({color : 0x8D7B68, flatShading : true});
		const dandelionCore = new THREE.Mesh(dandelionCoreGeom, this.dandelionCoreMate);

		const hairs = new THREE.Object3D();
		for(let i = 0 ; i< dandelionSeedHelperGeom.positionVectors.length; i++){
			if(0.3 < dandelionSeedHelperGeom.positionVectors[i].z && dandelionSeedHelperGeom.positionVectors[i].z < 0.5){
				const points = [];
				points.push(new THREE.Vector3(0,0,0), dandelionSeedHelperGeom.positionVectors[i]);
				const geometry = new THREE.BufferGeometry().setFromPoints( points );
				const line = new THREE.Line( geometry, new THREE.LineBasicMaterial({color : seedColor}) );
				
				hairs.add(line);	
			}
			
		}
		dandelionSeed.add(dandelionSeedStem, hairs);
		dandelionSeedStem.position.set(0,0,- seedLen /2);
		hairs.position.set(0,0,seedLen /2);
		const dandelionSeedWrap = new THREE.Object3D();
		dandelionSeedWrap.add(dandelionSeed);
		dandelionSeed.position.set(0,0,seedLen / 2 + coreRad);


		dandelionCoreGeom.positionVectors = this.numArrayToVectorArray(dandelionCoreGeom.attributes.position.array);
		
		this.attachedSeeds = []
		this.flyingSeeds = []
		for(let i = 0 ; i< dandelionCoreGeom.positionVectors.length; i++){
			const seedClone = dandelionSeedWrap.clone();
			
			seedClone.lookAt(dandelionCoreGeom.positionVectors[i]);
			
			dandelionCore.add(seedClone)
			this.attachedSeeds.push(seedClone.children[0])
			
		}
		this.attachedSeeds = this.attachedSeeds.sort((a,b)=>{
			if(a.rotation.x > b.rotation.x){
				return 1;
			}
			else return -1;
		})
		this.seedColor1 = 0xF7C8E0;
		this.seedColor2 = 0xDFFFD8;
		this.attachedSeeds.forEach((e,i,arr)=>{
			e.traverse(line=>{
				const color = this.gradientFit(i / (arr.length), new THREE.Color(this.seedColor1), new THREE.Color(this.seedColor2));
				line.material = new THREE.LineBasicMaterial({color : color	})
				
			})
		})
		this.stemColor = 0xbaffb4
		const stemMaterial = new THREE.MeshPhysicalMaterial( { color: this.stemColor, flatShading : false} );
		this.stemMaterial = stemMaterial;
		// const stem = new THREE.Mesh( stemGeometry, stemMaterial );
		const stem = new THREE.Mesh( new THREE.CylinderGeometry(0.1,0.1,20,32), stemMaterial );
		stem.position.set(0,-10,0)
		

		this.stem = stem
		const dandelion = new THREE.Object3D();
		dandelion.add(stem, dandelionCore);
		this._scene.add(dandelion)
		this.group = dandelion
		this.dandelionCore = dandelionCore

		this.attachedSeeds.forEach(seed =>{
			seed.rand1 = this.randRange(2,3)
			seed.rand2 = this.randRange(1,2)
			seed.rand3 = this.randRange(1,2)
		})

		
		


	}

	gradientFit(value, startColor, endColor){
		
		const r = THREE.MathUtils.mapLinear(value, 0, 1, startColor.r, endColor.r);
		
		const g = THREE.MathUtils.mapLinear(value, 0, 1, startColor.g, endColor.g, 0, 1);
		const b = THREE.MathUtils.mapLinear(value, 0, 1, startColor.b, endColor.b, 0, 1);
		return new THREE.Color(r,g,b);
	}

	randRange(a,b){
		return Math.random() * (b - a) + a;
	}
	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render() {
		this._renderer.render(this._scene, this._camera);
		this.update();
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
		const currentTime = performance.now();
		this.deltaTime = (currentTime - this.prevTime) / 1000 * 4.5;
		this.prevTime = currentTime;
        this.time += this.deltaTime 
		

	    this.seedFly(this.velocity);
		this.group.rotation.y += ( this.targetRotation - this.group.rotation.y ) * 0.1;
		this.curr = this.group.rotation.y;
		
		
		this.velocity = Math.floor(Math.abs(this.curr - this.temp) * 10);
		
		this.temp = this.curr;
	}
	getRandomNum(num){
		
	}
	seedFly(velocity){
		
		for(let i = 0; i< velocity; i++){
			
			if(this.attachedSeeds.length > 0){
				
				const randomindex = this.randomChoice(this.attachedSeeds);
				const seed = this.attachedSeeds[randomindex];
				this.attachedSeeds.splice(randomindex, 1);
				this.flyingSeeds.push(seed);
			}
	
		}

		
		for(let seed of this.flyingSeeds){
			seed.position.x += this.deltaTime * 1.1 *  seed.rand1;
			seed.position.y += this.deltaTime * 1.1 * seed.rand2;
			seed.position.z += this.deltaTime * 1.1 * seed.rand3;
			seed.rotation.x += this.deltaTime * seed.rand1 / 4;
			seed.rotation.y += this.deltaTime * seed.rand1 / 4;
			seed.rotation.z += this.deltaTime/3;
		}

	}
	randomChoice(arr) {
		const randomIndex = Math.floor(Math.random() * arr.length);
		return randomIndex;
	}
}

window.onload = function () {
	new App();
};