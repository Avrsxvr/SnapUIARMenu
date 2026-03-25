/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import * as FramerMotion from 'framer-motion';
import { type Dish } from '../data/dishes';

const { motion, AnimatePresence } = FramerMotion;

// Failsafe mappings to bypass JSX type limitations
const AScene = 'a-scene' as any;
const AAssets = 'a-assets' as any;
const AAssetItem = 'a-asset-item' as any;
const AEntity = 'a-entity' as any;
const ALight = 'a-light' as any;

/**
 * DishMenu Component - Refactored for absolute build stability
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
          <p>4.8 ★ Real-World Plane Detection Active</p>
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

      // Tap-to-Place using real hit-test point
      if (!AFRAME.components['hit-place']) {
        AFRAME.registerComponent('hit-place', {
          init: function () {
            this.el.addEventListener('click', (event: any) => {
              if (event.target.closest('.ar-ui-overlay')) return;
              
              if (!isPlacedRef.current) {
                const reticle = document.querySelector('#reticle');
                if (reticle) {
                  const position = (reticle as any).getAttribute('position');
                  if (position) {
                    setPlacementPositionRef.current(`${position.x} ${position.y} ${position.z}`);
                    setIsPlacedRef.current(true);
                  }
                }
              }
            });
          }
        });
      }
    }
  }, []);

  const menuDishes = useRef<any[]>([]);
  useEffect(() => {
    import('../data/dishes').then(m => { menuDishes.current = m.DISHES; });
  }, []);

  return (
    <div className="ar-container">
      <AScene
        embedded="true"
        arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"
        vr-mode-ui="enabled: false"
        gesture-detector=""
        renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true;"
        ar-hit-test="target: #reticle; fraction: 0.1;"
        hit-place=""
      >
        <AAssets>
          <AAssetItem id="dish-model" src={currentDish.modelPath}></AAssetItem>
        </AAssets>

        <AEntity camera id="camera" position="0 1.6 0">
          <AEntity
            cursor="fuse: false; rayOrigin: mouse;"
            position="0 0 -1"
            raycaster="objects: .raycastable, .draggable"
          ></AEntity>
        </AEntity>

        <ALight type="ambient" color="#BBB"></ALight>
        <ALight type="directional" color="#FFF" intensity="0.8" position="-0.5 1 1"></ALight>

        {/* 
            RETICLE (Surface Detection Guide)
            Moved automatically by the ar-hit-test component 
        */}
        <AEntity
          id="reticle"
          geometry="primitive: ring; radiusInner: 0.12; radiusOuter: 0.2"
          material="color: #fffc00; shader: flat; opacity: 0.8"
          rotation="-90 0 0"
          visible={!isPlaced}
        >
          <AEntity
            geometry="primitive: circle; radius: 0.03"
            material="color: #fffc00; shader: flat"
          ></AEntity>
        </AEntity>

        {/* PLACED MODEL */}
        <AEntity
          id="placed-dish"
          className="draggable"
          position={placementPosition}
          visible={isPlaced}
          scale="0.8 0.8 0.8"
          gesture-handler="minScale: 0.2; maxScale: 10"
          drag-handler=""
        >
          <AEntity
            gltf-model="#dish-model"
            key={currentDish.id}
          >
            {/* Soft Shadow Base */}
            <AEntity 
              geometry="primitive: cylinder; radius: 0.4; height: 0.01" 
              material="color: #000; opacity: 0.2"
              position="0 -0.01 0"
            ></AEntity>
          </AEntity>
        </AEntity>

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
              <div className="scan-text">SEARCHING SURFACE...</div>
              <p>MOVE CAMERA AROUND THE TABLE</p>
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
