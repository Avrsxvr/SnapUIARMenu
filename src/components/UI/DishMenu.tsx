import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DISHES, type Dish } from '../../data/dishes';

interface DishMenuProps {
  currentDish: Dish;
  onDishChange: (dish: Dish) => void;
}

const DishMenu: React.FC<DishMenuProps> = ({ currentDish, onDishChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Center the selected dish
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

    DISHES.forEach((dish: Dish) => {
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

    if (closestDish.id !== currentDish.id) {
      onDishChange(closestDish);
    }
  };

  return (
    <div className="dish-menu-container">
      {/* PROFESSIONAL INFO CARD */}
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
          <p>4.8 ★ View ingredients and calories in AR</p>
        </motion.div>
      </AnimatePresence>
      
      <div 
        className="dish-slider-wrapper" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {DISHES.map((dish: Dish) => (
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

export default DishMenu;
