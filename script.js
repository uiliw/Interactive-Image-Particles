/* -----------------------------------------------
/* Author : Ossama Rafique
/* Email: contact@ossamarafique.com
/* Website: https://www.ossamarafique.com
/* MIT license: http://opensource.org/licenses/MIT
/* GitHub : https://github.com/OssamaRafique/Interactive-Image-Particles
/* v1.0
/* ----------------------------------------------- */
var ImageParticles = {

    //You can change the settings here. Like density,thickness, sensivity.
    density: 14,

    produceDistance: 28,
    baseRadius: 2,
    maxLineThickness: 1,
    reactionSensitivity: 2,
    lineThickness: 1,

    particles: [],
    mouse: {
        x: -1000,
        y: -1000,
        down: false
    },

    animation: null,

    canvas: null,
    context: null,
    bgImage: null,
    bgCanvas: null,
    bgContext: null,
    bgContextPixelData: null,

    initialize: function(canvas_id, imageData) {
        // Set up the visual canvas 
        this.canvas = document.getElementById(canvas_id);
        this.context = canvas.getContext('2d');
        this.context.globalCompositeOperation = "lighter";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.display = 'block'
        this.canvas.addEventListener('mousemove', this.pointerMove, false);
        this.canvas.addEventListener('mousedown', this.pointerDown, false);
        this.canvas.addEventListener('mouseup', this.pointerUp, false);
        this.canvas.addEventListener('mouseout', this.pointerOut, false);

        window.onresize = function(event) {
            ImageParticles.canvas.width = window.innerWidth;
            ImageParticles.canvas.height = window.innerHeight;
            ImageParticles.onWindowResize();
        }

        // Load initial input image
        this.getImageData(imageData);
    },

    makeParticles: function() {

        // remove the current particles
        this.particles = [];

        var width, height, i, j;

        var colors = this.bgContextPixelData.data;

        for (i = 0; i < this.canvas.height; i += this.density) {

            for (j = 0; j < this.canvas.width; j += this.density) {

                var pixelPosition = (j + i * this.bgContextPixelData.width) * 4;

                // Dont use whiteish pixels
                if (colors[pixelPosition] > 200 && (colors[pixelPosition + 1]) > 200 && (colors[pixelPosition + 2]) > 200 || colors[pixelPosition + 3] === 0) {
                    continue;
                }

                var color = 'rgba(' + colors[pixelPosition] + ',' + colors[pixelPosition + 1] + ',' + colors[pixelPosition + 2] + ',' + '1)';
                this.particles.push({
                    x: j,
                    y: i,
                    originalX: j,
                    originalY: i,
                    color: color
                });

            }
        }
    },

    updateparticles: function() {

        var i, currentPoint, theta, distance;

        for (i = 0; i < this.particles.length; i++) {

            currentPoint = this.particles[i];

            theta = Math.atan2(currentPoint.y - this.mouse.y, currentPoint.x - this.mouse.x);

            if (this.mouse.down) {
                distance = this.reactionSensitivity * 200 / Math.sqrt((this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
                    (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y));
            } else {
                distance = this.reactionSensitivity * 100 / Math.sqrt((this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
                    (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y));
            }


            currentPoint.x += Math.cos(theta) * distance + (currentPoint.originalX - currentPoint.x) * 0.05;
            currentPoint.y += Math.sin(theta) * distance + (currentPoint.originalY - currentPoint.y) * 0.05;

        }
    },

    produceLines: function() {

        var i, j, currentPoint, otherPoint, distance, lineThickness;

        for (i = 0; i < this.particles.length; i++) {

            currentPoint = this.particles[i];

            // produce the dot.
            this.context.fillStyle = currentPoint.color;
            this.context.strokeStyle = currentPoint.color;

            for (j = 0; j < this.particles.length; j++) {

                // Distaqnce between two particles.
                otherPoint = this.particles[j];

                if (otherPoint == currentPoint) {
                    continue;
                }

                distance = Math.sqrt((otherPoint.x - currentPoint.x) * (otherPoint.x - currentPoint.x) +
                    (otherPoint.y - currentPoint.y) * (otherPoint.y - currentPoint.y));

                if (distance <= this.produceDistance) {

                    this.context.lineWidth = (1 - (distance / this.produceDistance)) * this.maxLineThickness * this.lineThickness;
                    this.context.beginPath();
                    this.context.moveTo(currentPoint.x, currentPoint.y);
                    this.context.lineTo(otherPoint.x, otherPoint.y);
                    this.context.stroke();
                }
            }
        }
    },

    produceparticles: function() {

        var i, currentPoint;

        for (i = 0; i < this.particles.length; i++) {

            currentPoint = this.particles[i];

            // produce the dot.
            this.context.fillStyle = currentPoint.color;
            this.context.strokeStyle = currentPoint.color;

            this.context.beginPath();
            this.context.arc(currentPoint.x, currentPoint.y, this.baseRadius, 0, Math.PI * 2, true);
            this.context.closePath();
            this.context.fill();

        }
    },

    produce: function() {
        this.animation = requestAnimationFrame(function() {
            ImageParticles.produce()
        });

        this.remove();
        this.updateparticles();
        this.produceLines();
        this.produceparticles();

    },

    remove: function() {
        this.canvas.width = this.canvas.width;
    },

    // The filereader has loaded the image... add it to image object to be producen
    getImageData: function(data) {

        this.bgImage = new Image;
        this.bgImage.src = data;

        this.bgImage.onload = function() {

            //this
            ImageParticles.produceImageParticles();
        }
    },

    // Image is loaded... produce to bg canvas
    produceImageParticles: function() {

        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.canvas.width;
        this.bgCanvas.height = this.canvas.height;

        var newWidth, newHeight;

        // If the image is too big for the screen... scale it down.
        if (this.bgImage.width > this.bgCanvas.width - 100 || this.bgImage.height > this.bgCanvas.height - 100) {

            var maxRatio = Math.max(this.bgImage.width / (this.bgCanvas.width - 100), this.bgImage.height / (this.bgCanvas.height - 100));
            newWidth = this.bgImage.width / maxRatio;
            newHeight = this.bgImage.height / maxRatio;

        } else {
            newWidth = this.bgImage.width;
            newHeight = this.bgImage.height;
        }

        // produce to background canvas
        this.bgContext = this.bgCanvas.getContext('2d');
        this.bgContext.drawImage(this.bgImage, (this.canvas.width - newWidth) / 2, (this.canvas.height - newHeight) / 2, newWidth, newHeight);
        this.bgContextPixelData = this.bgContext.getImageData(0, 0, this.bgCanvas.width, this.bgCanvas.height);

        this.makeParticles();
        this.produce();
    },

    pointerDown: function(event) {
        ImageParticles.mouse.down = true;
    },

    pointerUp: function(event) {
        ImageParticles.mouse.down = false;
    },

    pointerMove: function(event) {
        ImageParticles.mouse.x = event.offsetX || (event.layerX - ImageParticles.canvas.offsetLeft);
        ImageParticles.mouse.y = event.offsetY || (event.layerY - ImageParticles.canvas.offsetTop);
    },

    pointerOut: function(event) {
        ImageParticles.mouse.x = -1000;
        ImageParticles.mouse.y = -1000;
        ImageParticles.mouse.down = false;
    },

    // Resize and reproduce the canvas.
    onWindowResize: function() {
        cancelAnimationFrame(this.animation);
        this.produceImageParticles();
    }
}
//Initialize the Particles (First Parameter is Canvas id and second parameter is image data)
ImageParticles.initialize('canvas', 'data:image/png;base64,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');
