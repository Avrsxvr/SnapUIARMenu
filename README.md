# SnapUI AR Menu 🍣 🍝 🍰

A premium, scalable AR Menu application with a Snapchat-inspired UI. Built with **React**, **Vite**, **A-Frame**, and **AR.js**.

## ✨ Features

- **Snapchat Lens UI**: Horizontal scrolling dish menu with active pulse animations and glassmorphism.
- **Direct Camera Access**: Opens AR camera instantly on load (no "Enter AR" button needed).
- **Interactive Control**:
  - **Pinch to Scale**: Resize dishes on your table.
  - **Two-Finger Rotate**: Spin dishes to see every detail.
  - **One-Finger Drag**: Reposition the placed dish across the surface.
- **6DoF Stability**: Uses AR.js (WebXR/Markerless) for stable anchoring on real-world surfaces.
- **Professional Overlays**: Dynamic "Scanning" 3D reticle and info cards for each dish.
- **Open Source**: No API keys or expensive 8th Wall subscriptions required.

## 🛠️ Technology Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **AR Engine**: [A-Frame](https://aframe.io/) + [AR.js](https://github.com/AR-js-org/AR.js)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks & Refs (Optimized for AR callback context)

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Locally**:
   ```bash
   npm run dev
   ```

3. **Open on Mobile**:
   Use the local network URL (e.g., `https://192.168.x.x:5173`) on your phone browser.
   *Note: AR requires HTTPS. If you're using Vite, enable HTTPS in your config or use a tool like `ngrok` for testing.*

## 📂 Project Structure

- `src/components/ARView.tsx`: Main AR scene and interaction logic.
- `src/components/UI/DishMenu.tsx`: Horizontal scrolling lenses menu.
- `src/data/dishes.ts`: Configuration for dish models and icons.
- `src/index.css`: Design System (Glassmorphism, Snapchat Colors, Animations).

## 📄 License

This project is open-source. Feel free to use and extend!
