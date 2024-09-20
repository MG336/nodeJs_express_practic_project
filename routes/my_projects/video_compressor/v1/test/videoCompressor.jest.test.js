const request = require("supertest"); 
const express = require("express"); 
const path = require("path"); 
const fs = require("fs").promises; 
const router = require("../videoCompressor.js"); 

const ffmpegPath = require("ffmpeg-static");
const { spawn } = require("child_process");

async function createFakeVideoFile(outputFilePath) {
  try {

    await fs.access(outputFilePath);
    console.log('File already exists:', outputFilePath);
    return; 

  } catch {
    return new Promise((resolve, reject) => {
      
      const ffmpegProcess = spawn(ffmpegPath, [
        "-f", "lavfi",
        "-i", "color=c=black:s=1920x1080",
        "-t", "2",
        outputFilePath
      ]);

      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          console.log('Fake video file created:', outputFilePath);
          resolve();
        } else {
          reject(new Error("Error creating fake video file"));
        }
      });


      ffmpegProcess.on("error", (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      });
    });
  }
}

describe("Video Compressor API", () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json()); 
        app.use("/", router); 
      });

      it("POST /v1/video-compressor - should compress videos and generate images", async () => {
      
        
        
        const importDirPath = path.join(__dirname,"test_videos");

        const exportDirPath = path.join(__dirname, "output_videos");

        const testFilePath = path.join(importDirPath, "test_video.mp4");

        await fs.mkdir(importDirPath, { recursive: true });

        await createFakeVideoFile(testFilePath);

      const response = await request(app)
      .post("/v1/video-compressor")
      .send({ importDirPath, exportDirPath });


      expect(response.status).toBe(200); 
      expect(response.body.message).toBe("complate");


      await fs.rm(importDirPath, { recursive: true });
      await fs.rm(exportDirPath, { recursive: true });
  })
}
)    