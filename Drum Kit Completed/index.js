// var numberOfDrumButtons = document.querySelectorAll(".drum").length;

// for (var i = 0; i < numberOfDrumButtons; i++) {

//   document.querySelectorAll(".drum")[i].addEventListener("click", function() {

//     var buttonInnerHTML = this.innerHTML;

//     makeSound(buttonInnerHTML);

//     buttonAnimation(buttonInnerHTML);

//   });

// }

// document.addEventListener("keypress", function(event) {

//   makeSound(event.key);

//   buttonAnimation(event.key);

// });


// function makeSound(key) {

//   switch (key) {
//     case "w":
//       var tom1 = new Audio("sounds/tom-1.mp3");
//       tom1.play();
//       break;

//     case "a":
//       var tom2 = new Audio("sounds/tom-2.mp3");
//       tom2.play();
//       break;

//     case "s":
//       var tom3 = new Audio('sounds/tom-3.mp3');
//       tom3.play();
//       break;

//     case "d":
//       var tom4 = new Audio('sounds/tom-4.mp3');
//       tom4.play();
//       break;

//     case "j":
//       var snare = new Audio('sounds/snare.mp3');
//       snare.play();
//       break;

//     case "k":
//       var crash = new Audio('sounds/crash.mp3');
//       crash.play();
//       break;

//     case "l":
//       var kick = new Audio('sounds/kick-bass.mp3');
//       kick.play();
//       break;


//     default: console.log(key);

//   }
// }


// function buttonAnimation(currentKey) {

//   var activeButton = document.querySelector("." + currentKey);

//   activeButton.classList.add("pressed");

//   setTimeout(function() {
//     activeButton.classList.remove("pressed");
//   }, 100);

// }






let drumSounds = {};
let volume = 0.7;
let isPlaying = false;
let beatSequence = Array(7).fill().map(() => Array(8).fill(false));
let currentBeatStep = -1;
let beatInterval;
let tempo = 120;

const drumPatterns = {
  'basic-rock': [
    [true, false, false, false, true, false, false, false], 
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, true, false, true, false, true, false, true], 
    [true, false, true, false, true, false, true, false],
    [true, false, true, false, true, false, true, false] 
  ],
  'hip-hop': [
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, true, false, false, false, true, false],
    [false, false, false, false, false, false, false, false],
    [false, false, true, false, false, false, true, false],
    [true, false, false, false, false, false, false, false],
    [true, false, false, true, true, false, false, true] 
  ],
  'jazz': [
    [false, false, false, false, false, false, false, false], 
    [false, false, false, false, false, false, true, false],
    [false, false, false, false, false, false, false, false], 
    [false, false, false, false, false, false, false, false], 
    [false, true, false, true, false, true, false, true], 
    [true, false, false, false, false, false, false, false], 
    [true, false, true, true, false, true, false, true]  
  ],
  'latin': [
    [false, false, true, false, false, false, true, false], 
    [false, false, false, false, true, false, false, false], 
    [true, false, false, false, false, false, false, true], 
    [false, false, false, false, false, false, false, false], 
    [false, true, false, true, false, true, false, true], 
    [true, false, false, false, false, false, false, false], 
    [true, false, true, false, true, false, true, false]  
  ]
};

function initialize() {
  loadSounds();
  setupEventListeners();
  createBeatGrid();
  showWelcomeMessage();
}

function loadSounds() {
  const keys = ['w', 'a', 's', 'd', 'j', 'k', 'l'];
  const soundFiles = [
    'sounds/tom-1.mp3',
    'sounds/tom-2.mp3',
    'sounds/tom-3.mp3',
    'sounds/tom-4.mp3',
    'sounds/snare.mp3',
    'sounds/crash.mp3',
    'sounds/kick-bass.mp3'
  ];
  
  keys.forEach((key, index) => {
    drumSounds[key] = new Audio(soundFiles[index]);
    drumSounds[key].volume = volume;
  });
}

