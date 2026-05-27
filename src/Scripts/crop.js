window.addEventListener('DOMContentLoaded', () => {
     let crop = { x: 0, y: 0, w: 0, h: 0 };
     let drawing = false;
     let screenshotImg = new window.Image();
     const bgcanvas = document.getElementById('bgcanvas');
     const overlay = document.getElementById('overlay');

     const loading = document.getElementById('loading');

     window.cropApi.onScreenshot(dataUrl => {
          screenshotImg.onload = () => {
               bgcanvas.width = overlay.width = screenshotImg.width;
               bgcanvas.height = overlay.height = screenshotImg.height;
               bgcanvas.getContext('2d').drawImage(screenshotImg, 0, 0);
               drawOverlay();
               loading.style.display = 'none';
               bgcanvas.style.visibility = 'visible';
               overlay.style.visibility = 'visible';
          };
          screenshotImg.src = dataUrl;
     });

     overlay.onmousedown = e => {
          drawing = true;
          crop.x = e.offsetX;
          crop.y = e.offsetY;
          crop.w = 0;
          crop.h = 0;
          drawOverlay();
     };

     overlay.onmousemove = e => {
          if (!drawing) return;
          crop.w = e.offsetX - crop.x;
          crop.h = e.offsetY - crop.y;
          drawOverlay();
     };

     overlay.onmouseup = e => {
          if (!drawing) return;
          drawing = false;
          crop.w = e.offsetX - crop.x;
          crop.h = e.offsetY - crop.y;
          drawOverlay();
          if (Math.abs(crop.w) >= 10 && Math.abs(crop.h) >= 10) {
               doCropAndSend();
          }
     };

     function drawOverlay() {
          const ctx = overlay.getContext('2d');
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(0, 0, overlay.width, overlay.height);
          if (crop.w !== 0 && crop.h !== 0) {
               ctx.clearRect(
                    Math.min(crop.x, crop.x + crop.w),
                    Math.min(crop.y, crop.y + crop.h),
                    Math.abs(crop.w),
                    Math.abs(crop.h)
               );
               ctx.strokeStyle = '#8f8f8fff';
               ctx.lineWidth = 2;
               ctx.strokeRect(
                    Math.min(crop.x, crop.x + crop.w),
                    Math.min(crop.y, crop.y + crop.h),
                    Math.abs(crop.w),
                    Math.abs(crop.h)
               );
          }
     }

     function doCropAndSend() {
          const x = Math.min(crop.x, crop.x + crop.w);
          const y = Math.min(crop.y, crop.y + crop.h);
          const width = Math.abs(crop.w);
          const height = Math.abs(crop.h);
          if (width < 2 || height < 2) return;
          const ctx = bgcanvas.getContext('2d');
          const imageData = ctx.getImageData(x, y, width, height);
          const cropper = document.createElement('canvas');
          cropper.width = width;
          cropper.height = height;
          cropper.getContext('2d').putImageData(imageData, 0, 0);
          const croppedUrl = cropper.toDataURL();
          window.cropApi.finishCrop(croppedUrl);
     }
});