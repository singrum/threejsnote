import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

function randRange(a, b){
	return Math.random() * (b-a) + a
}
function mod(n, m) {
    var remain = n % m;
    return remain >= 0 ? remain : remain + m;
};
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
        this.angle = 0;
        
        
		this._setupCamera();
        this._setupBackground();
		this._setupLight();
		this._setupModel();
		this._setupCloud();
		this._setupControls()

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

    _setupBackground(){
        this._scene.background = new THREE.Color("#dddddd")
    }

	_setupControls(){
		// new OrbitControls(this._camera, this._divContainer);
        const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.startX = event.clientX
			this.startY = event.clientY
			this.pointerYOnPointerDown = -event.clientY + window.innerWidth / 2;
			this.targetRotationOnPointerDown = this.targetRotation;

			document.addEventListener( 'pointermove', onPointerMove );
			document.addEventListener( 'pointerup', onPointerUp );

		}

		const onPointerMove = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.pointerY = -event.clientY + window.innerWidth / 2;

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerY - this.pointerYOnPointerDown ) * 0.02;
			


		}

		const onPointerUp = (event) => {
			
			if ( event.isPrimary === false ) return;
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'pointerup', onPointerUp );

		}
		this.targetRotation = 0;
		this.targetRotationOnPointerDown = 0;
		this.pointerY = 0;
		this.pointerYOnPointerDown = 0;
		this._divContainer.style.touchAction = 'none';
		this._divContainer.addEventListener( 'pointerdown', onPointerDown );
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.set(0,25,40)
        camera.lookAt(0,25,0)
        
		this._camera = camera;
	}

	_setupLight() {

		const defaultLight = new THREE.AmbientLight(0xffffff, 0.6);
		this._scene.add(defaultLight)

		const color = 0xffffff;
		const intensity = 1;
		const pLight1 = new THREE.PointLight(color, 1);
		pLight1.position.set(-10, 50, 20);
		const pLight2 = new THREE.DirectionalLight(color, 0.2);
		pLight2.position.set(0, -10,10);
		this.light1 = defaultLight;
		this.light2 = pLight1
		this._scene.add(pLight1,pLight2);
	}

	_setupModel() {
        const torusRad = 10, tubeRad = 1;
        [this.torusRad, this.tubeRad] = [torusRad, tubeRad];
        this.rainbowLen = 7
        this.rotRad = this.tubeRad / Math.sin(Math.PI / this.rainbowLen);
		const bowGeometry = new THREE.TorusGeometry( torusRad, tubeRad, 32, 100, Math.PI );
        const bowMaterialArr = []
        for(let i = 0; i<this.rainbowLen; i++){
            bowMaterialArr.push(new THREE.MeshPhysicalMaterial( { color: new THREE.Color(`hsl(${Math.floor(360 / this.rainbowLen * i)}, 100%, 75%)`)} ))
        }
        const bowArr = [];
        for(let i = 0; i< this.rainbowLen; i++){
            const bow = new THREE.Mesh(bowGeometry.clone(), bowMaterialArr[i]);
            bowArr.push(bow)
        }
        this._scene.add(...bowArr)
        
        this.bowArr = bowArr
        this.torus = bowArr[0]
        
        this.count = this.torus.geometry.attributes.position.count;
        this.positionClone = JSON.parse(JSON.stringify(this.torus.geometry.attributes.position.array))
        
	}

	_setupCloud(){
		
		class Cloud{
			constructor(radius,posX, posY, posZ){
				this.len = radius.length
				this.radius = radius;
				this.posX = posX
				this.posY = posY
				this.posZ = posZ
				this.mesh = this.makeCloud();
			}
			getPosX(){
				const result = [0];
				let distance = 0;
				for(let i = 0; i < this.len - 1; i++){
					
					distance += this.radius[i] + this.radius[i+1] - randRange(1,1.5)
					result.push(distance);
					
				}
				return result;
			}
			getPosY(){
				const result = [];
				for(let i = 0;i < this.len; i++){
					result.push(this.radius[i]);
				}
				
				
				return result;

			}
			makeCloud(){
				const cloud = new THREE.Object3D();
				for(let i = 0; i<this.len; i++){
					
					const sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius[i], 32,32), new THREE.MeshPhysicalMaterial({color : 0xffffff, emissive : 0x222222}));
					
					sphere.position.set(this.posX[i], this.posY[i], this.posZ[i]);
					cloud.add(sphere);
					
				}
				cloud.position.set(0,0,0)
				return cloud
			}
		}
		let cloudArr = [new Cloud([1.21,2.26,3,1.83,1.83, 1.21],[-4.7,-2.73, 0,2.79,2.90,4.78],[-0.48,-0.62, 0,1,-0.85,0], [0,0,0,0,0,0]).mesh,
		new Cloud([1.5,2,2.45,2,1.83, 1.6],[-4.7,-2.73, 0,-2,1,3.1],[-0.7,-0.3, 0,0.5,0.7,-0.7], [0,0,0,-1,-1.5,-0.5]).mesh,
		new Cloud([1.5,2,2,2,1.4, 1, 2, 1.8],[-7,-5,-2.5,0,2,3.5, -2,1],[0,0.4,-0.1,0.2,-0.1,0,1, 1.4], [-1,-0.5,0,0,0,0,-1,-1.2]).mesh,
		new Cloud([1.5, 2.4,1.6,2.2],[-2, 0, 1.6,2.4],[-0.7,0,-0.3,-1.1], [1,0,1.9,-1.0]).mesh,
		new Cloud([1.5,3,2.3,1],[-3, 0, 2.4,3.8],[-0.7,0,-0.9,1.8], [0,0,-0.3,0.6]).mesh,
		new Cloud([2,2.5,2.3,2.3,2.3,1.9],[-6,-3.1,0,3.4,-1,2],[0.1,1,1,1,2.3,1.5], [-1,0,0,0,-1,-1.2]).mesh,]
		// let cloudArr = [new Cloud([1.21,2.26,3,1.83,1.83, 1.21],[-4.7,-2.73, 0,2.79,2.90,4.78],[-0.48,-0.62, 0,1,-0.85,0], [0,0,0,0,0,0]).mesh,
		// new Cloud([1.5,2,2.45,2,1.83, 1.6],[-4.7,-2.73, 0,-2,1,3.1],[-0.7,-0.3, 0,0.5,0.7,-0.7], [0,0,0,0,0,0]).mesh,
		// new Cloud([1.5,2,2,2,1.4, 1, 2, 1.8],[-7,-5,-2.5,0,2,3.5, -2,1],[0,0.4,-0.1,0.2,-0.1,0,1, 1.4], [0,0,0,0,0,0,0,0]).mesh,
		// new Cloud([1.5, 2.4,1.6,2.2],[-2, 0, 1.6,2.4],[-0.7,0,-0.3,-1.1], [0,0,0,0]).mesh,
		// new Cloud([1.5,3,2.3,1],[-3, 0, 2.4,3.8],[-0.7,0,-0.9,1.8], [0,0,0,0]).mesh,
		// new Cloud([2,2.5,2.3,2.3,2.3,1.9],[-6,-3.1,0,3.4,-1,2],[0.1,1,1,1,2.3,1.5], [-1,0,0,0,0,0]).mesh,]
		
		// this._scene.add(...cloudArr)
		
		cloudArr = cloudArr.concat(cloudArr.map(cloud =>cloud.clone()));
		this.cloudArr = cloudArr;
		for(let cloud of cloudArr){
			cloud.position.set(randRange(-50,50),randRange(10,60),randRange(-30,-10));
			cloud.posXinit = cloud.position.x
			cloud.rand1 = randRange(0.2,1);
			this._scene.add(cloud)
		}
		

		// let radius100 = [], posX100 = [], posY100 = [], posZ100 =[];
		// for(let i = 0; i<100; i++){
		// 	radius100.push(randRange(1,3));
		// 	posX100.push(randRange(-11, 11));
		// 	posY100.push(randRange(-2,0));
		// 	posZ100.push(randRange(-11,11));
		// }
		// const floorCloud = new Cloud(radius100, posX100, posY100, posZ100)
		// this._scene.add(floorCloud.mesh)
		const floor = new THREE.Mesh(new THREE.PlaneGeometry(1000,50), new THREE.MeshPhysicalMaterial(0xffffff));
		floor.rotation.set(-Math.PI/2,0,0)
		floor.position.set(0,-5,0)
		this._scene.add(floor)
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
		
        this.angle += 0.01
		
        for(let j = 0; j<this.bowArr.length; j++){
            const time = this.angle + Math.PI * 2 / this.bowArr.length * j
            for(let i = 0; i< this.count; i++){
                const ix = i* 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;
                const x = this.positionClone[ix];
                const y = this.positionClone[iy];
                const z = this.positionClone[iz];
                const lenFromZaxis = Math.hypot(x, y);
                const temp1 = lenFromZaxis + this.rotRad * Math.sin(time)
                this.bowArr[j].geometry.attributes.position.setX(i, temp1 * x / lenFromZaxis);
                this.bowArr[j].geometry.attributes.position.setY(i, temp1 * y / lenFromZaxis);
                this.bowArr[j].geometry.attributes.position.setZ(i, (z + this.rotRad * Math.cos(time)));
    
                
            }
            this.bowArr[j].geometry.computeVertexNormals();
		    this.bowArr[j].geometry.attributes.position.needsUpdate = true;
        }

        this.angle += ( this.targetRotation - this.angle ) * 0.005;
		const color = new THREE.Color(`hsl(${Math.floor(- (this.angle / (2 * Math.PI) * 360) % 360 + 360)}, 100%, 95%)`);
		this._scene.background = color;
		this.light1.color = color;
		this.light2.color = color;
		this.cloudArr.forEach(cloud=>{
			cloud.position.x = mod(cloud.posXinit + (this.angle) * cloud.rand1 + 50, 100) -50;
			
			
		})

	}
}

window.onload = function () {
	new App();
};
