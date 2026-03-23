/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DISHES, type Dish } from '../data/dishes';
import DishMenu from './UI/DishMenu';

interface ARViewProps {
  currentDish: Dish;
  onDishChange: (dish: Dish) => void;
}

const ARView: React.FC<ARViewProps> = ({ currentDish, onDishChange }) => {
  const [isPlaced, setIsPlaced] = useState(false);
  const [placementPosition, setPlacementPosition] = useState("0 0 -2");
  
  // Refs for tracking state without closures in A-Frame callbacks
  const isPlacedRef = useRef(isPlaced);
  const setIsPlacedRef = useRef(setIsPlaced);
  const setPlacementPositionRef = useRef(setPlacementPosition);

  // Keep refs in sync
  useEffect(() => {
    isPlacedRef.current = isPlaced;
    setIsPlacedRef.current = setIsPlaced;
    setPlacementPositionRef.current = setPlacementPosition;
  }, [isPlaced, placementPosition]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'AFRAME' in window) {
      const AFRAME = (window as any).AFRAME;

      // Tap to Place Logic
      if (!AFRAME.components['tap-to-place']) {
        AFRAME.registerComponent('tap-to-place', {
          init: function () {
            this.el.sceneEl.addEventListener('click', (event: any) => {
              // Ignore if clicking on React UI (all UI is inside .ar-ui-overlay)
              if (event.target.closest('.ar-ui-overlay')) return;
              
              if (!isPlacedRef.current) {
                const cursor = document.querySelector('[cursor]');
                if (cursor) {
                  const raycaster = (cursor as any).components.raycaster;
                  const intersection = raycaster.getIntersection(document.querySelector('#ground'));
                  if (intersection) {
                    const { x, y, z } = intersection.point;
                    setPlacementPositionRef.current(`${x} ${y} ${z}`);
                    setIsPlacedRef.current(true);
                  }
                }
              }
            });
          }
        });
      }

      // Drag to Move Logic
      if (!AFRAME.components['drag-handler']) {
        AFRAME.registerComponent('drag-handler', {
          init: function () {
            this.dragging = false;
            this.el.addEventListener('mousedown', () => { this.dragging = true; });
            window.addEventListener('mouseup', () => { this.dragging = false; });
            
            const handleMove = () => {
              if (this.dragging && isPlacedRef.current) {
                const cursor = document.querySelector('[cursor]');
                if (cursor) {
                  const raycaster = (cursor as any).components.raycaster;
                  const intersection = raycaster.getIntersection(document.querySelector('#ground'));
                  if (intersection) {
                    const { x, y, z } = intersection.point;
                    setPlacementPositionRef.current(`${x} ${y} ${z}`);
                  }
                }
              }
            };

            this.el.sceneEl.addEventListener('mousemove', handleMove);
            this.el.addEventListener('touchstart', () => { this.dragging = true; });
            window.addEventListener('touchend', () => { this.dragging = false; });
            this.el.sceneEl.addEventListener('touchmove', handleMove);
          }
        });
      }
    }
  }, []);

  return (
    <div className="ar-container">
      {/* 3D SCENE BACKGROUND */}
      <a-scene
        embedded="true"
        arjs="sourceType: webcam; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        gesture-detector=""
        renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true;"
        tap-to-place=""
      >
        <a-assets>
          <a-asset-item id="dish-model" src={currentDish.modelPath}></a-asset-item>
        </a-assets>

        <a-entity camera id="camera">
          <a-entity
            cursor="fuse: false; rayOrigin: mouse;"
            position="0 0 -1"
            raycaster="objects: .raycastable, .draggable"
          ></a-entity>
        </a-entity>

        <a-light type="ambient" color="#BBB"></a-light>
        <a-light type="directional" color="#FFF" intensity="0.8" position="-0.5 1 1"></a-light>

        <a-entity
          id="ground"
          className="raycastable"
          geometry="primitive: plane; width: 100; height: 100"
          rotation="-90 0 0"
          position="0 -1.6 0"
          material="opacity: 0; transparent: true"
        ></a-entity>

        <a-entity
          id="placed-dish"
          className="draggable"
          position={placementPosition}
          visible={isPlaced}
          scale="0.5 0.5 0.5"
          gesture-handler="minScale: 0.1; maxScale: 5"
          drag-handler
        >
          <a-entity
            gltf-model="#dish-model"
            key={currentDish.id}
          >
            {/* Holographic base for stability visual */}
            <a-entity 
              geometry="primitive: cylinder; radius: 0.3; height: 0.05" 
              material="color: #444; opacity: 0.3; wireframe: true"
              visible={!isPlaced} 
            ></a-entity>
          </a-entity>
        </a-entity>

        {!isPlaced && (
          <a-entity
            id="reticle"
            geometry="primitive: ring; radiusInner: 0.1; radiusOuter: 0.15"
            material="color: #fffc00; shader: flat"
            rotation="-90 0 0"
            position="0 -1.59 -2"
            animation="property: scale; to: 1.1 1.1 1.1; dir: alternate; dur: 1000; loop: true"
          ></a-entity>
        )}
      </a-scene>

      {/* REACT OVERLAY (UI) - ENSURE IT IS INSIDE THE AR CONTAINER */}
      <div className="ar-ui-overlay">
        
        {/* TOP PANEL */}
        <div className="top-nav">
          <div className="brand">
            <motion.h1 
              key={currentDish.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {currentDish.name}
            </motion.h1>
            <span>SNAP UI • AR MENU</span>
          </div>
          <div className="top-icons">
            <div className="icon-btn" onClick={() => window.location.reload()}>⟳</div>
            <div className="icon-btn">⚙</div>
          </div>
        </div>

        {/* SCANNING CUES */}
        {!isPlaced && (
          <div className="scanning-overlay">
            <div className="scanning-ring">
              <div className="crosshair"></div>
            </div>
            <div className="scan-text-wrapper">
              <div className="scan-text">SCANNING SURFACE...</div>
              <p>TAP TO PLACE YOUR MEAL</p>
            </div>
          </div>
        )}

        {/* LENS MENU (MOVED INSIDE FOR PERSISTENCE) */}
        <DishMenu 
          currentDish={currentDish} 
          onDishChange={onDishChange} 
        />

        {/* INTERACTION HINT */}
        {isPlaced && (
          <div className="interaction-hint">
            <span>👆 DRAG TO MOVE</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>🤏 PINCH TO SCALE</span>
          </div>
        )}

        {/* CAPTURE BUTTON (VISUAL) */}
        <div className="capture-overlay">
          <div className="capture-ring"></div>
        </div>
      </div>
    </div>
  );
};

export default ARView;
