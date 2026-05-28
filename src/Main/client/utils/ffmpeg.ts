import { spawn } from "child_process";
import path from "path";

function getFfmpegPath({ rootPath, platform }) {
  const FFMPEG = {
    dir: "source/ffmpeg",
    bin: { win32: "ffmpeg.exe", darwin: "ffmpeg" }
  };
  return path.join(rootPath, FFMPEG.dir, FFMPEG.bin[platform]);
}
const ffmpegPath = getFfmpegPath($$.appInfo);

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
        resolve(code);
      } else {
        reject(new Error("ffmpeg执行失败"));
      }
    });
  });
}

export { runFFmpeg };
