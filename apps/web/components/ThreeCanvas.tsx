'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e17);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Grid wireframe ground for spatial orientation
    const grid = new THREE.GridHelper(10, 20, 0x6366f1, 0x262a3f);
    grid.position.y = -1;
    scene.add(grid);

    // Glowing camera frustum / target cube
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(2, 4, 3);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambient);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.008;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-[#262a3f]">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-[#12141c]/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#262a3f] text-xs font-mono text-indigo-300">
        3D Spatial Camera Viewport (Three.js)
      </div>
    </div>
  );
}
