
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js"

// https://sketchfab.com

const matmul = function(...mats){
	return mats.reduce((prev, curr) => prev.multiply(curr))
}
class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.autoClear = false;
        renderer.setClearColor(0x000000, 0.0);
		renderer.shadowMap.enabled = true;
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		const scene = new THREE.Scene();
		this._scene = scene;
		this.delta = 0.2
		this.step = 0.1;
		this.time = 0;
		this.shearAmp = 0.3;
		this.scaleAmp = 0.2;
		this.frequency1 = 1;
		this.frequency2 = 1;
		this.dogLen = 3;
		this.dogArr = []
        this._setupBackground();
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		

		window.onresize = this.resize.bind(this);
		this.resize();

		
	}



	_push(){
		this.isPush = true;
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0xeeeeee);
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
		this.rotationY = 0;
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
		camera.position.set(0,2,5);
		camera.zoom = 0.3
		this._camera = camera;
        this._scene.add(this._camera)
		this._camera.lookAt(0,1,0)
	}

	_setupLight() {
		const defaultLight = new THREE.AmbientLight(0xffffff, 0.3);
		
		this._scene.add(defaultLight)



		const color = 0xFFDD83;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 30;
		light.shadow.camera.bottom = light.shadow.camera.left = -30;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 2048 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 4;
		light.position.set(0, 2, 0);
		this._camera.add(light);

		// const light2 = new THREE.DirectionalLight(color, intensity);
		// light2.position.set(-6,6,-10);
		// this._scene.add(light2)
	}

	_setupModel() {

		const gltfLoader = new GLTFLoader()
        const url = '../data/eggdog2/scene.gltf';
		
        gltfLoader.load(
            url,
            (gltf)=>{
                const root = gltf.scene.children[0];
			
				this.group = root;
				this.dogArr.push(this.group)
				this._scene.add(this.group)
				root.traverse( function( node ) {

					if ( node.isMesh ) { node.castShadow = true;  }
			
				} );
				this.initMat = this.group.matrix.clone()

				this._setupControls()

				// ground
				const groundGeometry = new THREE.PlaneGeometry(60,60);
				const material = new THREE.ShadowMaterial();
				material.opacity = 0.3;
				const mesh = new THREE.Mesh( groundGeometry, material );
				mesh.receiveShadow = true;
				mesh.rotation.x = THREE.MathUtils.degToRad(-90);
				this._scene.add( mesh );





				//cloning
				for(let i = 0; i<this.dogLen - 1; i++){
					const clone = this.group.clone()
					this._scene.add(clone)
					this.dogArr.push(clone)
				}
				this.dogArr.forEach(e => e.matrixAutoUpdate = false)
				


				console.log(this._scene)
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

	render() {


		this.update();
		this._renderer.clear();
		this._renderer.render(this._scene, this._camera);		
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
		this.time += this.step;
		
		for(let i = 0; i<this.dogArr.length; i++){
			
			
			this.dogArr[i].matrix = matmul(
				new THREE.Matrix4().makeTranslation(-3 + i * 3,0,0),
				new THREE.Matrix4().makeRotationY(this.rotationY),
				new THREE.Matrix4().makeShear(0,0,this.shearAmp * Math.sin(this.time * this.frequency1),0,0,0), 
				new THREE.Matrix4().makeScale(1,this.scaleAmp * (Math.cos(this.time * this.frequency2) + 1) / 2 + 0.8, 1),
				this.initMat)
		}


		
		
		
		this.rotationY += ( this.targetRotation - this.rotationY ) * 0.05;



	}
}

window.onload = function () {
	new App();
};