import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
// import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.put("/update-profile", protectRoute, updateProfile)

router.get("/check", protectRoute, checkAuth)

router.get("/login", (req, res) => {
  const redirectUrl = req.query.redirect || "";
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Login</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          background: #fafafa;
          color: #222;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        h2 {
          margin-bottom: 1rem;
        }
        input {
          padding: 10px;
          margin: 0.5rem 0;
          width: 250px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        button {
          padding: 10px 20px;
          border: none;
          background: #ffb347;
          color: #000;
          font-weight: bold;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background: #ffcc33;
        }
      </style>
    </head>
    <body>
      <h2>Login to KCSR Breads</h2>
      <input id="email" type="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button onclick="login()">Login</button>
      <p id="msg"></p>

      <script>
        async function login() {
          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;
          const msg = document.getElementById("msg");
          msg.textContent = "Logging in...";
          try {
            const res = await fetch("/api/auth/login?redirect=${redirectUrl}", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            const text = await res.text();
            document.write(text);
          } catch (err) {
            msg.textContent = "Login failed. Please try again.";
          }
        }
      </script>
    </body>
    </html>
  `);
});


// router.post("/api/products", protectRoute, isAdmin, createProductHandler)


export default router;