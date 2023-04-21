
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

class App {
    constructor() {
        const divContainer = document.querySelector("#webgl_container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this._renderer = renderer;
		
		
		renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 0.0);

        divContainer.appendChild(renderer.domElement);
		const scene = new THREE.Scene();
		this._scene = scene;
        
        this.time = 0;
		this.prevTime = performance.now();
        


        this._setupCamera();
        this._setupLight();
        
		this._setupModel();
        // this._setupBackground();
        this._setupControls();

        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));
    }

	
	_setupBackground(){
		this._scene.background = new THREE.Color("#ffffff")
	}
    _setupControls() {
        window.addEventListener("touchstart", ()=>{
            this.isTouch = true;
        })
        window.addEventListener("touchend", ()=>{
            this.isTouch = false;
        })
    }

    _setupModel() {
        const partWidth = 25;
        const partHeight = 200;
        const geometry = new THREE.CylinderGeometry(partWidth * 0.75, partWidth, 
            partHeight + 20, 32);
            

        const material = new THREE.MeshBasicMaterial({color: 'black'});        

        const mesh = new THREE.Mesh(geometry, material);
        mesh.matrix.makeTranslation(0, -partHeight/2, 0);
        mesh.matrixAutoUpdate = false;
        this._scene.add(mesh);

        function tree(scene, level, matrix) {
            if(level === 0) return;
            const tempMatrix = new THREE.Matrix4();
        
            // 가지1 생성 시작
            const material1 = new THREE.MeshBasicMaterial({ color: 'black' });
            const mesh1 = new THREE.Mesh(geometry, material1);
        
            const newMatrix1 = new THREE.Matrix4();
            newMatrix1
                .multiply(tempMatrix.makeRotationY(Math.PI / 2))
                .multiply(tempMatrix.makeTranslation(partWidth / 2, 0, 0))
                .multiply(tempMatrix.makeRotationZ(-Math.PI / 4))
                .multiply(tempMatrix.makeScale(0.75, 0.75, 0.75))
                .multiply(tempMatrix.makeTranslation(0, partHeight, 0));
        
            mesh1.matrix.copy(newMatrix1.multiply(matrix));
            mesh1.matrixAutoUpdate = false;
            scene.add(mesh1);
        
            tree(scene, level - 1, newMatrix1);
        
            // 가지2 생성 시작
            const material2 = new THREE.MeshBasicMaterial({ color: 'black' });
            const mesh2 = new THREE.Mesh(geometry, material2);
        
            const newMatrix2 = new THREE.Matrix4();
            newMatrix2
                .multiply(tempMatrix.makeRotationY(Math.PI / 2))
                .multiply(tempMatrix.makeTranslation(-partWidth / 2, 0, 0))
                .multiply(tempMatrix.makeRotationZ(Math.PI / 4))
                .multiply(tempMatrix.makeScale(0.75,0.75,0.75))
                .multiply(tempMatrix.makeTranslation(0, partHeight, 0));
            
            mesh2.matrix.copy(newMatrix2.multiply(matrix));
            mesh2.matrixAutoUpdate = false;
            scene.add(mesh2);
            
            tree(scene, level - 1, newMatrix2);
        }

        const levels = 12;
        tree(this._scene, levels, mesh.matrix);


        const geom = new THREE.SphereGeometry(50,16,32);
            

        const mate = new THREE.MeshBasicMaterial({color: 'white'});        

        const lamp = new THREE.Mesh(geom, mate);

        // this._scene.add(lamp)
        // lamp.position.set(0,700,0)
        
    }

    _setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1500
        );

        camera.position.set(600*Math.sin(0), 600, 600*Math.cos(0))
        camera.lookAt(0,600,0)
        this._camera = camera;
    }

    _setupLight() {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this._scene.add(light);        

        this._scene.add(new THREE.AmbientLight(color, 0.3));
    }

    update() {
        const currentTime = performance.now();
		const deltaTime = (currentTime - this.prevTime) / 1000;
		this.prevTime = currentTime;
        if(this.isTouch){
            this.time += deltaTime 
        }
        else{
            this.time += deltaTime * 2
        }
        
        this._camera.position.set(600*Math.sin(this.time * 0.05), 600, 600*Math.cos(this.time * 0.05))
        this._camera.lookAt(0,600,0)
    }

    render() {
        this._renderer.render(this._scene, this._camera);   
        this.update();

        requestAnimationFrame(this.render.bind(this));
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize(width, height);
    }
}


window.onload = function () {
	new App();
};