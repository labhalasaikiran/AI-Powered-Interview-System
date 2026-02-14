// Proctoring Service - Monitors eye movement, face detection, and phone detection
// This service uses ML models available in the browser (TensorFlow.js)

export class ProctoringService {
  constructor() {
    this.eyeTrackingData = [];
    this.faceDetectionData = [];
    this.phoneDetectionData = [];
    this.audioContext = null;
    this.analyser = null;
    this.micPermission = false;
  }

  // Initialize proctoring systems
  async initializeProctoring() {
    console.log("Initializing proctoring systems...");
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: true 
      });
      
      // Setup audio context for microphone monitoring
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      source.connect(this.analyser);
      
      this.micPermission = true;
      return { success: true, stream };
    } catch (error) {
      console.error("Proctoring initialization failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Monitor eye movement using face detection
  async monitorEyeMovement(video, onViolation) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let eyeAwayCounter = 0;
    const THRESHOLD = 5; // consecutive frames threshold

    const detectEyes = async () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Use face detection API if available, otherwise use basic motion detection
      try {
        // Note: For production, integrate with TensorFlow.js or face-api.js
        // This is a placeholder for eye detection logic
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const eyesDetected = this.analyzeEyePosition(imageData);
        
        if (!eyesDetected || eyesDetected.lookingAway) {
          eyeAwayCounter++;
          if (eyeAwayCounter >= THRESHOLD) {
            onViolation({
              type: "eye_movement",
              severity: "warning",
              message: "Eyes detected away from screen",
              timestamp: new Date()
            });
            eyeAwayCounter = 0;
          }
        } else {
          eyeAwayCounter = Math.max(0, eyeAwayCounter - 1);
        }

        this.eyeTrackingData.push({
          timestamp: new Date(),
          eyesDetected,
          lookingAtScreen: !eyesDetected?.lookingAway
        });
      } catch (error) {
        console.error("Eye tracking error:", error);
      }

      requestAnimationFrame(detectEyes);
    };

    detectEyes();
  }

  // Analyze eye position from image data
  analyzeEyePosition(imageData) {
    // This is a simplified analysis
    // In production, use face-api.js or TensorFlow.js for accurate eye tracking
    
    const data = imageData.data;
    let darkPixels = 0;
    
    // Analyze upper third of face area for eye detection
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < 50) darkPixels++;
    }

    return {
      darkPixelsRatio: darkPixels / (imageData.width * imageData.height),
      lookingAway: darkPixelsRatio < 0.3
    };
  }

  // Monitor face detection - one person in frame, face toward screen
  async monitorFaceDetection(video, onViolation) {
    let noFaceCounter = 0;
    let multipleFacesCounter = 0;
    const THRESHOLD = 3;

    const detectFace = async () => {
      try {
        // Using Canvas for basic face detection
        // For production, use face-api.js or TensorFlow.js FaceMesh
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const faceCount = this.detectFaces(imageData);
        
        if (faceCount === 0) {
          noFaceCounter++;
          if (noFaceCounter >= THRESHOLD) {
            onViolation({
              type: "no_face",
              severity: "critical",
              message: "No face detected in frame",
              timestamp: new Date()
            });
          }
        } else if (faceCount > 1) {
          multipleFacesCounter++;
          if (multipleFacesCounter >= THRESHOLD) {
            onViolation({
              type: "multiple_faces",
              severity: "critical",
              message: "Multiple people detected in frame",
              timestamp: new Date()
            });
          }
        } else {
          noFaceCounter = 0;
          multipleFacesCounter = 0;
        }

        this.faceDetectionData.push({
          timestamp: new Date(),
          faceCount,
          valid: faceCount === 1
        });
      } catch (error) {
        console.error("Face detection error:", error);
      }

      requestAnimationFrame(() => detectFace());
    };

    detectFace();
  }

  // Detect faces using basic skin tone detection
  detectFaces(imageData) {
    const data = imageData.data;
    let skinPixels = 0;
    
    // Simple skin tone detection (can be improved)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detect skin-like colors
      if (r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15) {
        skinPixels++;
      }
    }

    // Cluster detection (very basic)
    return skinPixels > (imageData.width * imageData.height * 0.1) ? 1 : 0;
  }

  // Monitor for phone/gadget detection
  async monitorPhoneDetection(video, onViolation) {
    let phoneDetectedCounter = 0;
    const THRESHOLD = 3;

    const detectPhone = async () => {
      try {
        // This can be enhanced with object detection models
        // For now, use motion and edge detection
        
        const phoneDetected = this.analyzeForPhonePresence(video);
        
        if (phoneDetected) {
          phoneDetectedCounter++;
          if (phoneDetectedCounter >= THRESHOLD) {
            onViolation({
              type: "phone_detected",
              severity: "critical",
              message: "Phone or gadget detected",
              timestamp: new Date()
            });
            phoneDetectedCounter = 0;
          }
        } else {
          phoneDetectedCounter = Math.max(0, phoneDetectedCounter - 1);
        }

        this.phoneDetectionData.push({
          timestamp: new Date(),
          detected: phoneDetected
        });
      } catch (error) {
        console.error("Phone detection error:", error);
      }

      setTimeout(() => detectPhone(), 1000);
    };

    detectPhone();
  }

  // Analyze video for phone presence using shape and color detection
  analyzeForPhonePresence(video) {
    // This is a simplified check
    // In production, use YOLO or TensorFlow.js object detection
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Detect rectangular shapes (phones typically are rectangular)
    let rectangularPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < 100 || brightness > 200) rectangularPixels++;
    }

    return rectangularPixels > (imageData.width * imageData.height * 0.2);
  }

  // Monitor audio for background noise or interruptions
  monitorAudio(onViolation) {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    let highNoiseCounter = 0;
    const THRESHOLD = 5;

    const checkAudio = () => {
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average frequency
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      if (average > 100) { // High noise threshold
        highNoiseCounter++;
        if (highNoiseCounter >= THRESHOLD) {
          onViolation({
            type: "background_noise",
            severity: "warning",
            message: "High background noise detected",
            timestamp: new Date()
          });
          highNoiseCounter = 0;
        }
      } else {
        highNoiseCounter = Math.max(0, highNoiseCounter - 1);
      }

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }

  // Get proctoring report
  getProctoringReport() {
    return {
      eyeTrackingData: this.eyeTrackingData,
      faceDetectionData: this.faceDetectionData,
      phoneDetectionData: this.phoneDetectionData,
      summary: {
        totalEyeTrackingEvents: this.eyeTrackingData.length,
        totalFaceDetectionEvents: this.faceDetectionData.length,
        totalPhoneDetectionEvents: this.phoneDetectionData.length,
        integrityScore: this.calculateIntegrityScore()
      }
    };
  }

  // Calculate integrity score
  calculateIntegrityScore() {
    let score = 100;
    
    // Deduct points for violations
    const eyeViolations = this.eyeTrackingData.filter(e => !e.lookingAtScreen).length;
    const faceViolations = this.faceDetectionData.filter(f => !f.valid).length;
    const phoneViolations = this.phoneDetectionData.filter(p => p.detected).length;

    score -= eyeViolations * 2;
    score -= faceViolations * 5;
    score -= phoneViolations * 10;

    return Math.max(0, score);
  }

  // Stop proctoring
  stopProctoring() {
    console.log("Proctoring stopped");
    // Clean up resources
  }
}

export default ProctoringService;
