
import * as THREE from '../../node_modules/three/build/three.module.js';

import {OrbitControls} from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from '../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from '../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from '../../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { Filter } from './pass.js';
import {Shader, RingShader} from './shader.js'
import { FXAAShader } from '../../node_modules/three/examples/jsm/shaders/FXAAShader.js';

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

		this.angle = 0;

		this.prevTime = performance.now()
		this.time = 0;
		this.torsion = 0;
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();
		this._setupBackground();
		// this._setupComposer();

		window.onresize = this.resize.bind(this);
		this.resize();
		
		this.prevTime = performance.now();
		requestAnimationFrame(this.render.bind(this));
	}

	_setupComposer(){
        this._composer = new EffectComposer( this._renderer );
        
        this._composer.setSize(window.innerWidth, window.innerHeight);
		this._composer.setPixelRatio( window.devicePixelRatio )
        const renderPass = new RenderPass(this._scene, this._camera);
		this._composer.addPass(renderPass);
		const fxaaPass = new ShaderPass(FXAAShader);
        
        fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
		// this._composer.addPass(fxaaPass);

		const filterPass = new ShaderPass( Filter );
		filterPass.uniforms.renderTex.value = this._composer.renderTarget1.texture;
		this._composer.addPass( filterPass);


		
        

		
    }
    _setupBackground(){
        this._scene.background = new THREE.Color(0x111111);

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

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerX - this.pointerXOnPointerDown ) * 0.03;
			

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
		const width = 400;
		
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
		
		camera.position.set(0,30,100)
		camera.zoom = 1.0
		// camera.zoom = 0.1
		camera.lookAt(0,0,0)
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 0.5;

		const defaultLight = new THREE.AmbientLight(0xffffff, 0.5);
		this._scene.add(defaultLight)

		const light = new THREE.DirectionalLight(color, 0.7);
		
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 1000;
		light.shadow.camera.bottom = light.shadow.camera.left = -1000;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 2048 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 1;
		light.position.set(0, 20, 0);
		
		
		this._scene.add(light);
		
	}
	debugPoint(x,y,z){
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute([x,y,z], 3)
		);

		const material = new THREE.PointsMaterial({
			color:0xff38a2,
			size: 5,
			sizeAttenuation : false
		})
		const points = new THREE.Points(geometry, material);
		this._scene.add(points)
	}
	_setupModel() {
        const geom = new THREE.IcosahedronGeometry(10,20);
        const mate = new THREE.ShaderMaterial(Shader);
		Shader.uniforms.uvMap.value = new THREE.TextureLoader().load("../../data/uv_grid2.jpg")
		const mesh = new THREE.Mesh(geom, mate)
		

		const ringGeom = new THREE.RingGeometry(12, 23,100);
		const ringMate = new THREE.ShaderMaterial(RingShader);
		const ring = new THREE.Mesh(ringGeom, ringMate);
		ring.rotation.set(-Math.PI/2, 0,0)

		const planet = new THREE.Object3D();
		planet.add(mesh, ring);
		this.sphere = mesh;
		this._scene.add(planet)
		
		this.planet = planet;
		this.planet.rotation.order = 'ZYX'
		this.planet.rotation.z = 0.2;



		
	}



	randRange(a,b){
		return Math.random() * (b - a) + a;
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
		// this._composer.render()
		this.update();
		this.timeUpdate();
		this.colorUpdate();
		requestAnimationFrame(this.render.bind(this));
	}

	colorUpdate(){
			
	}
	timeUpdate(){
		const currentTime = performance.now();
		const deltaTime = (currentTime - this.prevTime) / 1000;
		this.prevTime = currentTime;
		this.time += deltaTime;
		Shader.uniforms.iTime.value = this.time;
		RingShader.uniforms.iTime.value = this.time;
		Shader.uniforms.torsion.value = this.torsion;
		RingShader.uniforms.torsion.value = this.torsion;
		
	}
	update() {
		this.angle += ( this.targetRotation - this.angle ) * 0.02;
		this.sphere.rotation.y =this.angle;
		this.torsion = Math.abs(this.targetRotation - this.angle) * 0.5;
		// console.log(this.torsion)
	}
	
}

window.onload = function () {
	new App();
};