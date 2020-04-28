const video = document.getElementById('video');
const actionBtn = document.getElementById('button_capture');
const width = 400;
const height = 400;
const FPS = 30;
let stream;
let streaming = false;
let faceCascadeFile = 'haarcascade_frontalface_default.xml';
document.body.classList.add("loading");

function onOpenCvReady() {
  cv.onRuntimeInitialized = onReady;
  document.body.classList.remove("loading");
  console.log("OpenCV is ready: ",cv);
}

function meme() {
    console.log("files are loaded");
}
function onReady() {
    let src;
    let dst;
    let gray;
    const cap = new cv.VideoCapture(video);
    let classifier;
    let faces 
  
    
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
            dst = new cv.Mat(height, width, cv.CV_8UC4);
            faces = new cv.RectVector();
            gray = new cv.Mat();
            // load pre-trained classifiers
            classifier = new cv.CascadeClassifier();
            if(classifier.load(faceCascadeFile) != true) {
                alert("error while loading face detection file");
            }
            
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
            gray.delete();
            faces.delete();
            classifier.delete();
            return;
        }
        const begin = Date.now();
        cap.read(src);
        src.copyTo(dst);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY,0);
        
        // detect faces.
        classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
        // draw faces.
        for (let i = 0; i < faces.size(); ++i) {
            let face = faces.get(i);
            let point1 = new cv.Point(face.x, face.y);
            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            
            //run the model
            
        }
        
        cv.imshow('canvas_output', dst);
        
        //schedule next call
        const delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
}