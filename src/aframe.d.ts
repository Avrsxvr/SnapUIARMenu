/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react';

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

export {};
