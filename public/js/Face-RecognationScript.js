const video = document.getElementById('video');
const myPhotoPath = './upload/'+voterDetails;

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('./js/api'),
    faceapi.nets.tinyFaceDetector.loadFromUri('./js/api'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./js/api'),
    faceapi.nets.faceExpressionNet.loadFromUri('./js/api'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./js/api')
])
    .then(startVideo)
    .catch(error => console.error(error));
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            console.log(voterDetails)
            video.addEventListener('play', async () => {
                const canvas = faceapi.createCanvasFromMedia(video);
                document.body.append(canvas);
                const displaySize = { width: video.width, height: video.height };
                faceapi.matchDimensions(canvas, displaySize);

                setInterval(async () => {
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors();
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                    faceapi.draw.drawDetections(canvas, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                    if (resizedDetections.length > 0) {
                        const webcamFaceDescriptors = resizedDetections.map(detection => detection.descriptor);
                        const myPhoto = await faceapi.fetchImage(myPhotoPath);
                        const myPhotoDetection = await faceapi.detectSingleFace(myPhoto)
                            .withFaceLandmarks()
                            .withFaceDescriptor();

                        if (myPhotoDetection && myPhotoDetection.descriptor) {
                            const myPhotoDescriptor = myPhotoDetection.descriptor;
                            const faceMatcher = new faceapi.FaceMatcher(myPhotoDescriptor);
                            const matches = webcamFaceDescriptors.map(descriptor => faceMatcher.findBestMatch(descriptor));

                            matches.forEach(match => {
                                if (match.distance < 0.6) {
                                    window.location.href = '/OptionsOfElection';
                                } else {
                                    alert('You are not Expected Voter');
                                }
                            });
                        } else {
                            alert("Face not detected in the stored photo!");
                        }
                    } else {
                        alert("No faces detected in the webcam video stream!");
                    }
                }, 100);
            });
        })
        .catch(err => console.error(err));
}
