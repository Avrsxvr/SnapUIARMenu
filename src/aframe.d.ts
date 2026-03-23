/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-entity': any;
      'a-light': any;
      'a-camera': any;
      'a-box': any;
      'a-sphere': any;
      'a-cylinder': any;
      'a-plane': any;
      'a-sky': any;
      'a-text': any;
      'a-image': any;
      'a-video': any;
      'a-cursor': any;
      'a-ring': any;
    }
  }
}

// Support for A-Frame components on standard entities
declare module 'react' {
  interface HTMLAttributes<T> extends React.AriaAttributes, React.DOMAttributes<T> {
    arjs?: string;
    'gesture-detector'?: string;
    'tap-to-place'?: string;
    'vr-mode-ui'?: string;
    renderer?: string;
    embedded?: string | boolean;
    'gesture-handler'?: string;
    'drag-handler'?: string;
    'gltf-model'?: string;
    rotation?: string;
    scale?: string;
    visible?: boolean;
    geometry?: string;
    material?: string;
    animation?: string;
    cursor?: string;
    raycaster?: string;
  }
}

export {};
