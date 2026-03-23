import { useState } from 'react'
import ARView from './components/ARView'
import { DISHES, type Dish } from './data/dishes'
import './App.css'

function App() {
  const [currentDish, setCurrentDish] = useState<Dish>(DISHES[0])

  return (
    <div className="app-wrapper">
      {/* 
        Single Source of Truth: All UI and AR components are now 
        consolidated within ARView to ensure perfect z-index layering 
        on mobile devices.
      */}
      <ARView 
        currentDish={currentDish} 
        onDishChange={(dish) => setCurrentDish(dish)}
      />
    </div>
  )
}

export default App
