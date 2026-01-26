import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const storeKey = req.nextUrl.searchParams.get("key");

  if (storeKey !== "zamzam_key") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!token) {
    return new NextResponse("Token required", { status: 400 });
  }

  // Return HTML that sets localStorage on YOUR domain
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Device Authorization - ZamZam Cold Storage</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1e3a5f 0%, #0f1f3a 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      max-width: 500px;
    }
    .status { 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0;
      font-size: 18px;
    }
    .success { background: rgba(34, 197, 94, 0.3); border: 2px solid #22c55e; }
    .error { background: rgba(239, 68, 68, 0.3); border: 2px solid #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 ZamZam Cold Storage</h1>
    <h2>Device Authorization</h2>
    <div id="status" class="status">Installing...</div>
  </div>
  <script>
    try {
      localStorage.setItem("zamzam_key", "${token}");
      document.getElementById('status').className = 'status success';
      document.getElementById('status').innerHTML = '✅ Device authorized!<br><br>You can close this page and <a href="/login" style="color: #22c55e;">login now</a>.';
    } catch (e) {
      document.getElementById('status').className = 'status error';
      document.getElementById('status').innerHTML = '❌ Failed. Enable cookies and try again.';
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}