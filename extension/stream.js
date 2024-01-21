let mediaRecorderAudio;
let mediaRecorderVideo;
let recordedBlobsVideo = [];
let recordedBlobsAudio = [];
let optionsVideo = { mimeType: 'video/webm;codecs=vp9' };
let optionsAudio = { mimeType: 'audio/webm;codecs=opus' };

async function startRecording(videoSource = null) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    });

    let videoStream = new MediaStream(stream.getVideoTracks());
    let audioStream = new MediaStream(stream.getAudioTracks());

    document.querySelector('#preview').srcObject = videoStream;

    if (!MediaRecorder.isTypeSupported(optionsVideo.mimeType)) {
      optionsVideo = { mimeType: 'video/webm' };
    }
    if (!MediaRecorder.isTypeSupported(optionsAudio.mimeType)) {
      optionsAudio = { mimeType: 'audio/webm' };
    }

    mediaRecorderVideo = new MediaRecorder(videoStream, optionsVideo);
    mediaRecorderAudio = new MediaRecorder(audioStream, optionsAudio);

    mediaRecorderVideo.ondataavailable = handleDataAvailableVideo;
    mediaRecorderAudio.ondataavailable = handleDataAvailableAudio;

    document.querySelector('#output').textContent = 'Initialized. Ready to record.';

    document.querySelector('#start').addEventListener('click', () => {
      recordedBlobsVideo = [];
      recordedBlobsAudio = [];
      mediaRecorderVideo.start();
      mediaRecorderAudio.start();
      console.log('Recording started.');
      document.querySelector('#output').textContent = 'Recording started.';
    });

    document.querySelector('#stop').addEventListener('click', () => {
      mediaRecorderVideo.stop();
      mediaRecorderAudio.stop();
      console.log('Recording stopped by user.');
      document.querySelector('#output').textContent = 'Recording stopped by user.';

      // Convert recordedBlobsVideo and recordedBlobsAudio to blobs
      const blobVideo = new Blob(recordedBlobsVideo, { type: optionsVideo.mimeType });
      const blobAudio = new Blob(recordedBlobsAudio, { type: optionsAudio.mimeType });

      // Send the blobs to the Flask server
      sendToFlask(blobVideo, blobAudio);
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
  }
}

function handleDataAvailableAudio(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobsAudio.push(event.data);
    console.log(`Received audio data. Size: ${event.data.size} bytes`);
  }
}

function sendToFlask(blobVideo, blobAudio) {
  const formData = new FormData();
  formData.append('video', blobVideo, 'video.webm');
  formData.append('audio', blobAudio, 'audio.webm');

  fetch('https://hirehack.onrender.com', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log('Response from Flask server:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function populateCameraList() {
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
