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


        this._setupBackground();
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		

		window.onresize = this.resize.bind(this);
		this.resize();

		
	}

    _setupBackground(){
        this._scene.background = new THREE.Color(0xdddddd);
    }
	_setupControls(){

		const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;

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
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0,3,-10);
		this._camera = camera;
        this._scene.add(this._camera)
		this._camera.lookAt(0,3,0)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(0, 3, -10);
		this._scene.add(light);
	}

	_setupModel() {
		const axesHelper = new THREE.AxesHelper(5)
		this._scene.add(axesHelper)

		const gltfLoader = new GLTFLoader()
        const url = '../data/patrick/scene.gltf';
        gltfLoader.load(
            url,
            (gltf)=>{
                const root = gltf.scene.children[0];
				this.group = root;
                // this._scene.add(root);
				const children = root.children[0].children;
				
				children.splice(2,3)
				// 받침대 : children[0], children[1]
				// 우편함 : children[2],children[3], children[4]
				// 해마&뚱이 : children[5]
				// console.log(root)
				this._scene.add(root)
				children[2].rotation.y = 1
				// console.log(root.children[0].children[0].children)






				this._setupControls()
				requestAnimationFrame(this.render.bind(this));
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

		this.update(time);
		requestAnimationFrame(this.render.bind(this));
	}

	update(time) {
		time *= 0.001;
		this.group.rotation.z += ( this.targetRotation - this.group.rotation.z ) * 0.05;
		

		this._camera.lookAt(0,3,0);

		this._renderer.clear();
		this._renderer.render(this._scene, this._camera);

	}
}

window.onload = function () {
	new App();
};