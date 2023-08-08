import React, { useRef, useEffect, useState } from 'react';

const ImageViewerThird = () => {
  const [image, setImage] = useState(null);
  const [ImageDimension, setImageDimension] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (image) {
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
    setImageDimension((prevDimension) => ({
      width: prevDimension.width * zoomFactor,
      height: prevDimension.height * zoomFactor,
    }));
  };

  const handleMouseDown = (e) => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    setStartPos({ x, y });
    isDrawingRef.current = true;
  };

  const handleMouseMove = (e) => {
    if (isDrawingRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const zoomLevel = ImageDimension.width / containerRect.width;
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      const width = x - startPos.x;
      const height = y - startPos.y;
      const box = {
        x: width < 0 ? startPos.x + width : startPos.x,
        y: height < 0 ? startPos.y + height : startPos.y,
        width: Math.abs(width),
        height: Math.abs(height),
      };
      const adjustedBox = {
        x: box.x / zoomLevel,
        y: box.y / zoomLevel,
        width: box.width / zoomLevel,
        height: box.height / zoomLevel,
      };
      setBoxes([box]);
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

  return (
    <div
      ref={containerRef}
      style={{
        backgroundRepeat: 'no-repeat',
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
          }}
        />
      )}
      {boxes.length > 0 && (
        <p style = {{position : 'relative', display: 'flex', justifyContent: 'center', right:'20%', backgroundColor:'white'}}>
          Width: {boxes[0].width}, Height: {boxes[0].height}
        </p>
      )}
    </div>
  );
};

export default ImageViewerThird;