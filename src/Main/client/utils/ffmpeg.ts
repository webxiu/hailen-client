const { spawn } = require("child_process");
const path = require("path");

const ffmpegPath = path.join($$.appInfo.rootPath, "./source/ffmpeg/ffmpeg.exe");

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    console.log("🚀 执行命令:");
    console.log("ffmpegPath:", ffmpegPath);
    console.log("args:", args);

    const ff = spawn(ffmpegPath, args);

    ff.stdout.on("data", (data) => {
      console.log("stdout:", data.toString());
    });

    ff.stderr.on("data", (data) => {
      console.log("❌ ffmpeg stderr:", data.toString());
    });

    ff.on("error", (err) => {
      console.error("🔥 spawn error:", err);
      reject(err);
    });

    ff.on("close", (code) => {
      console.log("🧾 退出码:", code);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("ffmpeg执行失败"));
      }
    });
  });
}

export { runFFmpeg };
