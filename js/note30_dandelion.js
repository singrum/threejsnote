
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js"
import {VertexNormalsHelper} from "../node_modules/three/examples/jsm/helpers/VertexNormalsHelper.js";

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

		this.rot = 0;

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();
		this._setupBackground();

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0xc8e3c0);

    }
	_setupControls(){ 

		new OrbitControls(this._camera, this._divContainer);


		// const onPointerDown = ( event ) => {
			
		// 	if ( event.isPrimary === false ) return;
		// 	this.startX = event.clientX
		// 	this.startY = event.clientY
		// 	this.pointerXOnPointerDown = event.clientX - window.innerWidth / 2;
		// 	this.targetRotationOnPointerDown = this.targetRotation;

		// 	document.addEventListener( 'pointermove', onPointerMove );
		// 	document.addEventListener( 'pointerup', onPointerUp );

		// }

		// const onPointerMove = ( event ) => {
			
		// 	if ( event.isPrimary === false ) return;
		// 	this.pointerX = event.clientX - window.innerWidth / 2;

		// 	this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerX - this.pointerXOnPointerDown ) * 0.02;
			

		// }

		// const onPointerUp = (event) => {
			
		// 	if ( event.isPrimary === false ) return;
			
		// 	document.removeEventListener( 'pointermove', onPointerMove );
		// 	document.removeEventListener( 'pointerup', onPointerUp );

		// }
		// this.targetRotation = 0;
		// this.targetRotationOnPointerDown = 0;
		// this.pointerX = 0;
		// this.pointerXOnPointerDown = 0;
		// this._divContainer.style.touchAction = 'none';
		// this._divContainer.addEventListener( 'pointerdown', onPointerDown );



	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		
		camera.position.set(0,0,10)
		camera.lookAt(0,0,0)
		// camera.zoom = 0.1
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 0.5;

		const defaultLight = new THREE.AmbientLight(0xffffff, 0.4);
		this._scene.add(defaultLight)

		const light = new THREE.DirectionalLight(color, 0.5);
		
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
		const hairLen = 1
		const dandelionSeedHelperGeom = new THREE.IcosahedronGeometry(hairLen, 2); //Icosahedron
		// const dandelionSeedHelper = new THREE.Mesh(dandelionSeedHelperGeom, new THREE.MeshPhysicalMaterial({color : 0xffff00, flatShading : true}));
		
		dandelionSeedHelperGeom.positionVectors = this.numArrayToVectorArray(dandelionSeedHelperGeom.attributes.position.array);
		const seedLen = 2;

		const dandelionSeed = new THREE.Line( new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,seedLen)] ), new THREE.LineBasicMaterial({color : 0xffffff}) );

		// const dandelionSeedSup = new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.3,32), new THREE.MeshPhysicalMaterial({color : 0x4F200D}));
		// dandelionSeedSup.position.set(0,1,0);
		
		

		// dandelionSeed.add(dandelionSeedSup);

		const hairs = new THREE.Object3D();
		for(let i = 0 ; i< dandelionSeedHelperGeom.positionVectors.length; i++){
			if(dandelionSeedHelperGeom.positionVectors[i].z < 0.5){
				continue;
			}
			const points = [];
			points.push(new THREE.Vector3(0,0,0), dandelionSeedHelperGeom.positionVectors[i]);
			const geometry = new THREE.BufferGeometry().setFromPoints( points );
			const line = new THREE.Line( geometry, new THREE.LineBasicMaterial({color : 0xffffff}) );
			
			hairs.add(line);
		}
		dandelionSeed.add(hairs);
		hairs.position.set(0,0,seedLen)
		
		

		const dandelionCoreGeom = new THREE.IcosahedronGeometry(1, 1);
		const dandelionCore = new THREE.Mesh(dandelionCoreGeom, new THREE.MeshPhysicalMaterial({color : 0x8D7B68, flatShading : true}))
		dandelionCoreGeom.positionVectors = this.numArrayToVectorArray(dandelionCoreGeom.attributes.position.array);
		
		console.log(dandelionCoreGeom)
		for(let i = 0 ; i< dandelionCoreGeom.positionVectors.length; i++){
			const seedClone = dandelionSeed.clone();
			
			seedClone.lookAt(dandelionCoreGeom.positionVectors[i]);
			
			dandelionCore.add(seedClone)
			
			
			
		}
		this._scene.add(dandelionCore)
		
		const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,10,32), new THREE.MeshPhysicalMaterial({color : 0x54B435}));
		stem.position.set(0,-5,0)
		this._scene.add(stem);




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
		
	}
}

window.onload = function () {
	new App();
};