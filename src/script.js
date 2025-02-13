import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';
// import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from '/three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Setup controls and lights
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Add smooth damping to camera movements
controls.target.set(0, 2, -5); // Set the pivot point to match where we're looking
controls.update();

// Initial camera position (far out)
camera.position.set(20, 20, 20);
camera.lookAt(0, 2, -5); // Match the lookAt with the pivot point

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
	if (event.key === 'p' || event.key === 'P') {
		// Log current camera position and look-at target
		console.log('Camera Position:', {
			position: {
				x: camera.position.x.toFixed(2),
				y: camera.position.y.toFixed(2),
				z: camera.position.z.toFixed(2)
			},
			lookingAt: {
				x: controls.target.x.toFixed(2),
				y: controls.target.y.toFixed(2),
				z: controls.target.z.toFixed(2)
			}
		});
	}
});

window.addEventListener('keyup', (event) => {
	if (keyState.hasOwnProperty(event.key)) {
		keyState[event.key] = false;
	}
});

function handleKeyboardInput() {
	// Get forward and right vectors from camera
	const forward = new THREE.Vector3(0, 0, -1);
	forward.applyQuaternion(camera.quaternion);
	forward.y = 0; // Keep movement horizontal
	forward.normalize();

	const right = new THREE.Vector3(1, 0, 0);
	right.applyQuaternion(camera.quaternion);
	right.y = 0; // Keep movement horizontal
	right.normalize();

	// Move camera and target together to maintain orientation
	if (keyState.ArrowUp) {
		camera.position.addScaledVector(forward, moveSpeed);
		controls.target.addScaledVector(forward, moveSpeed);
	}
	if (keyState.ArrowDown) {
		camera.position.addScaledVector(forward, -moveSpeed);
		controls.target.addScaledVector(forward, -moveSpeed);
	}
	if (keyState.ArrowLeft) {
		camera.position.addScaledVector(right, -moveSpeed);
		controls.target.addScaledVector(right, -moveSpeed);
	}
	if (keyState.ArrowRight) {
		camera.position.addScaledVector(right, moveSpeed);
		controls.target.addScaledVector(right, moveSpeed);
	}

	controls.update();
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

function animate() {
	requestAnimationFrame(animate);
	if (animationInProgress) {
		animateCamera(Date.now());
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
	
	// Append renderer to document
	document.body.appendChild(renderer.domElement);
	
	// Load the model
	const loader = new GLTFLoader();
	loader.load('./bakerstreet.glb', 
		function (gltf) {
			scene.add(gltf.scene);
			console.log('Model loaded successfully');
			animationInProgress = true;
			animationStartTime = 0;
			animate();
		}, 
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			console.error('An error occurred loading the model:', error);
		}
	);
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

// Define clue positions and content
const clues = {
	1: {
		position: new THREE.Vector3(5, 2, 0),
		lookAt: new THREE.Vector3(0, 2, 0),
		title: "First Clue",
		text: "A mysterious letter lies on the desk..."
	},
	2: {
		position: new THREE.Vector3(-5, 2, 0),
		lookAt: new THREE.Vector3(0, 2, 0),
		title: "Second Clue",
		text: "Blood stains near the window..."
	},
	3: {
		position: new THREE.Vector3(0, 2, 5),
		lookAt: new THREE.Vector3(0, 2, 0),
		title: "Third Clue",
		text: "A broken picture frame..."
	},
	4: {
		position: new THREE.Vector3(0, 2, -5),
		lookAt: new THREE.Vector3(0, 2, 0),
		title: "Fourth Clue",
		text: "Muddy footprints leading to..."
	},
	5: {
		position: new THREE.Vector3(3, 4, 3),
		lookAt: new THREE.Vector3(0, 2, 0),
		title: "Final Clue",
		text: "The murder weapon..."
	}
};

// Add clue button click handlers
document.querySelectorAll('.clue-button').forEach(button => {
	button.addEventListener('click', () => {
		const clueNumber = button.getAttribute('data-clue');
		const clue = clues[clueNumber];
		
		// Animate camera to clue position
		const duration = 1000;
		const startPosition = camera.position.clone();
		const startRotation = camera.quaternion.clone();
		
		const tempCamera = camera.clone();
		tempCamera.position.copy(clue.position);
		tempCamera.lookAt(clue.lookAt);
		const targetRotation = tempCamera.quaternion;
		
		const startTime = Date.now();
		
		function animateToClue() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Smooth interpolation
			const t = progress * (2 - progress); // Ease out quad
			
			camera.position.lerpVectors(startPosition, clue.position, t);
			camera.quaternion.slerpQuaternions(startRotation, targetRotation, t);
			
			controls.target.copy(clue.lookAt);
			controls.update();
			
			if (progress < 1) {
				requestAnimationFrame(animateToClue);
			} else {
				// Show clue popup
				const cluePopup = document.getElementById('cluePopup');
				document.getElementById('clueTitle').textContent = clue.title;
				document.getElementById('clueText').textContent = clue.text;
				cluePopup.style.display = 'block';
			}
		}
		
		animateToClue();
	});
});

// Close clue popup handler
document.getElementById('closeClueButton').addEventListener('click', () => {
	document.getElementById('cluePopup').style.display = 'none';
});

// Add window resize handler
window.addEventListener('resize', () => {
	// Update camera
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	// Update renderer
	renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
