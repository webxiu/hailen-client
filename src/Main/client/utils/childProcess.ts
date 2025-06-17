import { exec,spawn} from "child_process";

export function childExec(command) { 
  return new Promise((resolve, reject) => {
    const cp = exec(command);
    cp.on("error", (error) =>  reject({ error: error.message }));
    // 子进程结束
    cp.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        reject({ error: code });
      }
    });
  });
}

export function childSpawn(command) { 
  const cp = spawn(command, { shell: true });
  return new Promise((resolve, reject) => {   
    let chunk = "";
    cp.stdout.on("data", (data) => chunk += data.toString());
    cp.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      reject({ error: data.toString() });
    });
    cp.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, chunk });
      } else {
        reject({ error: `exited code ${code}` });
      }
    });
  });
}