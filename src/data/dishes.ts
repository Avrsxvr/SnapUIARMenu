export interface Dish {
  id: string;
  name: string;
  modelPath: string;
  iconPath: string;
}

export const DISHES: Dish[] = [
  {
    id: 'sushi',
    name: 'Gourmet Sushi Platter',
    modelPath: '/assets/models/sushi.glb',
    iconPath: '/assets/icons/sushi.png'
  },
  {
    id: 'pasta',
    name: 'Classic Pasta Bolognese',
    modelPath: '/assets/models/pasta.glb',
    iconPath: '/assets/icons/pasta.png'
  },
  {
    id: 'cake',
    name: 'Chocolate Lava Cake',
    modelPath: '/assets/models/cake.glb',
    iconPath: '/assets/icons/cake.png'
  }
];
