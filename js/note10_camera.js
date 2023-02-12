import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {RectAreaLightUniformsLib} from '../node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { RectAreaLightHelper } from '../node_modules/three/examples/jsm/helpers/RectAreaLightHelper.js';

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
		const camera1 = new THREE.PerspectiveCamera(
            100, //fov
            window.innerWidth / window.innerHeight, //aspect
            0.1, //zNear
            100 //zFar
        );
        camera1.position.set(7,7,0);
        camera1.lookAt(0,0,0);

        const aspect = window.innerWidth / window.innerHeight;
        const camera2 = new THREE.OrthographicCamera(
            -1 * aspect , 1 * aspect, // xLeft, xRight
            1, -1, // yTop, yBottom
            0.1, 100 // zNear, zFar
        );
        camera2.position.set(7,7,0);
        camera2.lookAt(0,0,0);
		camera2.zoom = 0.1
        this._camera = camera1;

	}

	_setupLight() {
		RectAreaLightUniformsLib.init();
		const light = new THREE.RectAreaLight(0xffffff, 5, 4, 4);
		light.position.set(0,5,0);
		light.rotation.x = THREE.MathUtils.degToRad(-90);

		const helper = new RectAreaLightHelper(light);
		light.add(helper);

		this._scene.add(light);
		this._light = light

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
		this._scene.add(ground);

		const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64,64,0,Math.PI);
		const bigSphereMaterial = new THREE.MeshStandardMaterial({
			color:"#ffffff",
			roughness:0.1,
			metalness:0.2,
		});
		const bigSphere = new THREE.Mesh(bigSphereGeometry,bigSphereMaterial);
		bigSphere.rotation.x = THREE.MathUtils.degToRad(-90);
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
		this._scene.add(smallSpherePivot)


		//
		const targetPivot = new THREE.Object3D();
		const target = new THREE.Object3D();
		targetPivot.add(target);
		targetPivot.name = "targetPivot";
		target.position.set(3,0.5,0);
		this._scene.add(targetPivot)
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspect = width / height;
		
		// camera 속성에 따른 창 크기 조절 이벤트
		if(this._camera instanceof THREE.PerspectiveCamera){
			this._camera.aspect = aspect;
		}
		else{
			this._camera.left = -1 * aspect;
			this._camera.right = 1 * aspect;
		}
		//
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render(time) {
		this._renderer.render(this._scene, this._camera);
		this.update(time);
		requestAnimationFrame(this.render.bind(this));
	}

	update(time) {
		time *= 0.001;

		const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");
		if(smallSpherePivot){
			smallSpherePivot.rotation.y = THREE.MathUtils.degToRad(time * 50);

			//
			const smallSphere = smallSpherePivot.children[0];
			smallSphere.getWorldPosition(this._camera.position);

			const targetPivot = this._scene.getObjectByName("targetPivot")
			if(targetPivot){
				targetPivot.rotation.y = THREE.MathUtils.degToRad(time * 50 + 10);
				const target = targetPivot.children[0];
				const pt = new THREE.Vector3()
				target.getWorldPosition(pt)
				this._camera.lookAt(pt)
				console.log(this._camera.position, pt)
			}
		}
	}
}

window.onload = function () {
	new App();
};