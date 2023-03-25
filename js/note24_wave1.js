import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {RectAreaLightUniformsLib} from '../node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { RectAreaLightHelper } from '../node_modules/three/examples/jsm/helpers/RectAreaLightHelper.js';
import * as THREE from '../node_modules/three/build/three.module.js';




class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.autoClear = false;
        renderer.setClearColor(0x000000);
		renderer.shadowMap.enabled = true;
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio( window.devicePixelRatio );
		const scene = new THREE.Scene();
		this._scene = scene;
		this.delta = 0.2
		this.time = 0;
		this.step = 0.01;
        this.targetIndex = 1
		this.coefficient = 6;
		
		this.b1 = 1

        this._setupBackground();
		this._setupCamera();
		this._setupLight();
		this._setupModel();
        this._setupControls();
		

		window.onresize = this.resize.bind(this);
		this.resize();
        requestAnimationFrame(this.render.bind(this));

		
	}
	debugPoint(pos){
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute([pos.x, pos.y, pos.z], 3)
		);

		const material = new THREE.PointsMaterial({
			color:0xff38a2,
			size: 5,
			sizeAttenuation : false
		})
		const points = new THREE.Points(geometry, material);
		this._scene.add(points)
	}

    _setupBackground(){
        this._scene.background = new THREE.Color(0xdddddd);
    }

	pointIndex(){
		const raycaster = new THREE.Raycaster();
            
		const pt = {
			x: (this.event.clientX / this._divContainer.clientWidth) * 2 - 1,
			y: - (this.event.clientY / this._divContainer.clientHeight) * 2 + 1
		}
		raycaster.setFromCamera(pt, this._camera)
		const interObj = raycaster.intersectObject(this._plane)
		
		if(interObj.length === 0){
			return false;
		}

		const point = interObj[0].point;
		let index = - Math.round(point.y) + this.stickNum;
		if (index < 0){
			index = 0;
		}
		else if(index >= this.stickArr.length){
			index = this.stickArr.length - 1;
		}
		return [index, point.x > 0];
	}
	_setupControls(){ 
        
		

		const onPointerDown = ( event ) => {
			
			this.isStart = true;
			this.isDown = true;
			this.event = event;
			document.addEventListener( 'pointerup', onPointerUp );
			if(this.isRot) return;
			




		}

		const onPointerUp = (event) => {
			
			this.isDown = false;
			// if(this.isRot) return;
			
			document.removeEventListener( 'pointerup', onPointerUp );

		}

		this._divContainer.style.touchAction = 'none';
		this._divContainer.addEventListener( 'pointerdown', onPointerDown );



	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0,0,20);
		this._camera = camera;
        this._scene.add(this._camera)
		this._camera.lookAt(0,0,0)
	}

	_setupLight() {
		// RectAreaLightUniformsLib.init();
		const color = 0xffffff;
		const intensity = 1.5;



		const light1 = new THREE.PointLight( 0xffffff, 1, 100 )
		light1.position.set(0, 15, 0);
		light1.lookAt(0,0,0)
		// const helper1 = new RectAreaLightHelper(light1);
		// light1.add(helper1);
		this._scene.add(light1);
		


		
		const light2 = new THREE.PointLight( 0xffffff, 1, 100 )
		light2.position.set(0, -15, 0);
		light2.lookAt(0,0,0)
		// const helper2 = new RectAreaLightHelper(light2);
		// light2.add(helper2);
		this._scene.add(light2);



		// const light3 = new THREE.RectAreaLight(color, intensity, 5, 5);
		// light3.position.set(10, 0, 0);
		// light3.lookAt(0,0,0)
		// const helper3 = new RectAreaLightHelper(light3);
		// light3.add(helper3);
		// this._scene.add(light3);

		// const light4 = new THREE.RectAreaLight(color, intensity, 5, 5);
		// light4.position.set(-10,0, 0);
		// light4.lookAt(0,0,0)
		// const helper4 = new RectAreaLightHelper(light4);
		// light4.add(helper4);
		// this._scene.add(light4);


		const light5 = new THREE.PointLight( 0xffffff, 1, 100 )
		light5.position.set(0, 0, 10);
		light5.lookAt(0,0,0)
		// const helper5 = new RectAreaLightHelper(light5);
		// light5.add(helper5);
		this._scene.add(light5);

		const light6 = new THREE.PointLight( 0xffffff, 1, 100 )
		light6.position.set(0,0, -10);
		light6.lookAt(0,0,0)
		// const helper6 = new RectAreaLightHelper(light6);
		// light6.add(helper6);
		this._scene.add(light6);



		

		// const light2 = new THREE.DirectionalLight(color, intensity);
		// light2.position.set(-6,6,-10);
		// this._scene.add(light2)
	}

	_setupModel() {


        const planeGeom = new THREE.PlaneGeometry(100, 100)
        const planeMate = new THREE.MeshBasicMaterial({visible: false});
        const plane = new THREE.Mesh(planeGeom, planeMate);
        this._plane = plane;
        this._scene.add(plane)
        
        


        this.stickNum = 9
        this.stickArr = []
		const roughness = 0.1
		const metalness = 0.5
        for(let i = 0; i<this.stickNum; i++){

			const stickGeom =  new THREE.CylinderGeometry( 0.5, 0.5, 8 * Math.cos((i - this.stickNum)/this.stickNum * 1.2), 32 );
            const stickMate = new THREE.MeshPhysicalMaterial({roughness : roughness, metalness : metalness});
            const stick = new THREE.Mesh(stickGeom, stickMate);
            stick.rotation.z = Math.PI / 2


            stick.position.set(0,this.stickNum - i,0)
            this._scene.add(stick)
            this.stickArr.push(stick)
        }
        const stickGeom =  new THREE.CylinderGeometry( 0.5, 0.5, 8, 32 );
        const stickMate = new THREE.MeshPhysicalMaterial({roughness : roughness, metalness : metalness});
        const stick = new THREE.Mesh(stickGeom, stickMate);
        stick.rotation.z = Math.PI / 2
        stick.position.set(0, 0, 0)
        this._scene.add(stick)
        this.stickArr.push(stick)
        for(let i = 0; i<this.stickNum; i++){
            const stickGeom =  new THREE.CylinderGeometry( 0.5, 0.5, 8 * Math.cos((i +1)/this.stickNum * 1.2), 32 );
            const stickMate = new THREE.MeshPhysicalMaterial({roughness : roughness, metalness : metalness});
            const stick = new THREE.Mesh(stickGeom, stickMate);
            stick.rotation.z = Math.PI / 2
            stick.position.set(0, - i - 1,0)
            this._scene.add(stick)
            this.stickArr.push(stick)
        }
        
		this.stickArr.forEach((e,i,arr)=>{
			const color = new THREE.Color(`hsl(${360 / arr.length * i}, 100%, 80%)`)
			e.material.color = color
			console.log()
		})


		const sphereGeom = new THREE.SphereGeometry(1,32,64	);
		const sphereMate = new THREE.MeshPhysicalMaterial({color: 0xffffff, emissive : 0xffffff});

		const sphere1 = new THREE.Mesh(sphereGeom, sphereMate);
		sphere1.position.set(0,this.stickNum + 2);
		this._scene.add(sphere1);
		const sphere2 = new THREE.Mesh(sphereGeom, sphereMate);
		sphere2.position.set(0,- this.stickNum - 2);
		this._scene.add(sphere2);


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

		if(!this.isStart) return;
		if(!this.isRot && this.isDown){
			this.isRot = true;

			const temp = this.pointIndex(this.event);
            const index = temp[0];
			const isCounterClock = temp[1];
			this.isCounterClock = isCounterClock;
			this.startRotation = this.stickArr[index].rotation.y;
			
			
			this.time = 0;
            this.targetIndex = index;
			
			this.b2 = undefined
			this.once = true;

		}
		if(!this.isDown && this.once){
			this.b2 = this.time;
			this.once = false;
		}
		if(this.isRot){
			this.rotStart = false;
			this.time += this.step;
			this.rotAnimation(this.targetIndex, this.time)
			for(let i = this.targetIndex - 1; i >= 0; i--){
				this.rotAnimation(i, this.time - 0.03 * (-i + this.targetIndex))
			}
			for(let i = this.targetIndex + 1; i < this.stickArr.length; i++){
				this.rotAnimation(i, this.time - 0.03 * (i - this.targetIndex))
			}
		}

		
		

	}

	rotAnimation(index, time){
		let isLast = false;
		if(index === this.stickArr.length - 1 && this.targetIndex < this.stickNum){
			isLast = true;
		}
		else if(index === 0 && this.targetIndex >= this.stickNum){
			isLast = true;
		}
		if(this.isDown){

			this.stickArr[index].rotation.y = this.startRotation + (this.isCounterClock ? this.Rot(time, isLast) : -this.Rot(time, isLast));
		
		}
		else{
			this.stickArr[index].rotation.y = this.startRotation + (this.isCounterClock ? this.Rot(time, isLast) : -this.Rot(time, isLast));		
		}
	}

	Rot(t, isLast){

		if(t < 0 ) return 0;
		if(!this.isStart) return;
		if(this.b2 === undefined || this.b1 < this.b2){
			if(t < this.b1) {;return this.coefficient * t ** 2;}
			if(this.b2 === undefined || t < this.b2) {return this.coefficient * this.b1 *(2 * t - this.b1);}
			if(t < this.b1 + this.b2) { return this.coefficient * (- ((t - this.b1 - this.b2) ** 2) + 2 * this.b1 * this.b2);}
			if(isLast) this.isRot = false;
			return 2 * this.coefficient * this.b1 * this.b2;
		}
		else{
			if(t < this.b2) return this.coefficient * t ** 2;
			if(t < 2 * this.b2) { return this.coefficient * (- ((t - 2 * this.b2) ** 2) + 2 * this.b2 ** 2)};
			if(isLast) this.isRot = false;
			return 2* this.coefficient * this.b2 ** 2
		}
		
	}
	
}

window.onload = function () {
	new App();
};