
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {VertexNormalsHelper} from '../node_modules/three/examples/jsm/helpers/VertexNormalsHelper.js'


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
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.set(-3,2,3);
		this._camera = camera;
        this._scene.add(camera) // 빛이 카메랄 따라가도록 설정
	}

	_setupLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this._scene.add(ambientLight)

		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		// this._scene.add(light);
        this._camera.add(light); // 빛이 카메랄 따라가도록 설정
	}

	_setupModel() {
		const textureLoader = new THREE.TextureLoader();



		const map = textureLoader.load("../img/Glass/Glass_Window_002_basecolor.jpg");
        const mapAO = textureLoader.load("../img/Glass/Glass_Window_002_ambientOcclusion.jpg");
        const mapHeight = textureLoader.load("../img/Glass/Glass_Window_002_height.png");
        const mapNormal = textureLoader.load("../img/Glass/Glass_Window_002_normal.jpg");
        const mapRoughness = textureLoader.load("../img/Glass/Glass_Window_002_roughness.jpg");
        const mapMetalic  = textureLoader.load("../img/Glass/Glass_Window_002_metallic.jpg");
        const mapAlpha = textureLoader.load("../img/Glass/Glass_Window_002_opacity.jpg");


		const material = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,

			map : map,
            normalMap : mapNormal,

            displacementMap : mapHeight,
            displacementScale : 0.2,
            displacementBias: -0.15,

            aoMap: mapAO,
            aoMapIntensity:1, // uv2 설정 필요
            
            roughnessMap: mapRoughness,
            roughness: 0.5,

            metalnessMap: mapMetalic,
            metalness: 0.1,

            alphaMap: mapAlpha,
            transparent:true,


		})

		const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1, 256,256,256), material);
		box.position.set(-1,0,0);
        box.geometry.attributes.uv2 = box.geometry.attributes.uv;
		this._scene.add(box);

        //normal vector
        // const boxHelper = new VertexNormalsHelper(box, 0.1, 0xffff00);
        // this._scene.add(boxHelper);

		const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 512,512), material);
		sphere.position.set(1,0,0);
		this._scene.add(sphere);

        //normal vector
        // const sphereHelper = new VertexNormalsHelper(sphere, 0.1, 0xffff00);
        // this._scene.add(sphereHelper);
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
		// this._cube.rotation.x = time;
		// this._cube.rotation.y = time;
	}
}

window.onload = function () {
	new App();
};