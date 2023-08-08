import React, { useRef, useEffect, useState } from 'react';

const ImageViewer = () => {
    const [ImageDimension, setImageDimension] = useState({ width:0 , height:0});
    const [boxes, setBoxes] = useState([]);
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const isDrawingRef = useRef(false);
    const [startPos, setStartPos] = useState({x:0 , y:0});

    useEffect(() => {
      const handleResize = () => {
        setImageDimension({
            width: imageRef.current.width,
            height: imageRef.current.height,
        });
      };

      handleResize();
      window.addEventListener('resize', handleResize);
    
      return () => window.removeEventListener('resize', handleResize); 
     }, []);

     useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(imageRef.current,0,0,ImageDimension.width, ImageDimension.height);

        ctx.strokeStyle = "blue";
        boxes.forEach((box) => {
            ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
     }, [boxes, ImageDimension]);

     const handleZoom = (e) => {
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
        setStartPos({x,y});
        isDrawingRef.current = true;
     };

     const handleMouseMove = (e) => {
        if (isDrawingRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - containerRect.left;
            const y = e.clientY - containerRect.top;
            const width = x - startPos.x;
            const height = y - startPos.y;

            setBoxes((prevBoxes) => [...prevBoxes, {x: startPos.x, y: startPos.y, width, height}]);
            
        }
     };

     const handleMouseUp = () => {
        isDrawingRef.current = false;
     };

     return (
        <div
            ref = {containerRef}
            style = {{
                height: '100vh',
                width: '100vw',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
            }}

            onWheel = {handleZoom}
            onMouseDown = {handleMouseDown}
            onMouseMove = {handleMouseMove}
            onMouseUp = {handleMouseUp}
            >
            <canvas ref={canvasRef} width={ImageDimension.width} height={ImageDimension.height}></canvas> 
            <img ref={imageRef} src='https://upload.wikimedia.org/wikipedia/commons/4/41/Sunflower_from_Silesia2.jpg' alt='age' style={{
                maxWidth: '100%',
                maxHeight: '100%',
            }} 
            />  
        </div>
        
     );

    
};

export default ImageViewer;