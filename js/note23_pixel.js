import * as THREE from '../node_modules/three/build/three.module.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
class App {
	constructor() {
		document.querySelector("body").innerHTML = 
		`<div id="webgl_container"></div>
		<div id = "score">score : 0</div>
		<div class="modal fade" id="loseModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content" style="background-color: rgba(0,0,0,0); border-color: rgba(0,0,0,0);">
					<div class="modal-body" >
						<div style ="font-size: 40px; color : #ffffff">Game Over!</div>
						<br>
						<button type="button" class="btn btn-primary" id="restart" >restart</button>
					</div>
				</div>
			</div>
    	</div>`
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.shadowMap.enabled = true;
		renderer.setSize(window.innerWidth, window.innerHeight);
		const scene = new THREE.Scene();
		this._scene = scene;
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupBackground();
		
        this._setupControls()
		window.onresize = this.resize.bind(this);


        
        const composer = new EffectComposer( renderer );
        const renderPixelatedPass = new RenderPixelatedPass( 6, this._scene, this._camera );
        renderPixelatedPass.normalEdgeStrength = 0.3;
        renderPixelatedPass.depthEdgeStrength = 0.35;
        composer.addPass( renderPixelatedPass );
        this._composer = composer



		this.resize();
		requestAnimationFrame(this.render.bind(this));

		

		
	}
	_setupControls(){
        new OrbitControls(this._camera, this._divContainer);
	}


	_setupBackground(){
		this._scene.background = new THREE.Color(0xc4e4fe)
	}



	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
		camera.position.set(20, 40, 0)
		camera.zoom = 0.32
		camera.lookAt(0,0,0)
		this._camera = camera;
        this._scene.add(camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(40, 40, 30);
		this._camera.add(light);
		light.castShadow = true;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 1024
		light.shadow.radius = 5


		light.shadow.camera.top = light.shadow.camera.right = 20;
		light.shadow.camera.bottom = light.shadow.camera.left = -20;
		

	}

	_setupModel() {
		const baseGeometry = new THREE.PlaneGeometry(40,40);
		const baseMaterial = new THREE.MeshPhysicalMaterial({
			color: 0xaaaaaa,
			emissive: 0x000000,
			roughness: 1,
			metalness: 0,
			wireframe: false,
			flatShading: false,
			clearcoat:1,
			clearcoatRoughness:0
		})
		const base = new THREE.Mesh(baseGeometry, baseMaterial);
		base.rotation.x = -Math.PI/ 2
		this._scene.add(base);
		base.receiveShadow = true;
        



        const cubeGeometry = new THREE.BoxGeometry(10,10,10);
        const cubeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x33CBFF,
			emissive: 0x000000,
			roughness: 1,
			metalness: 0,
			wireframe: false,
			flatShading: false,
			clearcoat:1,
			clearcoatRoughness:0
        })
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0,5,0);
        this._scene.add(cube)
		cube.castShadow = true
		this._cube = cube;


		// const appleGeometry = new THREE.SphereGeometry(0.5,10,10);
		// const appleMaterial = new THREE.MeshPhysicalMaterial({
		// 	color: 0xff0000,
		// 	emissive: 0xff0000,
		// 	roughness: 1,
		// 	metalness: 0,
		// 	wireframe: false,
		// 	flatShading: false,
		// 	clearcoat:1,
		// 	clearcoatRoughness:0
		// })
		// const apple = new THREE.Mesh(appleGeometry,appleMaterial);
		// this._scene.add(apple)
		// apple.castShadow = true
		// apple.matrixAutoUpdate = false
		// apple.matrix = new THREE.Matrix4().makeTranslation(this.appleCoordinate.x,0.5,this.appleCoordinate.z)
		// this._apple = apple;


	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
        this._composer.setSize(width, height );
	}

	render() {
        this._composer.render();
		// this._renderer.render(this._scene, this._camera);
		this.update();
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
		this.time += 0.07;
		
	}

	_showModal(){
		if(!this.once) return;
		const myModalEl = new bootstrap.Modal(document.querySelector('#loseModal'));
		myModalEl.show()
		this.once = !this.once
	}
	_checkFall(){
		if (this.coordinate.x + this.len.x / 2 <= -this.baseWidth / 2 ||
		this.coordinate.x - this.len.x / 2 >= this.baseWidth / 2 ||
		this.coordinate.z + this.len.x / 2 <= -this.baseWidth / 2 ||
		this.coordinate.z - this.len.x / 2 >= this.baseWidth / 2)
		return true;
	}
	_checkEatApple(){
		if (this.coordinate.x - this.len.x / 2 <= this.appleCoordinate.x &&
			this.coordinate.x + this.len.x / 2 >= this.appleCoordinate.x &&
			this.coordinate.z - this.len.z / 2 <= this.appleCoordinate.z &&
			this.coordinate.z + this.len.z / 2 >= this.appleCoordinate.z)
			return true;
		
	}
	rangeRandom(){
		return Math.floor(Math.random() * 29) - (29 - 1)/2;
	}
	_makeNewApple(){	
		[this.appleCoordinate.x, this.appleCoordinate.z] = [this.rangeRandom(), this.rangeRandom()]
		this._apple.matrix = new THREE.Matrix4().makeTranslation(this.appleCoordinate.x,0.5,this.appleCoordinate.z)
	}
	_setLenAndCoordinate(direction){
		switch(direction){
			case 0:
				[this.len.z, this.len.y] = [this.len.y, this.len.z]
				this.coordinate.z = this.coordinate.z - this.len.z / 2 - this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationX(Math.PI/2), this.initMatrix);
				break;
			case 1:
				[this.len.z, this.len.y] = [this.len.y, this.len.z]
				this.coordinate.z = this.coordinate.z + this.len.z / 2 + this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationX(Math.PI/2), this.initMatrix);
				break;
			case 2:
				[this.len.x, this.len.y] = [this.len.y, this.len.x]
				this.coordinate.x = this.coordinate.x + this.len.x / 2 + this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationZ(Math.PI/2), this.initMatrix);
				break;
			case 3:
				[this.len.x, this.len.y] = [this.len.y, this.len.x]
				this.coordinate.x = this.coordinate.x - this.len.x / 2 - this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationZ(Math.PI/2), this.initMatrix);
				break;
		}
	}
	_rotate(initMatrix, angle, direction){
		switch(direction){
			case 0:
				
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x,0,this.coordinate.z - this.len.z / 2),
				new THREE.Matrix4().makeRotationX(-angle),
				new THREE.Matrix4().makeTranslation(0,this.len.y / 2,this.len.z / 2),
				initMatrix)
				
				break;
			case 1:
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x,0,this.coordinate.z + this.len.z / 2),
				new THREE.Matrix4().makeRotationX(angle),
				new THREE.Matrix4().makeTranslation(0,this.len.y /2 ,-this.len.z / 2),
				initMatrix)
				break;
			case 2:
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x + this.len.x / 2,0,this.coordinate.z),
				new THREE.Matrix4().makeRotationZ(-angle),
				new THREE.Matrix4().makeTranslation(-this.len.x / 2,this.len.y /2 ,0),
				initMatrix)
				break;
			case 3:
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x - this.len.x / 2,0,this.coordinate.z),
				new THREE.Matrix4().makeRotationZ(angle),
				new THREE.Matrix4().makeTranslation(this.len.x / 2,this.len.y /2 ,0),
				initMatrix)
				break;
		}
	}

	matmul(...mats){
		return mats.reduce((prev, curr) => prev.multiply(curr))
	}
}



window.onload = function () {

	new App();
};