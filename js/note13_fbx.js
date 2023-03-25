import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from "../node_modules/three/examples/jsm/loaders/FBXLoader.js"

// https://https://www.mixamo.com/#/


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

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls()

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

	_setupControls(){
		this._controls = new OrbitControls(this._camera, this._divContainer);
	}

    _zoomFit(object3D, camera, viewMode, bFront){
        const box = new THREE.Box3().setFromObject(object3D);
        const sizeBox = box.getSize(new THREE.Vector3()).length();
        const centerBox = box.getCenter(new THREE.Vector3());

		let offsetX = 0, offsetY = 0, offsetZ = 0;
		viewMode === "X" ? offsetX = 1 : (viewMode === "Y") ? offsetY = 1 : offsetZ = 1;

		if(!bFront){
			offsetX *= -1;
			offsetY *= -1;
			offsetZ *= -1;
		}
		camera.position.set(
			centerBox.x + offsetX, centerBox.y + offsetY, centerBox.z + offsetZ);



        const halfSizeModel = sizeBox * 0.5;
        const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
        const distance = halfSizeModel / Math.tan(halfFov);
        const direction = (new THREE.Vector3()).subVectors(
            camera.position, centerBox).normalize();
        const position = direction.multiplyScalar(distance).add(centerBox);

		camera.position.copy(position);
        camera.near = sizeBox / 100;
        camera.far = sizeBox * 100;

        camera.updateProjectionMatrix();
        camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
		this._controls.target.set(centerBox.x, centerBox.y, centerBox.z)

    }
	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.z = 2;
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		this._camera.add(light);
	}

	_setupModel() {
		this._clock = new THREE.Clock();
		const loader = new FBXLoader();
        const url = '../data/fbx/Breakdance Uprock Var 2.fbx';
        loader.load(
            url,
            object=>{
				this._mixer = new THREE.AnimationMixer(object);
				const action = this._mixer.clipAction(object.animations[0]);
				action.play()
                this._scene.add(object);
				this._zoomFit(object, this._camera, "Z", true);
            }
        )
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
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
		
		const delta = this._clock.getDelta();
		if(this._mixer) this._mixer.update(delta)
	}
}

window.onload = function () {
	new App();
};