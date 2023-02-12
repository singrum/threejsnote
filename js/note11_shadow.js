import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

// 렌더러, 광원, 모델에 그림자 설정



class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.shadowMap.enabled = true;

		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		const scene = new THREE.Scene();
		this._scene = scene;

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls()

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.set(7,7,0);
		camera.lookAt(0,0,0)
		this._camera = camera;
	}

	_setupLight() {
		const auxLight = new THREE.DirectionalLight(0xffffff, 0.5);
		auxLight.position.set(0,5,0);
		auxLight.target.position.set(0,0,0);
		this._scene.add(auxLight.target);
		this._scene.add(auxLight);



		const light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(0,5,0)
		light.target.position.set(0,0,0);
		this._scene.add(light.target);
		light.shadow.camera.top = light.shadow.camera.right = 6;
		light.shadow.camera.bottom = light.shadow.camera.left = -6;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 2048 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 1; // 흐리기 조정

		const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
		this._scene.add(cameraHelper)
		console.log(light.shadow.camera)

		this._scene.add(light);
		this._light = light
		light.castShadow = true;
	}

	_setupModel() {
		const groundGeometry = new THREE.PlaneGeometry(10,10);
		const groundMaterial = new THREE.MeshStandardMaterial({
			color: "#2c3e50",
			roughness: 0.5,
			metalness: 0.5,
			side: THREE.DoubleSide,
		});
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = THREE.MathUtils.degToRad(-90);
		ground.receiveShadow = true;
		this._scene.add(ground);

		const bigSphereGeometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 64, 2, 3);
		const bigSphereMaterial = new THREE.MeshStandardMaterial({
			color:"#ffffff",
			roughness:0.1,
			metalness:0.2,
		});
		const bigSphere = new THREE.Mesh(bigSphereGeometry,bigSphereMaterial);
		bigSphere.position.y =1.6
		bigSphere.receiveShadow = true;
		bigSphere.castShadow = true;
		this._scene.add(bigSphere);
		
		const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32,32);
		const torusMaterial = new THREE.MeshStandardMaterial({
			color: "#9b59b6",
			roughness: 0.5,
			metalness:0.9,
		})
		for(let i=0; i<8; i++){
			const torusPivot = new THREE.Object3D();
			const torus = new THREE.Mesh(torusGeometry, torusMaterial);
			torusPivot.rotation.y = THREE.MathUtils.degToRad(45*i);
			torus.position.set(3,0.5,0);
			torusPivot.add(torus);
			torus.receiveShadow = true;
			torus.castShadow = true;
			this._scene.add(torusPivot);
		}


		const smallSphereGeometry = new THREE.SphereGeometry(0.3,32,32);
		const smallSphereMaterial = new THREE.MeshStandardMaterial({
			color: "#e74c3c",
			roughness: 0.2,
			metalness: 0.5,
		})
		const smallSpherePivot = new THREE.Object3D();
		const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
		smallSpherePivot.add(smallSphere);
		smallSpherePivot.name = "smallSpherePivot";
		smallSphere.position.set(3,0.5,0);
		smallSphere.receiveShadow = true;
		smallSphere.castShadow = true;
		this._scene.add(smallSpherePivot)
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	update(time) {
		time *= 0.001;

		const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");
		if(smallSpherePivot){
			smallSpherePivot.rotation.y = THREE.MathUtils.degToRad(time * 50);

			if(this._light.target){
				const smallSphere = smallSpherePivot.children[0];
				smallSphere.getWorldPosition(this._light.target.position);
				if(this._lightHelper) this._lightHelper.update();
			}
		}
	}

	render(time) {
		this._renderer.render(this._scene, this._camera);
		this.update(time);
		requestAnimationFrame(this.render.bind(this));
	}


}

window.onload = function () {
	new App();
};