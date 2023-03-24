
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js"

// https://sketchfab.com


class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
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
        this._scene.background = new THREE.Color(0xff9a95);

    }
	_setupControls(){ 

		// new OrbitControls(this._camera, this._divContainer);


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

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerX - this.pointerXOnPointerDown ) * 0.02;
			

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
		const camera = new THREE.OrthographicCamera( - aspectRatio, aspectRatio, 1, - 1, 0.1, 40 );
		
		camera.position.set(-20,20,20)
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
		light.position.set(100, 100, 50);
		console.log(light.shadow)
		
		this._camera.add(light);
		// const helper = new THREE.DirectionalLightHelper(light);
		// this._scene.add(helper);
		const helper = new THREE.CameraHelper( light.shadow.camera );
		this._scene.add( helper );
		this._helper = helper;
		
	}

	_setupModel() {
		
		function pixelTexture( texture ) {

			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			texture.generateMipmaps = false;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			return texture;

		}
		const texChecker = pixelTexture(new THREE.TextureLoader().load( '../data/checker.png' ) );
		texChecker.repeat.set( 30, 30 );



		const stairWidth = 0.06;
		const stairHeight = 0.03;
		const stairGeom = new THREE.BoxGeometry(stairWidth, stairHeight, stairWidth);
		const stairMate = new THREE.MeshPhysicalMaterial({color : 0x54539f, clearcoat : 1, clearcoatRoughness : 1});
		
		const stairNum = 20;
		const stair = new THREE.Mesh(stairGeom, stairMate);
		const smallStairGeom = new THREE.BoxGeometry(stairWidth / 2, stairHeight, stairWidth);
		const smallStair = new THREE.Mesh(smallStairGeom, stairMate);
		
		

		//stairSet 생성
		const stairSet = new THREE.Object3D();
		const stairSetHeight = stairHeight * stairNum;
		this.stairSetHeight = stairSetHeight;
		smallStair.position.set(stairWidth / 4, - stairHeight / 2, stairWidth / 2);
		stairSet.add(smallStair)
		for(let i = 0; i<stairNum; i++){
			const clone = stair.clone();
			clone.position.set(stairWidth / 2 * (i + 1), stairHeight / 2 * (2 * i + 1), stairWidth / 2);
			stairSet.add(clone)
		}
		(function(){
			const clone = stair.clone();
			clone.position.set(stairWidth / 2 * (stairNum + 2), stairHeight / 2 * (2 * stairNum - 1), stairWidth / 2);
			stairSet.add(clone);
		})()
		

		

		const spineWidth = stairWidth / 2 * (stairNum + 1);
		const spineHeight = 10;
		const spineGeom = new THREE.BoxGeometry(spineWidth, spineWidth, spineWidth);
		const spineMate = new THREE.MeshPhysicalMaterial({map : texChecker})
		const spine = new THREE.Object3D();
		const spinePiece = new THREE.Mesh(spineGeom, spineMate);
		for(let i = 0; i<7; i++){
			const clone = spinePiece.clone();
			clone.name = "spinePiece";
			clone.position.set(0, (-1 + i) * spineWidth ,0)
			spine.add(clone)
		}
		
		const building = new THREE.Object3D();
		building.add(spine);
		

		(() => {
			const clone1 = stairSet.clone();
			
			building.add(clone1);
			clone1.position.set(-spineWidth / 2, 0, spineWidth / 2);

			const clone2 = stairSet.clone();
			building.add(clone2);
			clone2.position.set(spineWidth / 2, stairSetHeight, spineWidth / 2);
			clone2.rotation.set(0, Math.PI / 2, 0);

			const clone3 = stairSet.clone();
			building.add(clone3);
			clone3.position.set(spineWidth / 2, stairSetHeight * 2, - spineWidth / 2);
			clone3.rotation.set(0, Math.PI, 0);

			const clone4 = stairSet.clone();
			building.add(clone4);
			clone4.position.set(-spineWidth / 2, stairSetHeight * 3, - spineWidth / 2);
			clone4.rotation.set(0, Math.PI * 3 / 2, 0)

			const clone5 = stairSet.clone();
			building.add(clone5);
			clone5.position.set(-spineWidth / 2, stairSetHeight * 4, spineWidth / 2);
		})()

		this._scene.add(building);
		this.building = building
		building.traverse( function ( object ) {
			if ( object.isMesh ) {
				// if(object.name !== "spinePiece"){
				// 	object.receiveShadow = true;
				// }
				object.castShadow = true;
				object.receiveShadow = true;
				
		
			}
		
		} );
		building.position.set(0,0.5,0)
		

		
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
		
		this._helper.update()
		const delta = ( this.targetRotation - this.building.rotation.y ) * 0.05;
		this.building.rotation.y += delta;
		this.building.position.y += delta * this.stairSetHeight/ (Math.PI / 2)
		if(this.building.rotation.y){
			
		}
	}
}

window.onload = function () {
	new App();
};