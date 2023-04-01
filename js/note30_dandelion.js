
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
        this._scene.background = new THREE.Color(0xffffff);

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
		
		camera.position.set(0,0,5)
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

		const light = new THREE.DirectionalLight(color, 0.3);
		
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
	_setupModel() {
		const dandelionCoreGeom = new THREE.IcosahedronGeometry(1, 5);
		const dandelionCore = new THREE.Mesh(dandelionCoreGeom, new THREE.MeshPhysicalMaterial({color : 0xffff00, flatShading : true}));
		this._scene.add(dandelionCore);

		const dandelionSkinGeom = new THREE.IcosahedronGeometry(2, 5);
		const dandelionSkin = new THREE.Mesh(dandelionSkinGeom, new THREE.MeshPhysicalMaterial({color : 0x049ef4, flatShading : true, transparent : true, opacity : 0.5}));
		this._scene.add(dandelionSkin)
		
		dandelionCoreGeom.positionVectors = this.numArrayToVectorArray(dandelionCoreGeom.attributes.position.array);
		dandelionSkinGeom.positionVectors = this.numArrayToVectorArray(dandelionSkinGeom.attributes.position.array);
		
		const lines = [];
		for(let i = 0 ; i< dandelionCoreGeom.positionVectors.length; i++){
			const points = [];
			points.push(dandelionCoreGeom.positionVectors, dandelionSkinGeom.positionVectors);
			const geometry = new THREE.BufferGeometry().setFromPoints( points );
			const line = new THREE.Line( geometry, material );
		}
		lines.push


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