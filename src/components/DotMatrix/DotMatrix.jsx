"use client";
import "./DotMatrix.css";
import React, { useMemo, useRef, useEffect, useState } from "react";

import { DottedShader } from "./shaders";

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [97, 218, 251];
};

const DotMatrix = ({
  color = "#61dafb",
  delay = 0,
  speed = 0.01,
  dotSize = 2,
  spacing = 5,
  opacity = 0.85,
  fixed = false,
}) => {
  const rgbColor = useMemo(() => hexToRgb(color), [color]);
  
  // Два слоя для crossfade анимации
  const [layers, setLayers] = useState({
    current: { color: rgbColor, opacity: 1 },
    previous: { color: rgbColor, opacity: 0 },
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const prevColorRef = useRef(color);

  // Crossfade при смене цвета
  useEffect(() => {
    if (prevColorRef.current === color) return;
    
    const newRgb = hexToRgb(color);
    const oldRgb = hexToRgb(prevColorRef.current);
    
    // Начинаем анимацию - старый цвет виден, новый появляется
    setLayers({
      previous: { color: oldRgb, opacity: 1 },
      current: { color: newRgb, opacity: 0 },
    });
    setIsAnimating(true);
    
    // Через небольшую задержку запускаем fade
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLayers({
          previous: { color: oldRgb, opacity: 0 },
          current: { color: newRgb, opacity: 1 },
        });
      });
    });
    
    // Завершаем анимацию
    const timer = setTimeout(() => {
      setIsAnimating(false);
      prevColorRef.current = color;
    }, 600);
    
    return () => clearTimeout(timer);
  }, [color]);

  const shaderCode = useMemo(() => {
    const glslDelay = Number(delay).toFixed(2);
    const glslSpeed = Number(speed).toFixed(2);

    return `
      float intro_offset = distance(u_resolution / 2.0 / u_total_size, st2) * ${glslSpeed} + (random(st2) * 0.15);
      opacity *= step(intro_offset, u_time - ${glslDelay});
      opacity *= clamp((1.0 - step(intro_offset + 0.1, u_time - ${glslDelay})) * 1.25, 1.0, 1.25);
    `;
  }, [delay, speed]);

  const opacityLayers = useMemo(
    () => [
      opacity * 0.4,
      opacity * 0.4,
      opacity * 0.65,
      opacity * 0.65,
      opacity * 0.95,
      opacity,
    ],
    [opacity]
  );

  return (
    <div className={`dot-matrix-wrapper ${fixed ? 'fixed' : ''}`}>
      {/* Предыдущий слой (fade out) */}
      <div 
        className="dot-matrix-layer"
        style={{ 
          opacity: layers.previous.opacity,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        <DottedShader
          opacities={opacityLayers}
          colors={[layers.previous.color]}
          totalSize={spacing}
          dotSize={dotSize}
          center={["x"]}
          shader={shaderCode}
        />
      </div>
      
      {/* Текущий слой (fade in) */}
      <div 
        className="dot-matrix-layer"
        style={{ 
          opacity: layers.current.opacity,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        <DottedShader
          opacities={opacityLayers}
          colors={[layers.current.color]}
          totalSize={spacing}
          dotSize={dotSize}
          center={["x"]}
          shader={shaderCode}
        />
      </div>
    </div>
  );
};

export default DotMatrix;
