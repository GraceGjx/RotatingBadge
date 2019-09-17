/**
* MP1: Victory Badge 
* Jiaxuan Guo
*/

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas to draw on */
var canvas;

/** @global A GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangles */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The Modelview matrix */
var mvMatrix = mat4.create();

/** @global The Projection matrix */
var pMatrix = mat4.create();

/**@global the angle of rotation around the x axis */
var rotAngle = 0;

/**@global time stamp for the last frame */
var lastTime = 0;

/**@global a glmatrix vector to use for transformation */
var transformVec = vec3.create();

//Initialize the vector
vec3.set(transformVec, 0.0, 0.0, -5.0);

/**
 * Set up the matrix
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}


/**
 * Convert degree to radian
 * @param {element} degree the number measure in degree
 * @return {element} the number in radian
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var i=0; i < names.length; i++) {
        try {
            context = canvas.getContext(names[i]);
        } catch(e) {}
        if (context) {
            break;
        }
    }
    if (context) {
        context.viewportWidth = canvas.width;
        context.viewportHeight = canvas.height;
    } else {
        alert("Failed to create WebGL context!");
    }
    return context;
}


/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
    var shaderScript = document.getElementById(id);
  
    // Can't find an element with the specified id, return null
    if (!shaderScript) {
        return null;
    }
  
    //Found the DOM element from the children and build up the shader as a string 
    var shaderSource = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
        if (currentChild.nodeType == 3) { 
            shaderSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }
 
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
 
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
 
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    } 
    return shader;
}


/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
    vertexShader = loadShaderFromDOM("shader-vs");
    fragmentShader = loadShaderFromDOM("shader-fs");
  
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Failed to setup shaders");
    }

    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
}


/**
 * Populate vertex buffer with data
  @param {number} number of vertices to use around the circle boundary
 */
function loadVertices() {   
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    // Hold actually vertex
    var triangleVertices = [];
    
    // The basic vertex for the badge  
    var defaultVertices = [
        //top bar
        -0.58, 0.8, 0.0, 
        -0.58, 0.6, 0.0,
        0.0, 0.8, 0.0,
        0.0, 0.8, 0.0,
        0.0, 0.6, 0.0,
        -0.58, 0.6, 0.0,
        0.0, 0.8, 0.0,
        0.0, 0.6, 0.0,
        0.58, 0.6, 0.0,
        0.0, 0.8, 0.0,
        0.58, 0.8, 0.0,
        0.58, 0.6, 0.0,
      
        //Left top part
        -0.47, 0.6, 0.0,
        -0.23, 0.6, 0.0,
        -0.47, 0.43, 0.0,
        -0.23, 0.6, 0.0,
        -0.23, 0.43, 0.0,
        -0.47, 0.43, 0.0,
      
        //Left Middle part
        -0.47, 0.43, 0.0,
        -0.47, 0.1, 0.0,
        -0.13, 0.1, 0.0,
        -0.13, 0.1, 0.0,
        -0.13, 0.43, 0.0,
        -0.47, 0.43, 0.0,
      
        //Left blue bot part
        -0.47, 0.1, 0.0,
        -0.23, 0.1, 0.0,
        -0.47, -0.07, 0.0,
        -0.23, 0.1, 0.0,
        -0.23, -0.07, 0.0,
        -0.47, -0.07, 0.0,
      
        //right
        0.47, 0.6, 0.0,
        0.23, 0.6, 0.0,
        0.47, 0.43, 0.0,
        0.23, 0.6, 0.0,
        0.23, 0.43, 0.0,
        0.47, 0.43, 0.0,
      
        0.47, 0.43, 0.0,
        0.47, 0.1, 0.0,
        0.13, 0.1, 0.0,
        0.13, 0.1, 0.0,
        0.13, 0.43, 0.0,
        0.47, 0.43, 0.0, 
      
        0.47, 0.1, 0.0,
        0.23, 0.1, 0.0,
        0.47, -0.07, 0.0,
        0.23, 0.1, 0.0,
        0.23, -0.07, 0.0,
        0.47, -0.07, 0.0,
         
        //Orange left part
        -0.47, -0.1, 0.0,
        -0.38, -0.1, 0.0,
        -0.47, -0.18, 0.0,
        -0.47, -0.18, 0.0,
        -0.38, -0.1, 0.0,
        -0.38, -0.25, 0.0,
      
        -0.31, -0.1, 0.0,
        -0.31, -0.29, 0.0,
        -0.23, -0.1, 0.0,
        -0.31, -0.29, 0.0,
        -0.23, -0.34, 0.0,
        -0.23, -0.1, 0.0,
      
        -0.14, -0.1, 0.0,
        -0.14, -0.38, 0.0,
        -0.05, -0.1, 0.0,
        -0.05, -0.1, 0.0,
        -0.14, -0.38, 0.0,
        -0.05, -0.44, 0.0,
      
        //orange right
        0.47, -0.1, 0.0,
        0.38, -0.1, 0.0,
        0.47, -0.18, 0.0,
        0.47, -0.18, 0.0,
        0.38, -0.1, 0.0,
        0.38, -0.25, 0.0,
      
        0.31, -0.1, 0.0,
        0.31, -0.29, 0.0,
        0.23, -0.1, 0.0,
        0.31, -0.29, 0.0,
        0.23, -0.34, 0.0,
        0.23, -0.1, 0.0,
      
        0.14, -0.1, 0.0,
        0.14, -0.38, 0.0,
        0.05, -0.1, 0.0,
        0.05, -0.1, 0.0,
        0.14, -0.38, 0.0,
        0.05, -0.44, 0.0
    ];
  
    // Use sin curve to push vertex into the vertex array
    for(i=0; i < 84*3; i+=3){
        x = defaultVertices[i];
        y = defaultVertices[i+1];

        triangleVertices.push(x+deformSin(x, y)[0]);
        triangleVertices.push(y+deformSin(x, y)[1]);
        triangleVertices.push(defaultVertices[i+2]);
    }

    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = 84;
}


