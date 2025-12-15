const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function extractError(res) {
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const j = await res.json().catch(() => null);
    if (j) return j.error || j.message || JSON.stringify(j);
  }

  const text = await res.text().catch(() => "");
  try {
    const j = JSON.parse(text);
    return j.error || j.message || text;
  } catch {
    return text || `Request failed (${res.status})`;
  }
}

// Some browsers give file.type="" for .doc/.docx, so infer from extension
function inferContentType(file) {
  if (file.type) return file.type;

  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".doc")) return "application/msword";
  if (name.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

export async function presignResumeUpload(file) {
  const contentType = inferContentType(file);

  const res = await fetch(`${API_BASE}/resume/presign-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // IMPORTANT for express-session cookies
    body: JSON.stringify({
      filename: file.name,
      contentType,
      size: file.size
    })
  });

  if (!res.ok) {
    throw new Error(await extractError(res));
  }

  return { ...(await res.json()), contentType }; // { uploadUrl, key, expiresIn, contentType }
}

export async function uploadResumeToS3(uploadUrl, file, contentType) {
  console.log("S3 PUT URL: ", uploadUrl);

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file
  });

  if (!putRes.ok) {
    const text = await putRes.text().catch(() => "");
    throw new Error(`S3 upload failed (${putRes.status}): ${text}`);
  }
}

export async function getResumeDownloadUrl() {
  const res = await fetch(`${API_BASE}/resume/download-url`, {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error(await extractError(res));
  }

  return res.json(); // { downloadUrl, expiresIn }
}