function setupEventListeners() {
  const drums = document.querySelectorAll('.drum');
  drums.forEach(drum => {
    drum.addEventListener('click', function() {
      const buttonKey = this.innerHTML;
      playSound(buttonKey);
      animateButton(buttonKey);
    });
    
    drum.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) rotateX(5deg)';
    });
    
    drum.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
  
  document.addEventListener('keydown', function(event) {
    // Prevent repeated triggers while key is held down
    if (event.repeat) return;
    
    const key = event.key.toLowerCase();
    if ('wasdjkl'.includes(key)) {
      playSound(key);
      animateButton(key);
    }
  });
  
  // Volume control
  const volumeSlider = document.getElementById('volume-slider');
  volumeSlider.addEventListener('input', function() {
    volume = this.value;
    updateVolumeIcon();
  });
  
  // Volume button toggle mute
  const volumeBtn = document.getElementById('volume-btn');
  volumeBtn.addEventListener('click', function() {
    if (volume > 0) {
      volumeSlider.dataset.lastVolume = volume;
      volume = 0;
      volumeSlider.value = 0;
    } else {
      volume = volumeSlider.dataset.lastVolume || 0.7;
      volumeSlider.value = volume;
    }
    updateVolumeIcon();
  });
  
  // Beat maker controls
  document.getElementById('play-beat').addEventListener('click', playBeat);
  document.getElementById('stop-beat').addEventListener('click', stopBeat);
  document.getElementById('clear-beat').addEventListener('click', clearBeat);
  
  // Contact button functionality
  const contactBtn = document.getElementById('contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', function() {
      const contactInfo = document.getElementById('contact-info');
      contactInfo.style.opacity = contactInfo.style.opacity === '1' ? '0' : '1';
      contactInfo.style.visibility = contactInfo.style.visibility === 'visible' ? 'hidden' : 'visible';
    });
  }
  
  // Tempo slider
  const tempoSlider = document.getElementById('tempo-slider');
  if (tempoSlider) {
    tempoSlider.addEventListener('input', function() {
      tempo = parseInt(this.value);
      document.getElementById('tempo-value').textContent = tempo;
      
      // If beat is playing, restart with new tempo
      if (isPlaying) {
        stopBeat();
        playBeat();
      }
    });
  }
  
  // Pattern buttons
  const patternBtns = document.querySelectorAll('.pattern-btn');
  patternBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const pattern = this.getAttribute('data-pattern');
      loadPattern(pattern);
    });
  });
}

// Play drum sound
function playSound(key) {
  // Create a new audio object each time to allow overlapping sounds
  const sound = new Audio(drumSounds[key].src);
  sound.volume = volume;
  sound.currentTime = 0;
  sound.play();
}

// Animate button press
function animateButton(key) {
  const activeButton = document.querySelector('.' + key);
  if (!activeButton) return;
  
  activeButton.classList.add('pressed');
  
  // Add ripple effect
  activeButton.style.position = 'relative';
  
  setTimeout(function() {
    activeButton.classList.remove('pressed');
  }, 100);
}

// Update volume icon based on current volume
function updateVolumeIcon() {
  const volumeBtn = document.getElementById('volume-btn');
  const icon = volumeBtn.querySelector('i');
  
  if (volume == 0) {
    icon.className = 'fas fa-volume-mute';
  } else if (volume < 0.5) {
    icon.className = 'fas fa-volume-down';
  } else {
    icon.className = 'fas fa-volume-up';
  }
}

// Create the beat grid
function createBeatGrid() {
  const beatGrid = document.getElementById('beat-grid');
  const drumKeys = ['w', 'a', 's', 'd', 'j', 'k', 'l'];
  const drumLabels = ['Tom 1', 'Tom 2', 'Tom 3', 'Tom 4', 'Snare', 'Crash', 'Kick'];
  
  // Create labels column
  const labelCol = document.createElement('div');
  labelCol.className = 'beat-labels';
  labelCol.style.display = 'grid';
  labelCol.style.gridTemplateRows = 'repeat(7, 1fr)';
  labelCol.style.gap = '5px';
  labelCol.style.alignItems = 'center';
  labelCol.style.marginRight = '10px';
  
  drumLabels.forEach(label => {
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label;
    labelDiv.style.fontSize = '0.8rem';
    labelDiv.style.textAlign = 'right';
    labelCol.appendChild(labelDiv);
  });
  
  beatGrid.appendChild(labelCol);
  
  // Create main grid
  const gridContainer = document.createElement('div');
  gridContainer.style.display = 'grid';
  gridContainer.style.gridTemplateRows = 'repeat(7, 1fr)';
  gridContainer.style.gridTemplateColumns = 'repeat(8, 1fr)';
  gridContainer.style.gap = '5px';
  gridContainer.style.flex = '1';
  
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = 'beat-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.key = drumKeys[row];
      
      cell.addEventListener('click', function() {
        const r = parseInt(this.dataset.row);
        const c = parseInt(this.dataset.col);
        beatSequence[r][c] = !beatSequence[r][c];
        this.classList.toggle('active');
        
        // Play sound when toggling on
        if (beatSequence[r][c]) {
          playSound(drumKeys[r]);
        }
      });
      
      gridContainer.appendChild(cell);
    }
  }
  
  beatGrid.appendChild(gridContainer);
  
  // Style the grid container
  beatGrid.style.display = 'flex';
  beatGrid.style.alignItems = 'stretch';
}

