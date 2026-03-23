/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Dish } from '../data/dishes';

// Failsafe mappings to bypass JSX type limitations in some IDE environments
const AScene = 'a-scene' as any;
const AAssets = 'a-assets' as any;
const AAssetItem = 'a-asset-item' as any;
const AEntity = 'a-entity' as any;
const ALight = 'a-light' as any;

/**
 * DishMenu Component - Refactored to be local to ARView file 
 * to solve all cross-file import/type resolution issues.
 */
const DishMenu: React.FC<{ currentDish: any, onDishChange: (d: any) => void, DISHES: any[] }> = ({ currentDish, onDishChange, DISHES }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedElement = document.getElementById(`dish-${currentDish.id}`);
    if (selectedElement && scrollRef.current) {
      const parent = scrollRef.current;
      const offsetLeft = selectedElement.offsetLeft;
      const parentWidth = parent.offsetWidth;
      const itemWidth = selectedElement.offsetWidth;
      parent.scrollTo({
        left: offsetLeft - (parentWidth / 2) + (itemWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [currentDish]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const parent = scrollRef.current;
    const parentCenter = parent.scrollLeft + parent.offsetWidth / 2;
    let closestDish = DISHES[0];
    let minDistance = Infinity;
    DISHES.forEach((dish) => {
      const element = document.getElementById(`dish-${dish.id}`);
      if (element) {
        const elementCenter = element.offsetLeft + element.offsetWidth / 2;
        const distance = Math.abs(parentCenter - elementCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestDish = dish;
        }
      }
    });
    if (closestDish.id !== currentDish.id) onDishChange(closestDish);
  };

  return (
    <div className="dish-menu-container">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentDish.id}
          className="dish-info-card visible"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <h2>{currentDish.name}</h2>
          <p>4.8 ★ Premium AR View Activated</p>
        </motion.div>
      </AnimatePresence>
      <div className="dish-slider-wrapper" ref={scrollRef} onScroll={handleScroll}>
        {DISHES.map((dish) => (
          <motion.div
            key={dish.id}
            id={`dish-${dish.id}`}
            className={`dish-item ${currentDish.id === dish.id ? 'selected' : ''}`}
            onClick={() => onDishChange(dish)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1.4 }}
          >
            <img src={dish.iconPath} alt={dish.name} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface ARViewProps {
  currentDish: Dish;
  onDishChange: (dish: Dish) => void;
}

const ARView: React.FC<ARViewProps> = ({ currentDish, onDishChange }) => {
  const [isPlaced, setIsPlaced] = useState(false);
  const [placementPosition, setPlacementPosition] = useState("0 0 -2");
  
  const isPlacedRef = useRef(isPlaced);
  const setIsPlacedRef = useRef(setIsPlaced);
  const setPlacementPositionRef = useRef(setPlacementPosition);

  useEffect(() => {
    isPlacedRef.current = isPlaced;
    setIsPlacedRef.current = setIsPlaced;
    setPlacementPositionRef.current = setPlacementPosition;
  }, [isPlaced, placementPosition]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'AFRAME' in window) {
      const AFRAME = (window as any).AFRAME;
      if (!AFRAME.components['tap-to-place']) {
        AFRAME.registerComponent('tap-to-place', {
          init: function () {
            this.el.sceneEl.addEventListener('click', (event: any) => {
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

  // Import for the menu items
  const menuDishes = useRef<any[]>([]);
  useEffect(() => {
    import('../data/dishes').then(m => { menuDishes.current = m.DISHES; });
  }, []);

  return (
    <div className="ar-container">
      <AScene
        embedded="true"
        arjs="sourceType: webcam; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        gesture-detector=""
        renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true;"
        tap-to-place=""
      >
        <AAssets>
          <AAssetItem id="dish-model" src={currentDish.modelPath}></AAssetItem>
        </AAssets>
        <AEntity camera id="camera">
          <AEntity
            cursor="fuse: false; rayOrigin: mouse;"
            position="0 0 -1"
            raycaster="objects: .raycastable, .draggable"
          ></AEntity>
        </AEntity>
        <ALight type="ambient" color="#BBB"></ALight>
        <ALight type="directional" color="#FFF" intensity="0.8" position="-0.5 1 1"></ALight>
        <AEntity
          id="ground"
          className="raycastable"
          geometry="primitive: plane; width: 100; height: 100"
          rotation="-90 0 0"
          position="0 -1.6 0"
          material="opacity: 0; transparent: true"
        ></AEntity>
        <AEntity
          id="placed-dish"
          className="draggable"
          position={placementPosition}
          visible={isPlaced}
          scale="0.5 0.5 0.5"
          gesture-handler="minScale: 0.1; maxScale: 5"
          drag-handler=""
        >
          <AEntity gltf-model="#dish-model" key={currentDish.id}>
            <AEntity 
              geometry="primitive: cylinder; radius: 0.3; height: 0.05" 
              material="color: #444; opacity: 0.3; wireframe: true"
              visible={!isPlaced} 
            ></AEntity>
          </AEntity>
        </AEntity>
        {!isPlaced && (
          <AEntity
            id="reticle"
            geometry="primitive: ring; radiusInner: 0.1; radiusOuter: 0.15"
            material="color: #fffc00; shader: flat"
            rotation="-90 0 0"
            position="0 -1.59 -2"
            animation="property: scale; to: 1.1 1.1 1.1; dir: alternate; dur: 1000; loop: true"
          ></AEntity>
        )}
      </AScene>

      <div className="ar-ui-overlay">
        <div className="top-nav">
          <div className="brand">
            <motion.h1 key={currentDish.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {currentDish.name}
            </motion.h1>
            <span>SNAP UI • AR MENU</span>
          </div>
          <div className="top-icons">
            <div className="icon-btn" onClick={() => window.location.reload()}>⟳</div>
            <div className="icon-btn">⚙</div>
          </div>
        </div>

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

        <DishMenu 
          currentDish={currentDish} 
          onDishChange={onDishChange} 
          DISHES={menuDishes.current.length > 0 ? menuDishes.current : [currentDish]}
        />

        {isPlaced && (
          <div className="interaction-hint">
            <span>👆 DRAG TO MOVE</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>🤏 PINCH TO SCALE</span>
          </div>
        )}
        <div className="capture-overlay"><div className="capture-ring"></div></div>
      </div>
    </div>
  );
};

export default ARView;
