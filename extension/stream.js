let mediaRecorderAudio;
let mediaRecorderVideo;
let recordedBlobsVideo = [];
let recordedBlobsAudio = [];
let optionsVideo = { mimeType: 'video/webm;codecs=vp9' };
let optionsAudio = { mimeType: 'audio/webm;codecs=opus' };
let recognition;
let isAudioRecording = false;
let isVideoRecording = false;
let stopTimeout = null;
let isTimeout = false;
let content = "";

async function startRecording(videoSource = null) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { deviceId: videoSource ? { exact: videoSource } : undefined },
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
      document.querySelector('#output').textContent = 'Session started.';
      recognition.start();
    });

    document.querySelector('#stop').addEventListener('click', () => {
      document.querySelector('#output').textContent = 'Session ended.';
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
    const blobVideo = new Blob(recordedBlobsVideo, { type: optionsVideo.mimeType });
    const urlVideo = window.URL.createObjectURL(blobVideo);
    const aVideo = document.createElement('a');
    aVideo.style.display = 'none';
    aVideo.href = urlVideo;
    aVideo.download = 'test_video.webm';
    document.body.appendChild(aVideo);
    aVideo.click();

    // Reset recordedBlobsVideo
    recordedBlobsVideo = [];
  }
}

function handleDataAvailableAudio(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobsAudio.push(event.data);
    console.log(`Received audio data. Size: ${event.data.size} bytes`);

    // Make audio available to download
    const blobAudio = new Blob(recordedBlobsAudio, { type: optionsAudio.mimeType });
    const urlAudio = window.URL.createObjectURL(blobAudio);
    const aAudio = document.createElement('a');
    aAudio.style.display = 'none';
    aAudio.href = urlAudio;
    aAudio.download = 'test_audio.webm';
    document.body.appendChild(aAudio);
    aAudio.click();

    // Reset recordedBlobsAudio
    recordedBlobsAudio = [];
  }
}

async function startRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function () {
    console.log('Recognition service started');
    console.log('STT is on');
  };

  recognition.onend = function () {
    console.log('Recognition service ended');
    document.querySelector('#output').value = ""; // Fix: Use textbox.value to set the value
    if (isTimeout) {
      recognition.start();
    } else {
      // Create a Blob from the transcript content
      const blob = new Blob([content], { type: 'text/plain' });

      // Create a download link
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'transcript.txt';

      // Append the link to the document
      document.body.appendChild(a);

      // Trigger a click on the link to start the download
      a.click();

      // Remove the link from the document
      document.body.removeChild(a);
    }
  };

  recognition.onresult = function (event) {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    content += transcript;
    document.querySelector('#output').value = transcript;
  };

  recognition.onspeechstart = function () {
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
      document.querySelector('#output').textContent = 'Recording started.';
    }
  };

  recognition.onspeechend = function () {
    console.log('Speech ended event');
    console.log('No activity for STT');
    isTimeout = true;
    stopTimeout = setTimeout(() => {
      isTimeout = false;
      if (isAudioRecording && isVideoRecording) {
        mediaRecorderVideo.stop();
        mediaRecorderAudio.stop();
        isAudioRecording = false;
        isVideoRecording = false;
        console.log('Recording stopped.');
        document.querySelector('#output').textContent = 'Recording ended.';
      }
    }, 3000); // Wait for 3 seconds before stopping the recording
  };
}

async function populateCameraList() {
  await startRecognition();

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === 'videoinput');
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