// Play beat with current tempo
function playBeat() {
  if (isPlaying) return;
  
  isPlaying = true;
  currentBeatStep = -1;
  
  // Calculate interval based on tempo (BPM)
  const intervalMs = (60 / tempo) * 1000 / 2; // Divide by 2 for eighth notes
  
  beatInterval = setInterval(() => {
    currentBeatStep = (currentBeatStep + 1) % 8;
    
    // Update UI to show current step
    const cells = document.querySelectorAll(`.beat-cell[data-col="${currentBeatStep}"]`);
    
    // Remove playing class from all cells
    document.querySelectorAll('.beat-cell').forEach(cell => {
      cell.classList.remove('playing');
    });
    
    // Add playing class to current column
    cells.forEach(cell => {
      cell.classList.add('playing');
      
      const row = parseInt(cell.getAttribute('data-row'));
      if (beatSequence[row][currentBeatStep]) {
        const key = ['w', 'a', 's', 'd', 'j', 'k', 'l'][row];
        playSound(key);
        animateButton(key);
      }
    });
  }, intervalMs);
  
  document.getElementById('play-beat').innerHTML = '<i class="fas fa-pause"></i> Pause';
}

// Stop the beat playback
function stopBeat() {
  if (!isPlaying) return;
  
  clearInterval(beatInterval);
  isPlaying = false;
  
  document.getElementById('play-beat').disabled = false;
  document.getElementById('play-beat').style.opacity = 1;
  document.getElementById('play-beat').innerHTML = '<i class="fas fa-play"></i> Play';
  
  // Remove all highlighting
  document.querySelectorAll('.beat-cell').forEach(cell => {
    cell.classList.remove('playing');
  });
}

// Clear the beat grid
function clearBeat() {
  // First stop if playing
  if (isPlaying) {
    stopBeat();
  }
  
  // Reset the sequence data
  beatSequence = Array(7).fill().map(() => Array(8).fill(false));
  
  // Update the UI
  document.querySelectorAll('.beat-cell').forEach(cell => {
    cell.classList.remove('active');
  });
}

// Show notification message
function showNotification(message, duration = 3000) {
  // Check if notification element exists
  let notificationElement = document.getElementById('notification');
  
  if (!notificationElement) {
    notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.style.position = 'fixed';
    notificationElement.style.bottom = '20px';
    notificationElement.style.left = '50%';
    notificationElement.style.transform = 'translateX(-50%)';
    notificationElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notificationElement.style.color = 'white';
    notificationElement.style.padding = '10px 20px';
    notificationElement.style.borderRadius = '5px';
    notificationElement.style.zIndex = '1000';
    notificationElement.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(notificationElement);
  }
  
  notificationElement.textContent = message;
  notificationElement.style.opacity = '1';
  
  setTimeout(() => {
    notificationElement.style.opacity = '0';
  }, duration);
}

// Display welcome message with instructions
function showWelcomeMessage() {
  const welcomeMessage = `
    Welcome to the Drum Studio! 
    • Click on drums or press keys (W, A, S, D, J, K, L) to play
    • Use the Beat Maker to create your own patterns
  `;
  
  showNotification(welcomeMessage, 5000);
}

// Load a predefined pattern
function loadPattern(pattern) {
  if (drumPatterns[pattern]) {
    beatSequence = JSON.parse(JSON.stringify(drumPatterns[pattern]));
    updateBeatGrid();
    showNotification(`Loaded ${pattern.replace('-', ' ')} pattern`, 2000);
  }
}

// Update the beat grid UI to match the current beatSequence
function updateBeatGrid() {
  const cells = document.querySelectorAll('.beat-cell');
  cells.forEach(cell => {
    const row = parseInt(cell.getAttribute('data-row'));
    const col = parseInt(cell.getAttribute('data-col'));
    
    if (beatSequence[row][col]) {
      cell.classList.add('active');
    } else {
      cell.classList.remove('active');
    }
  });
}

// Start the application
window.addEventListener('DOMContentLoaded', initialize);



