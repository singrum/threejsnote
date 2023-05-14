
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

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
		// this._setupBackground(); 
		// this._setupControls()
		this._setupTouch();
		this._damp = 0.3
		this.time = 0;
		this.time2 = 0;
		this.prevTime = performance.now();
		
		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}
	
	_setupTouch(){

		if ('ontouchstart' in window) window.addEventListener("touchstart", ()=>{this._isTouch = true;})
		else window.addEventListener("mousedown", ()=>{this._isTouch = true;})
	}

	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0,0,40)
		this._camera = camera;
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(20, 20, 20);
		this._scene.add(light);
	}
	_setupBackground(){
		const loader = new THREE.TextureLoader();
		loader.load("../data/outerspace.jpg", texture => {
			const renderTarget = new THREE.WebGLCubeRenderTarget(texture.image.height);
			renderTarget.fromEquirectangularTexture(this._renderer, texture);
			this._scene.background = renderTarget.texture;
			// this._setupModel();
		})
	}
	_setupModel() {
		const textureLoader = new THREE.TextureLoader();
		const map = textureLoader.load(
			"../data/Earth_Texture_Full.webp", texture => {
				texture.repeat.x = 1;
				texture.repeat.y = 1;
				texture.wrapS = THREE.ClampToEdgeWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;
				texture.offset.x = 0;
				texture.offset.y = 0;
				texture.rotation = THREE.MathUtils.degToRad(0)
				texture.center.x = 0.5;
				texture.center.y = 0.5;
				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.NearestMipMapLinearFilter;
			}
		)
		const geometry = new THREE.SphereGeometry(10, 128,128);
		this._geometry = geometry;
		const material = new THREE.MeshPhysicalMaterial({map : map});
		const sphere = new THREE.Mesh(geometry, material);
		sphere.rotateZ(0.3)
		this._scene.add(sphere)
		this._count = geometry.attributes.position.count;

		this._positionClone = JSON.parse(
			JSON.stringify(geometry.attributes.position.array)
		)
		this._normalsClone = JSON.parse(
			JSON.stringify(geometry.attributes.normal.array)
		)
		this._sphere = sphere;


	
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
		const deltaTime = (currentTime - this.prevTime) / 1000;
		this.prevTime = currentTime;
	  
		this.time += deltaTime/2; // time 변수를 업데이트
		
		this.time2 += deltaTime/3;

		if(this._isTouch){
			this._isTouch = false;
			this.time = 0;
		}
		
		this._sphere.rotation.y = this.time2

		for(let i = 0; i < this._count; i++){
			const uX = this._geometry.attributes.uv.getX(i) * Math.PI * 16;
			const uY = this._geometry.attributes.uv.getY(i) * Math.PI * 16;
			
			const xangle = uX + this.time * 10;
			const xsin = Math.sin(xangle) * this._damp * Math.exp(-this.time)
			const yangle = uY + this.time * 10;
			const ycos = Math.sin(yangle) * this._damp * Math.exp(-this.time)

			const ix = i* 3;
			const iy = i * 3 + 1;
			const iz = i * 3 + 2;
			this._geometry.attributes.position.setX(i, this._positionClone[ix] + this._normalsClone[ix] * (xsin + ycos));
			this._geometry.attributes.position.setY(i, this._positionClone[iy] + this._normalsClone[iy] * (xsin + ycos));
			this._geometry.attributes.position.setZ(i, this._positionClone[iz] + this._normalsClone[iz] * (xsin + ycos));

		}
		this._geometry.computeVertexNormals();
		this._geometry.attributes.position.needsUpdate = true;
		
	}
}

window.onload = function () {
	new App();
};