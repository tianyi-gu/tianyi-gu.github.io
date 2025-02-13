import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';
// import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from '/three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';

// Initialize scene, camera, and renderer but don't start rendering yet
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Don't append renderer to document yet
const controls = new OrbitControls(camera, renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

camera.position.set(8, 8, 5);
controls.update();

// Keyboard controls setup
const moveSpeed = 0.1;
const keyState = {
	ArrowUp: false,
	ArrowDown: false,
	ArrowLeft: false,
	ArrowRight: false
};

window.addEventListener('keydown', (event) => {
	if (keyState.hasOwnProperty(event.key)) {
		keyState[event.key] = true;
	}
});

window.addEventListener('keyup', (event) => {
	if (keyState.hasOwnProperty(event.key)) {
		keyState[event.key] = false;
	}
});

function handleKeyboardInput() {
	const forward = new THREE.Vector3();
	camera.getWorldDirection(forward);
	const right = new THREE.Vector3();
	right.crossVectors(forward, camera.up).normalize();

	if (keyState.ArrowUp) {
		camera.position.addScaledVector(forward, moveSpeed);
	}
	if (keyState.ArrowDown) {
		camera.position.addScaledVector(forward, -moveSpeed);
	}
	if (keyState.ArrowLeft) {
		camera.position.addScaledVector(right, -moveSpeed);
	}
	if (keyState.ArrowRight) {
		camera.position.addScaledVector(right, moveSpeed);
	}
}

function animate() {
	requestAnimationFrame(animate);
	handleKeyboardInput();
	controls.update();
	renderer.render(scene, camera);
}

// Start button click handler
document.getElementById('startButton').addEventListener('click', () => {
	// Remove start screen
	const startScreen = document.getElementById('startScreen');
	startScreen.style.display = 'none';
	
	// Append renderer to document
	document.body.appendChild(renderer.domElement);
	
	// Load the model
	const loader = new GLTFLoader();
	loader.load('./bakerstreet.glb', function (gltf) {
		scene.add(gltf.scene);
	}, undefined, function (error) {
		console.error(error);
	});
	
	// Start animation loop
	animate();
});
