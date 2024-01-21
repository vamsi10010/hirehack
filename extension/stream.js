let mediaRecorderAudio;
let mediaRecorderVideo;
let recordedBlobsVideo = [];
let recordedBlobsAudio = [];
let optionsVideo = {mimeType: 'video/webm;codecs=vp9'};
let optionsAudio = {mimeType: 'audio/webm;codecs=opus'};
let recognition;
let isAudioRecording = false;
let isVideoRecording = false;
let stopTimeout = null;
let isTimeout = false;
let content = '';

async function startRecording(videoSource = null) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    });

    let videoStream = new MediaStream(stream.getVideoTracks());
    let audioStream = new MediaStream(stream.getAudioTracks());

    document.querySelector('#preview').srcObject = videoStream;

    // let optionsVideo = {mimeType: 'video/webm;codecs=vp9'};
    // let optionsAudio = {mimeType: 'audio/webm;codecs=opus'};
    if (!MediaRecorder.isTypeSupported(optionsVideo.mimeType)) {
      optionsVideo = {mimeType: 'video/webm'};
    }
    if (!MediaRecorder.isTypeSupported(optionsAudio.mimeType)) {
      optionsAudio = {mimeType: 'audio/webm'};
    }

    mediaRecorderVideo = new MediaRecorder(videoStream, optionsVideo);
    mediaRecorderAudio = new MediaRecorder(audioStream, optionsAudio);

    mediaRecorderVideo.ondataavailable = handleDataAvailableVideo;
    mediaRecorderAudio.ondataavailable = handleDataAvailableAudio;

    document.querySelector('#output').textContent = 'Initialized. Ready to record.';

    document.querySelector('#start').addEventListener('click', () => {
      document.querySelector('#output').textContent = 'Session started.';
      recognition.start();
    });

    document.querySelector('#stop').addEventListener('click', () => {
      // document.querySelector('#output').textContent = 'Session ended.';
      isTimeout = false;
      recognition.stop();
    });

  } catch (error) {
    console.error('Error starting recording: ', error);
    alert('Error starting recording. Please check console for more details.');
  }
}

function handleDataAvailableVideo(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobsVideo.push(event.data);
    console.log(`Received video data. Size: ${event.data.size} bytes`);

    // Make video available to download
    const blobVideo = new Blob(recordedBlobsVideo, {type: optionsVideo.mimeType});
    sendToLocalStorage(blobVideo, 'test_video.webm');

    // Reset recordedBlobsVideo
    recordedBlobsVideo = [];
  }
}

function handleDataAvailableAudio(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobsAudio.push(event.data);
    console.log(`Received audio data. Size: ${event.data.size} bytes`);

    // Make audio available to download
    const blobAudio = new Blob(recordedBlobsAudio, {type: optionsAudio.mimeType});
    sendToLocalStorage(blobAudio, 'test_audio.webm');

    // Reset recordedBlobsAudio
    recordedBlobsAudio = [];
  }
}

async function startRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function() {
    console.log('Recognition service started');
  }

  recognition.onend = function() {
    console.log('Recognition service ended');
    if (isTimeout) {
      recognition.start();
    }
  }

  recognition.onresult = function(event) {
    console.log('Recognition result received');
    const result = event.results[0][0].transcript;
    console.log(`Result: ${result}`);
    content += ' ' + result;
    recognition.content = content;
  }

  recognition.onspeechstart = function() {
    console.log('Speech started event');
    if (stopTimeout) {
      clearTimeout(stopTimeout);
      stopTimeout = null;
    }
    if (!isAudioRecording && !isVideoRecording) {
      mediaRecorderVideo.start();
      mediaRecorderAudio.start();
      isAudioRecording = true;
      isVideoRecording = true;
      console.log('Recording started.');
      // document.querySelector('#output').textContent = 'Recording started.';
    }
  };

  recognition.onspeechend = function() {
    console.log('Speech ended event');
    isTimeout = true;
    stopTimeout = setTimeout(() => {
      isTimeout = false;
      if (isAudioRecording && isVideoRecording) {
        mediaRecorderVideo.stop();
        mediaRecorderAudio.stop();
        isAudioRecording = false;
        isVideoRecording = false;
        console.log('Recording stopped.');
        // document.querySelector('#output').textContent = 'Recording ended.';

        const blob = new Blob([content], { type: 'text/plain' });
        sendToLocalStorage(blob, 'transcript.txt');

        rec_vec = fetch('http://127.0.0.1:8080/run', { method: 'get', mode: 'no-cors' }) // Add missing semicolon at the end
                    .then(response => {
                      // if (!response.ok) {
                      //   throw new Error('Network response was not ok');
                      // }
                      return response.json();
                    })
                    .then(data => {
                      console.log(data);
                    })
                    .catch(error => {
                      console.error('There has been a problem with your fetch operation:', error);
                    });
        document.querySelector('#output').textContent = rec_vec.data;
      }
    }, 3000); // Wait for 3 seconds before stopping the recording
  };
}

async function populateCameraList() {
  await startRecognition();

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const select = document.querySelector('#cameraList');

  videoDevices.forEach((device, i) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label || `Camera ${i + 1}`;
    select.appendChild(option);
  });

  select.selectedIndex = 0;
  startRecording(select.value);

  select.addEventListener('change', () => {
    startRecording(select.value);
  });
}

document.addEventListener('DOMContentLoaded', populateCameraList);

function sendToLocalStorage(blob, fileName) {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a new anchor element
  const a = document.createElement('a');

  // Set the href and download attributes of the anchor
  a.href = url;
  a.download = fileName || 'download';

  // Append the anchor to the body
  document.body.appendChild(a);

  // Click the anchor to start the download
  a.click();

  // Remove the anchor from the body
  document.body.removeChild(a);
}