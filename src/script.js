import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';
// import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from '/three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Setup controls and lights
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Add smooth damping to camera movements

// Initial camera position (far out)
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

// Target camera position (inside room)
const targetPosition = new THREE.Vector3(0, 2, 0);
const targetLookAt = new THREE.Vector3(0, 2, -5);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

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

let animationInProgress = false;
let animationStartTime = 0;
const ANIMATION_DURATION = 3000; // 3 seconds

function animateCamera(timestamp) {
	if (!animationStartTime) animationStartTime = timestamp;
	const progress = (timestamp - animationStartTime) / ANIMATION_DURATION;

	if (progress < 1) {
		// Interpolate camera position
		camera.position.lerp(targetPosition, 0.02);
		
		// Interpolate camera lookAt
		const currentLookAt = new THREE.Vector3();
		camera.getWorldDirection(currentLookAt);
		const targetDirection = targetLookAt.clone().sub(camera.position).normalize();
		const interpolatedDirection = currentLookAt.lerp(targetDirection, 0.02);
		camera.lookAt(camera.position.clone().add(interpolatedDirection));
		
		controls.target.copy(targetLookAt);
		controls.update();
		return true;
	} else {
		animationInProgress = false;
		return false;
	}
}

function animate(timestamp) {
	requestAnimationFrame(animate);
	if (animationInProgress) {
		animateCamera(timestamp);
	} else {
		handleKeyboardInput();
	}
	controls.update();
	renderer.render(scene, camera);
}

// Preload the model
const loader = new GLTFLoader();
let modelLoaded = false;

loader.load('./bakerstreet.glb', function (gltf) {
	scene.add(gltf.scene);
	modelLoaded = true;
	
	// Start camera animation after model is loaded
	animationInProgress = true;
	animationStartTime = 0;
	
	// Start animation loop
	animate();
}, undefined, function (error) {
	console.error(error);
});

// Start button click handler
document.getElementById('startButton').addEventListener('click', () => {
	// Hide start screen and show instructions
	const startScreen = document.getElementById('startScreen');
	const instructionsPopup = document.getElementById('instructionsPopup');
	startScreen.style.display = 'none';
	instructionsPopup.style.display = 'flex';
});

// Continue button click handler
document.getElementById('continueButton').addEventListener('click', () => {
	const instructionsPopup = document.getElementById('instructionsPopup');
	const helpButton = document.getElementById('helpButton');
	instructionsPopup.style.display = 'none';
	helpButton.style.display = 'block';
	
	document.body.appendChild(renderer.domElement);
	
	const loader = new GLTFLoader();
	loader.load('./bakerstreet.glb', function (gltf) {
		scene.add(gltf.scene);
		animationInProgress = true;
		animationStartTime = 0;
		animate();
	}, undefined, function (error) {
		console.error(error);
	});
});

// Help button click handler
document.getElementById('helpButton').addEventListener('click', () => {
	const instructionsPopup = document.getElementById('instructionsPopup');
	instructionsPopup.style.display = 'flex';
});

// Allow clicking outside popup to close it
document.getElementById('instructionsPopup').addEventListener('click', (event) => {
	if (event.target.id === 'instructionsPopup') {
		event.target.style.display = 'none';
	}
});
