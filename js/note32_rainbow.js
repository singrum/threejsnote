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
        this.time = 0;
        
        
		this._setupCamera();
        this._setupBackground();
		this._setupLight();
		this._setupModel();
		this._setupControls()

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

    _setupBackground(){
        this._scene.background = new THREE.Color("#dddddd")
    }

	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.z = 20;
		this._camera = camera;
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		this._scene.add(light);
	}

	_setupModel() {
        const torusRad = 10, tubeRad = 1;
        [this.torusRad, this.tubeRad] = [torusRad, tubeRad];
        this.rainbowLen = 7
        this.rotRad = this.tubeRad / Math.sin(Math.PI / this.rainbowLen);
		const bowGeometry = new THREE.TorusGeometry( torusRad, tubeRad, 32, 100, Math.PI );
        const bowMaterialArr = []
        for(let i = 0; i<this.rainbowLen; i++){
            bowMaterialArr.push(new THREE.MeshPhysicalMaterial( { color: new THREE.Color(`hsl(${Math.floor(360 / this.rainbowLen * i)}, 100%, 50%)`)} ))
        }
        const bowArr = [];
        for(let i = 0; i< this.rainbowLen; i++){
            const bow = new THREE.Mesh(bowGeometry.clone(), bowMaterialArr[i]);
            bowArr.push(bow)
        }
        this._scene.add(...bowArr)
        
        this.bowArr = bowArr
        this.torus = bowArr[0]
        this._scene.add( this.torus );
        this.count = this.torus.geometry.attributes.position.count;
        this.positionClone = JSON.parse(JSON.stringify(this.torus.geometry.attributes.position.array))
        
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
		this.time += 0.1;
        
		
        for(let bow of this.bowArr){
            for(let i = 0; i< this.count; i++){
                const ix = i* 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;
                const x = this.positionClone[ix];
                const y = this.positionClone[iy];
                const z = this.positionClone[iz];
                const lenFromZaxis = Math.hypot(x, y);
                const temp1 = lenFromZaxis + this.rotRad * Math.sin(this.time)
                bow.geometry.attributes.position.setX(i, temp1 * x / lenFromZaxis);
                bow.geometry.attributes.position.setY(i, temp1 * y / lenFromZaxis);
                bow.geometry.attributes.position.setZ(i, (z + this.rotRad * Math.cos(this.time)));
    
                
            }
            bow.geometry.computeVertexNormals();
		    bow.geometry.attributes.position.needsUpdate = true;
        }


	}
}

window.onload = function () {
	new App();
};