/**
 * Populate color buffer with data
  @param {number} number of vertices to use around the circle boundary
 */
function loadColors() {
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    
    // Set the color of the badge  
    var colors = [
        0.007255,0.137255,0.356863,1.0, //for blue
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0, 
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0,
        0.007255,0.137255,0.356863,1.0, 
        0.007255,0.137255,0.356863,1.0,
      
        0.9, 0.295, 0.0, 1.0,//For Orange
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0,
        0.9, 0.295, 0.0, 1.0
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 4;
    vertexColorBuffer.numItems = 78;  
}


/**
 * Populate buffers with data
   @param {number} number of vertices to use around the circle boundary
 */
function setupBuffers() {
    
    //Generate the vertex positions    
    loadVertices();

    //Generate the vertex colors
    loadColors();
}


/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
    
    mat4.identity(mvMatrix);
    mat4.identity(pMatrix);
    
    //Affline Transformation for rotation around Y
    mat4.perspective(pMatrix, degToRad(90), 1, 0.1, 50.0);
    vec3.set(transformVec, 0.0, 0.0, -1);
    mat4.translate(mvMatrix, mvMatrix, transformVec);
    mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle));

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES,0,vertexPositionBuffer.numberOfItems);
}


/**
 * For animation and change the buffer
 */
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        rotAngle = (rotAngle + 1.0) % 360;
    }
    lastTime = timeNow;
    setupBuffers();
}


/**
 * Startup function called from html code to start program.
 */
function startup() {
    canvas = document.getElementById("myGLCanvas");
    gl = createGLContext(canvas);
    setupShaders(); 
    setupBuffers();
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    tick();
}


/**
 * To calculate the deform point
 */
function deformSin(x, y){
    var circPt = vec2.fromValues(x,y);
    var dist = 0.18 * Math.sin(degToRad(rotAngle));
    vec2.normalize(circPt, circPt);
    vec2.scale(circPt, circPt, dist);
    return circPt;
}


/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}

