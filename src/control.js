const video = document.getElementById('video');
const actionBtn = document.getElementById('button_capture');
const width = 400;
const height = 400;
const FPS = 30;
let stream;
let streaming = false;
document.body.classList.add("loading");

function onOpenCvReady() {
  cv.onRuntimeInitialized = onReady;
  document.body.classList.remove("loading");
  console.log("OpenCV is ready: ",cv)
}

function onReady() {
    let src;
    let dst;
    const cap = new cv.VideoCapture(video);
    actionBtn.addEventListener('click', () => {
        if (streaming) {
            stop();
            actionBtn.textContent = 'Start';
        } else {
            start();
            actionBtn.textContent = 'Stop';
        }
    });
    
    function start () {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(_stream => {
            stream = _stream;
            console.log('stream', stream);
            video.srcObject = stream;
            video.play();
            streaming = true;
            src = new cv.Mat(height, width, cv.CV_8UC4);
            dst = new cv.Mat(height, width, cv.CV_8UC1);
            setTimeout(processVideo, 0)
        })
        .catch(err => console.log(`An error occurred: ${err}`));
    }

    function stop () {
        if (video) {
            video.pause();
            video.srcObject = null;
        }
        if (stream) {
            stream.getVideoTracks()[0].stop();
        }
        streaming = false;
    }

    function processVideo () {
        if (!streaming) {
            src.delete();
            dst.delete();
            return;
        }
        const begin = Date.now();
        cap.read(src)
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.imshow('canvas_output', dst);
        const delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
}