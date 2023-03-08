import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
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
		const scene = new THREE.Scene();
		this._scene = scene;
		this.delta = 0.2
		this.step = 0;
        this.targetIndex = 0

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
        // this._scene.background = new THREE.Color(0xeeeeee);
    }
	_setupControls(){ 
        // new OrbitControls(this._camera, this._divContainer);
        const pointIndex = (event)=>{
            
            const raycaster = new THREE.Raycaster();
            
            const pt = {
                x: (event.clientX / this._divContainer.clientWidth) * 2 - 1,
                y: - (event.clientY / this._divContainer.clientHeight) * 2 + 1
            }
            raycaster.setFromCamera(pt, this._camera)
            const interObj = raycaster.intersectObject(this._plane)
            
            if(interObj.length === 0){
                return false;
            }

            const point = interObj[0].point;
            return - Math.round(point.y) + 7;
        }



		const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;
            const index = pointIndex(event);
            this.targetIndex = index;
			this.startX = event.clientX
			this.startY = event.clientY
			this.stickInfo[this.targetIndex].pointerXOnPointerDown = event.clientX - window.innerWidth / 2;
			this.stickInfo[this.targetIndex].targetRotationOnPointerDown = this.stickInfo[this.targetIndex].targetRotation;

			document.addEventListener( 'pointermove', onPointerMove );
			document.addEventListener( 'pointerup', onPointerUp );

		}

		const onPointerMove = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.stickInfo[this.targetIndex].pointerX = event.clientX - window.innerWidth / 2;

			this.stickInfo[this.targetIndex].targetRotation = this.stickInfo[this.targetIndex].targetRotationOnPointerDown + ( this.stickInfo[this.targetIndex].pointerX - this.stickInfo[this.targetIndex].pointerXOnPointerDown ) * 0.02;
			

		}

		const onPointerUp = (event) => {
			
			if ( event.isPrimary === false ) return;
			
			
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'pointerup', onPointerUp );

		}

        this.stickInfo = [];
        for(let i = 0;i < this.stickNum * 2 + 1;i++){
            this.stickInfo.push({
                targetRotation : 0,
                targetRotationOnPointerDown : 0,
                pointerX : 0,
                pointerXOnPointerDown : 0         
            })
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
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 30;
		light.shadow.camera.bottom = light.shadow.camera.left = -30;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 2048 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 4;
		light.position.set(6, 6, 10);
		this._scene.add(light);

		const light2 = new THREE.DirectionalLight(color, intensity);
		light2.position.set(-6,6,-10);
		this._scene.add(light2)
	}

	_setupModel() {
        const planeGeom = new THREE.PlaneGeometry(100, 100)
        const planeMate = new THREE.MeshBasicMaterial({visible: false});
        const plane = new THREE.Mesh(planeGeom, planeMate);
        this._plane = plane;
        this._scene.add(plane)
        
        
        this.stickNum = 7
        this.stickArr = []

        for(let i = 0; i<this.stickNum; i++){
            const stickGeom =  new THREE.CylinderGeometry( 0.4, 0.4, 3 + i/2, 32 );
            const stickMate = new THREE.MeshPhongMaterial({color : 0xffff00});
            const stick = new THREE.Mesh(stickGeom, stickMate);
            stick.rotation.z = Math.PI / 2
            stick.position.set(0,this.stickNum - i,0)
            this._scene.add(stick)
            this.stickArr.push(stick)
        }
        const stickGeom =  new THREE.CylinderGeometry( 0.4, 0.4, 3 + this.stickNum/2, 32 );
        const stickMate = new THREE.MeshPhongMaterial({color : 0xffff00});
        const stick = new THREE.Mesh(stickGeom, stickMate);
        stick.rotation.z = Math.PI / 2
        stick.position.set(0, 0, 0)
        this._scene.add(stick)
        this.stickArr.push(stick)
        for(let i = 0; i<this.stickNum; i++){
            const stickGeom =  new THREE.CylinderGeometry( 0.4, 0.4, 3 + (this.stickNum - i - 1)/2, 32 );
            const stickMate = new THREE.MeshPhongMaterial({color : 0xffff00});
            const stick = new THREE.Mesh(stickGeom, stickMate);
            stick.rotation.z = Math.PI / 2
            stick.position.set(0, - i - 1,0)
            this._scene.add(stick)
            this.stickArr.push(stick)
        }
        


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
		// if(this.isPush){
		// 	this.delta1 = Math.random() * 2 * Math.PI
		// 	this.delta2 = Math.random() * 2 * Math.PI
		// 	this.isPush = false;
		// 	this.isLinear = true;
		// 	this.isRotate = false
		// 	this.linearStep = 10;
		// 	this.amp = 0.7
		// 	this.tempX = this._patrick.rotation.x;
		// 	this.tempY = this._patrick.rotation.y;
		// 	this.step = 0;
			
		// }
		// if(this.isLinear){
		// 	this.step ++;
		// 	this._patrick.rotation.x += this.amp * (Math.cos(this.delta1) - this.tempX) / this.linearStep
		// 	this._patrick.rotation.y += this.amp * (Math.sin(-this.delta2) - this.tempY) / this.linearStep
			
			
		// 	if(this.step >= this.linearStep){
		// 		this.step =0;
		// 		this.isLinear = false;
		// 		this.isRotate=true;
		// 	}
			
		// }
		// if(this.isRotate){
			
		// 	this._patrick.rotation.x = this.amp * Math.cos((this.step - this.delta1) * (1 + this.step / 10)) / Math.exp(this.step/5)
		// 	this._patrick.rotation.y = this.amp * Math.sin((this.step - this.delta2)* (1 + this.step / 10)) / Math.exp(this.step/5)
		// 	this.step += 0.1;
		// }
        

        for(let i = 0 ; i<this.stickInfo.length; i++){
            this.stickArr[i].rotation.y += ( this.stickInfo[i].targetRotation - this.stickArr[i].rotation.y ) * 0.05;
        }



	}
}

window.onload = function () {
	new App();
};