import React, { useRef, useEffect, useState } from 'react';

const ImageViewerHello = () => {
  const [image, setImage] = useState(null);
  const [ImageDimension, setImageDimension] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [boxes, setBoxes] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (image) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, ImageDimension.width, ImageDimension.height);
    }

    ctx.strokeStyle = 'blue';
    const lastBox = boxes[boxes.length - 1];
    if (lastBox) {
      ctx.strokeRect(lastBox.x, lastBox.y, lastBox.width, lastBox.height);
    }
  }, [boxes, ImageDimension, image]);

  useEffect(() => {
    const handleResize = () => {
      setImageDimension({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoom = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.2 : 0.8;
    const newZoomLevel = zoomLevel * zoomFactor;

    if (newZoomLevel >= 1) {
      setZoomLevel(newZoomLevel);
      setImageDimension((prevDimension) => ({
        width: prevDimension.width * zoomFactor,
        height: prevDimension.height * zoomFactor,
      }));
    }
  };

  const handleMouseDown = (e) => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left) * (ImageDimension.width / containerRect.width);
    const y = (e.clientY - containerRect.top) * (ImageDimension.height / containerRect.height);
    setStartPos({ x, y });
    isDrawingRef.current = true;
  };

  const handleMouseMove = (e) => {
    if (isDrawingRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - containerRect.left) * (ImageDimension.width / containerRect.width);
      const y = (e.clientY - containerRect.top) * (ImageDimension.height / containerRect.height);
      const width = x - startPos.x;
      const height = y - startPos.y;
      const box = {
        x: width < 0 ? startPos.x + width : startPos.x,
        y: height < 0 ? startPos.y + height : startPos.y,
        width: Math.abs(width),
        height: Math.abs(height),
      };
      const adjustedBox = {
        x: box.x / (ImageDimension.width / containerRect.width),
        y: box.y / (ImageDimension.height / containerRect.height),
        width: box.width / (ImageDimension.width / containerRect.width),
        height: box.height / (ImageDimension.height / containerRect.height),
      };
      setBoxes([adjustedBox]);
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  useEffect(() => {
    const imageObj = new Image();
    imageObj.onload = () => {
      setImage(imageObj);
    };
    imageObj.src = 'https://upload.wikimedia.org/wikipedia/commons/4/41/Sunflower_from_Silesia2.jpg';
  }, []);

  const getDistanceFromSides = (box) => {
    const distanceFromLeft = box.x;
    const distanceFromTop = box.y;
    const distanceFromRight = ImageDimension.width - (box.x + box.width);
    const distanceFromBottom = ImageDimension.height - (box.y + box.height);

    return {
      left: distanceFromLeft,
      top: distanceFromTop,
      right: distanceFromRight,
      bottom: distanceFromBottom,
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        width: '50vw',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
      onWheel={handleZoom}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        width={ImageDimension.width}
        height={ImageDimension.height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      ></canvas>
      {image && (
        <img
          src={image.src}
          alt="Image"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            display:'none'
          }}
        />
      )}
      {boxes.length > 0 && (
        <div style = {{position : 'relative', display: 'flex', justifyContent: 'center', right:'20%', backgroundColor:'white'}}>
          <p >Distance from
           sides:</p>
          <ul>
            <li>Left: {getDistanceFromSides(boxes[0]).left}px</li>
            <li>Top: {getDistanceFromSides(boxes[0]).top}px</li>
            <li>Right: {getDistanceFromSides(boxes[0]).right}px</li>
            <li>Bottom: {getDistanceFromSides(boxes[0]).bottom}px</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageViewerHello;