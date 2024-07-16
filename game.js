// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2;
ground.position.y = 0; // Set ground position
scene.add(ground);

// Player cube (blue)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5; // Position above ground
scene.add(player);

// Apple (red cube)
const appleGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const redAppleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const goldenAppleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
let redApple, goldenApple;

// Score system
let score = 0;
let goldenScore = 0;
const targetScore = 50;
const goldenTargetScore = 30;
let regularApplesCollected = 0; // Track regular apples collected
let gameCompleted = false; // Track game completion

// Create score display
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '10px';
scoreDisplay.style.right = '10px';
scoreDisplay.style.color = 'white';
scoreDisplay.style.fontSize = '24px';
document.body.appendChild(scoreDisplay);

// Create level complete display
const levelCompleteDisplay = document.createElement('div');
levelCompleteDisplay.style.position = 'absolute';
levelCompleteDisplay.style.top = '50%';
levelCompleteDisplay.style.left = '50%';
levelCompleteDisplay.style.transform = 'translate(-50%, -50%)';
levelCompleteDisplay.style.color = 'white';
levelCompleteDisplay.style.fontSize = '48px';
levelCompleteDisplay.style.display = 'none';
levelCompleteDisplay.innerText = 'Level Complete!';
document.body.appendChild(levelCompleteDisplay);

function updateScoreDisplay() {
    scoreDisplay.innerHTML = `Red Apples: <span style="color:red">${score}</span>/${targetScore} <br> Golden Apples: <span style="color:gold">${goldenScore}</span>/${goldenTargetScore}`;
}

// Initial score display
updateScoreDisplay();

function createApples() {
    if (redApple) scene.remove(redApple);
    if (goldenApple) scene.remove(goldenApple);
    
    redApple = new THREE.Mesh(appleGeometry, redAppleMaterial);
    redApple.position.set(
        Math.random() * 20 - 10,
        0.25, // Position above ground
        Math.random() * 20 - 10
    );
    scene.add(redApple);

    // Determine if a golden apple should spawn
    let spawnGolden = Math.random() < 0.3 || regularApplesCollected >= 15;
    if (spawnGolden) {
        regularApplesCollected = 0; // Reset counter
        goldenApple = new THREE.Mesh(appleGeometry, goldenAppleMaterial);
        goldenApple.position.set(
            Math.random() * 20 - 10,
            0.25, // Position above ground
            Math.random() * 20 - 10
        );
        scene.add(goldenApple);
    } else {
        goldenApple = null;
    }
}

// Generate initial apples
createApples();

camera.position.set(0, 5, 5);
camera.lookAt(player.position);

let keys = {};
let cameraRotation = 0;

function keyDown(event) {
    keys[event.key] = true;
}

function keyUp(event) {
    keys[event.key] = false;
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function updatePlayer() {
    const speed = 0.1;
    let direction = new THREE.Vector3();

    if (keys['ArrowUp']) direction.z -= speed;
    if (keys['ArrowDown']) direction.z += speed;
    if (keys['ArrowLeft']) direction.x -= speed;
    if (keys['ArrowRight']) direction.x += speed;

    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation);
    player.position.add(direction);

    // Keep player within bounds
    player.position.x = Math.max(-10, Math.min(10, player.position.x));
    player.position.z = Math.max(-10, Math.min(10, player.position.z));
    player.position.y = 0.5; // Keep player above ground
}

function updateCamera() {
    camera.position.x = player.position.x + 5 * Math.sin(cameraRotation);
    camera.position.z = player.position.z + 5 * Math.cos(cameraRotation);
    camera.position.y = player.position.y + 5; // Adjust the height
    camera.lookAt(player.position);
}

function updateCameraRotation() {
    if (keys['q']) cameraRotation -= 0.05;
    if (keys['e']) cameraRotation += 0.05;
}

function checkCollisions() {
    if (redApple && player.position.distanceTo(redApple.position) < 1) {
        score++; // Increment score
        regularApplesCollected++; // Increment regular apple counter
        updateScoreDisplay(); // Update score display
        createApples(); // Respawn apples
    }

    if (goldenApple && player.position.distanceTo(goldenApple.position) < 1) {
        goldenScore++; // Increment golden apple score
        regularApplesCollected = 0; // Reset regular apple counter
        updateScoreDisplay(); // Update score display
        createApples(); // Respawn apples
    }

    // Check if the player has collected enough golden apples
    if (goldenScore >= goldenTargetScore) {
        levelCompleteDisplay.style.display = 'block';
        gameCompleted = true;
    }
}

function animate() {
    if (gameCompleted) return; // Stop the game loop if the game is completed
    requestAnimationFrame(animate);
    updateCameraRotation();
    updatePlayer();
    checkCollisions();
    updateCamera();
    renderer.render(scene, camera);
}

animate();
