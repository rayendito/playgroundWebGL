"use strict";

function main(){
    //canvas and gl making, also check kalo web kompatibel sama webgl apangga
    const canvas = document.querySelector("#glCanvas");

    //resizing canvas to window
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Browser mnh tida support WebGL ;(");
        return;
    }

    //PROGRAM-SECTION
    //shaders text source from GLSL
    const vertexSource = document.querySelector("#vertex-shader").text;
    const fragmentSource = document.querySelector("#fragment-shader").text;
    
    //bikin shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    //bikin program pake shaders itu tadi -- buat meng "supply" data cenah
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    //cari tempat where the attributes and uniforms and varyings at at
    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    const matrixUniformLocation = gl.getUniformLocation(program, "matriks");

    // TO-BE-DRAWN-PROPERTIES //
    // SHAPE
    // [1] bikin buffer
    var positionBuffer = gl.createBuffer();
    // [2] positionBuffer di-bind ke gl pake bindBuffer
    // notice gl.ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // INITIALIZING A SHAPE (now pake yang fungsi setGeometry yg udah dibuat)
    var guambar = 1; //initial mode
    if(guambar == 0){
        setGeometry(gl);
    }
    else{
        setHollow(gl);
    }

    // COLOR
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // SET COLORS
    const colorMat = [
        [47, 79, 79],
        [125, 187, 122],
        [122, 164, 187]
    ]
    setColors(gl, colorMat, guambar);


    // TRANSFORMATION-PROPERTIES
    // utility functions
    function radToDeg(r){
        return r*180/Math.PI;
    }

    function degToRad(d){
        return d*Math.PI/180;
    }

    // Transformations
    const translation = [canvas.width/2, canvas.height/2, 0];
    const rotation = [degToRad(25), degToRad(25), degToRad(0)];
    const scale = [6, 6, 6];
    
    // drawing the initial cube

    // cull face to draw only front facing triangles
    gl.enable(gl.CULL_FACE);

    // for a simple cube, ion think depth test needs to be enabled but lets just do
    gl.enable(gl.DEPTH_TEST);

    drawCube(positionBuffer, colorBuffer);

    // markicob mouse events hihi :D
    // variables
    var drag = false;
    var oldx;
    var oldy;

    // mencet
    var mouseDown = function(e){
        drag = true;
        oldx = e.pageX;
        oldy = e.pageY;
        e.preventDefault();
        return false;
    }
    // let go
    var mouseUp = function(e){
        drag = false;
    }

    // kalo geser
    var mouseMove = function(e){
        if(!drag) return false;
        var dX = degToRad((e.pageX-oldx)*360/canvas.width);
        var dY = degToRad((e.pageY-oldy)*360/canvas.height);

        // x rotation on dY
        // far from perfect but hey, it rotates wkwk
        rotation[0] = rotation[0] + (dY/60);
        rotation[1] = rotation[1] - (dX/60);
        drawCube(positionBuffer, colorBuffer);
    }

    //event listeners for the buttons
    const cube = document.getElementById("cubeBtn");
    cube.addEventListener("click", function(e){
        guambar = 0; //0 kubus tok

        gl.deleteBuffer(positionBuffer);
        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        setGeometry(gl);

        gl.deleteBuffer(colorBuffer);
        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        setColors(gl, colorMat, guambar);
        drawCube(positionBuffer, colorBuffer);
    });

    const holCube = document.getElementById("hollowCubeBtn");
    holCube.addEventListener("click", function(e){
        guambar = 1; //0 kubus holoew
        
        gl.deleteBuffer(positionBuffer);
        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        setHollow(gl);

        gl.deleteBuffer(colorBuffer);
        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        setColors(gl, colorMat, guambar);
        drawCube(positionBuffer, colorBuffer);
    });

    // event listeners for the shape
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    // draw cube function
    function drawCube(posBuf, colBuf){
        //CANVAS-PROPERTIES
        // viewport tuh kek mana yg bakal keliatan akhirnya, not necessarily seukuran canvas
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // warna canvasnya
        gl.clearColor(0, 0, 0, 0);
        // actually ngewarnain
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // use shader program
        gl.useProgram(program);

        // GETTING THE DATA OWT OF NDE BUFFER
        // POSITION
        // note that ini maksudnya gl : *enables vertex atrtib array* that is positionAttributeLocation,
        // yang udah disediain tadi
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind the position buffer.
        // HAHA TERNYATA PERLU LAGI ok lesson learned jangan sotoy hihi
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);

        // how to get (verbatim)
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 3;          // 3 components per iteration soalnya 3d, ada x y z
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

        // COLOR
        gl.enableVertexAttribArray(colorAttributeLocation);

        // Bind the color buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);

        // how to get (verbatim juga)
        size = 3;                 // 3 components per iteration soalnya 3d, ada x y z
        type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
        normalize = true;         // normalize the data (convert from 0-255 to 0-1)
        stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;               // start at the beginning of the buffer
        gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);

        // bikin matriks transformasi finalnya abisitu apply
        var matrix = mat4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 800);
        
        //ubah titik tengahnya
        const ubahPivot = mat4.translation(-25, -25, -25);

        //transform
        matrix = mat4.translate(matrix, translation[0], translation[1], translation[2]);
        matrix = mat4.xRotate(matrix, rotation[0]);
        matrix = mat4.yRotate(matrix, rotation[1]);
        matrix = mat4.zRotate(matrix, rotation[2]);
        matrix = mat4.scale(matrix, scale[0], scale[1], scale[2]);
        matrix = mat4.multiply(matrix, ubahPivot);

        // "submit" matriksnya buat bener bener transformasi
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

        //gambar beneran
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        if(guambar == 0){
            var count = 6*6;//too lazy to write 36 although i just did and 6*6 takes more chars :D
        }
        else{
            var count = (6*6*4+(6*4*8));
        }
        gl.drawArrays(primitiveType, offset, count);
    }
}

// create dem shaders function
function createShader(gl, type, source){
    // create shader yang ga cuma type
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    //cek berhasil apangga
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    
    //kalo ga berhasil
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

// create the shader program, namely the vertex and fragment together
function createProgram(gl, vertexShader, fragmentShader){
    //program
    var program = gl.createProgram();

    //attach
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    //link
    gl.linkProgram(program);

    //cek sukses
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    //kalo ga berhasil
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

// matrix calculation object
// full kopas almost without diteliti bc its matrix operation and emang gitu caranya wkwk :(
var mat4 = {
    projection: function(width, height, depth) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
        ];
    },

    multiply: function(a, b) {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    translation: function(tx, ty, tz) {
        return [
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1,
        ];
    },

    xRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
        ];
    },

    yRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
        ];
    },

    zRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
        ];
    },

    scaling: function(sx, sy, sz) {
        return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
        ];
    },

    translate: function(m, tx, ty, tz) {
        return mat4.multiply(m, mat4.translation(tx, ty, tz));
    },

    xRotate: function(m, angleInRadians) {
        return mat4.multiply(m, mat4.xRotation(angleInRadians));
    },

    yRotate: function(m, angleInRadians) {
        return mat4.multiply(m, mat4.yRotation(angleInRadians));
    },

    zRotate: function(m, angleInRadians) {
        return mat4.multiply(m, mat4.zRotation(angleInRadians));
    },

    scale: function(m, sx, sy, sz) {
        return mat4.multiply(m, mat4.scaling(sx, sy, sz));
    },

};

// kyoob making hihi
function setGeometry(gl){
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // depan
            0, 0, 0,
            0, 50, 0,
            50, 0, 0,
            0, 50, 0,
            50, 50, 0,
            50, 0, 0,

            // belakang
            0, 0, 50,
            50, 0, 50,
            0, 50, 50,
            0, 50, 50,
            50, 0, 50,
            50, 50, 50,

            // kiri
            0, 0, 0,
            0, 0, 50,
            0, 50, 0,
            0, 0, 50,
            0, 50, 50,
            0, 50, 0,

            // kanan
            50, 0, 0,
            50, 50, 0,
            50, 0 ,50,
            50, 0 ,50,
            50, 50, 0,
            50, 50, 50,

            // atas
            0, 50, 0,
            0, 50, 50,
            50, 50, 0,
            50, 50, 0,
            0, 50, 50,
            50, 50, 50,

            // bawah
            0, 0, 0,
            50, 0, 0,
            0, 0, 50,
            0, 0, 50,
            50, 0, 0,
            50, 0 , 50]),
        gl.STATIC_DRAW
    );
}

function setColors(gl, threeColorMatrix, guambar){
    // buat array
    var colorArray = []
    // 36 means berapa input titik, kubus warnanya satu, ntar rencanaya kasi shading heheheh
    if(guambar == 0){
        var howMany = 12;
    }
    else{
        var howMany = (6*6*4+(6*4*8))/3;
    }
    for (var i = 0; i < 3; i++){
        for(var j = 0; j < howMany; j++){
            colorArray.push(threeColorMatrix[i][0]);
            colorArray.push(threeColorMatrix[i][1]);
            colorArray.push(threeColorMatrix[i][2]);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colorArray), gl.STATIC_DRAW);
}

function setHollow(gl){
    const hollow = [
        //2 BAR ATAS
        //BAR DEPAN
        //depan
        0, 10, 50,
        0, 0, 50,
        50, 10, 50,
        0, 0, 50,
        50, 0, 50,
        50, 10, 50,

        //belakang
        0, 10, 40,
        50, 10, 40,
        0, 0, 40,
        0, 0, 40,
        50, 10, 40,
        50, 0, 40,

        //kiri
        0, 10, 40,
        0, 0, 40,
        0, 10, 50,
        0, 0, 40,
        0, 0, 50,
        0, 10, 50,

        //kanan
        50, 0, 50,
        50, 10, 40,
        50, 10, 50,
        50, 0, 50,
        50, 0, 40,
        50, 10, 40,

        //atas
        0, 0, 50,
        0, 0, 40,
        50, 0, 50,
        0, 0, 40,
        50, 0, 40,
        50, 0, 50,

        //bawah
        0, 10, 40,
        0, 10, 50,
        50, 10, 40,
        0, 10, 50,
        50, 10, 50,
        50, 10, 40,

        //BAR BELAKANG
        //depan
        0, 10, 10,
        0, 0, 10,
        50, 10, 10,
        0, 0, 10,
        50, 0, 10,
        50, 10, 10,

        //belakang
        0, 10, 0,
        50, 10, 0,
        0, 0, 0,
        0, 0, 0,
        50, 10, 0,
        50, 0, 0,

        //kiri
        0, 10, 0,
        0, 0, 0,
        0, 10, 10,
        0, 0, 0,
        0, 0, 10,
        0, 10, 10,

        //kanan
        50, 0, 10,
        50, 10, 0,
        50, 10, 10,
        50, 0, 10,
        50, 0, 0,
        50, 10, 0,

        //atas
        0, 0, 10,
        0, 0, 0,
        50, 0, 10,
        0, 0, 0,
        50, 0, 0,
        50, 0, 10,

        //bawah
        0, 10, 0,
        0, 10, 10,
        50, 10, 0,
        0, 10, 10,
        50, 10, 10,
        50, 10, 0,

        // DUA BAR BAWAH
        // BAR DEPAN
        //depan
        0, 50, 50,
        0, 40, 50,
        50, 50, 50,
        0, 40, 50,
        50, 40, 50,
        50, 50, 50,

        //belakang
        0, 50, 40,
        50, 50, 40,
        0, 40, 40,
        0, 40, 40,
        50, 50, 40,
        50, 40, 40,

        //kiri
        0, 50, 40,
        0, 40, 40,
        0, 50, 50,
        0, 40, 40,
        0, 40, 50,
        0, 50, 50,

        //kanan
        50, 40, 50,
        50, 50, 40,
        50, 50, 50,
        50, 40, 50,
        50, 40, 40,
        50, 50, 40,

        //atas
        0, 40, 50,
        0, 40, 40,
        50, 40, 50,
        0, 40, 40,
        50, 40, 40,
        50, 40, 50,

        //bawah
        0, 50, 40,
        0, 50, 50,
        50, 50, 40,
        0, 50, 50,
        50, 50, 50,
        50, 50, 40,

        //BAR BELAKANG
        //depan
        0, 50, 10,
        0, 40, 10,
        50, 50, 10,
        0, 40, 10,
        50, 40, 10,
        50, 50, 10,

        //belakang
        0, 50, 0,
        50, 50, 0,
        0, 40, 0,
        0, 40, 0,
        50, 50, 0,
        50, 40, 0,

        //kiri
        0, 50, 0,
        0, 40, 0,
        0, 50, 10,
        0, 40, 0,
        0, 40, 10,
        0, 50, 10,

        //kanan
        50, 40, 10,
        50, 50, 0,
        50, 50, 10,
        50, 40, 10,
        50, 40, 0,
        50, 50, 0,

        //atas
        0, 40, 10,
        0, 40, 0,
        50, 40, 10,
        0, 40, 0,
        50, 40, 0,
        50, 40, 10,

        //bawah
        0, 50, 0,
        0, 50, 10,
        50, 50, 0,
        0, 50, 10,
        50, 50, 10,
        50, 50, 0,

        //DUA BAR PENDEK ATAS
        //KIRI
        // atas
        0, 0, 40,
        0, 0 ,10,
        10, 0, 10,
        0, 0, 40,
        10, 0, 10,
        10, 0, 40,

        //bawah
        0, 10, 40,
        10, 10, 10,
        0, 10 ,10,
        0, 10, 40,
        10, 10, 40,
        10, 10, 10,

        //kiri
        0, 0, 10,
        0, 10, 40,
        0, 10, 10,
        0, 10, 40,
        0, 0, 10,
        0, 0, 40,

        //kanan
        10, 0, 10,
        10, 10, 10,
        10, 10, 40,
        10, 10, 40,
        10, 0, 40,
        10, 0, 10,

        //KANAN
        // atas
        40, 0, 40,
        40, 0 ,10,
        50, 0, 10,
        40, 0, 40,
        50, 0, 10,
        50, 0, 40,

        //bawah
        40, 10, 40,
        50, 10, 10,
        40, 10 ,10,
        40, 10, 40,
        50, 10, 40,
        50, 10, 10,

        //kiri
        40, 0, 10,
        40, 10, 40,
        40, 10, 10,
        40, 10, 40,
        40, 0, 10,
        40, 0, 40,

        //kanan
        50, 0, 10,
        50, 10, 10,
        50, 10, 40,
        50, 10, 40,
        50, 0, 40,
        50, 0, 10,

        //DUA BAR PENDEK BAWAH
        //KIRI
        // atas
        0, 40, 40,
        0, 40 ,10,
        10, 40, 10,
        0, 40, 40,
        10, 40, 10,
        10, 40, 40,

        //bawah
        0, 50, 40,
        10, 50, 10,
        0, 50 ,10,
        0, 50, 40,
        10, 50, 40,
        10, 50, 10,

        //kiri
        0, 40, 10,
        0, 50, 40,
        0, 50, 10,
        0, 50, 40,
        0, 40, 10,
        0, 40, 40,

        //kanan
        10, 40, 10,
        10, 50, 10,
        10, 50, 40,
        10, 50, 40,
        10, 40, 40,
        10, 40, 10,

        //KANAN
        // atas
        40, 40, 40,
        40, 40 ,10,
        50, 40, 10,
        40, 40, 40,
        50, 40, 10,
        50, 40, 40,

        //bawah
        40, 50, 40,
        50, 50, 10,
        40, 50 ,10,
        40, 50, 40,
        50, 50, 40,
        50, 50, 10,

        //kiri
        40, 40, 10,
        40, 50, 40,
        40, 50, 10,
        40, 50, 40,
        40, 40, 10,
        40, 40, 40,

        //kanan
        50, 40, 10,
        50, 50, 10,
        50, 50, 40,
        50, 50, 40,
        50, 40, 40,
        50, 40, 10,

        //DUA PILAR DEPAN
        // PILAR KIRI
        //depan
        0, 10, 0,
        0, 40, 0,
        10, 40, 0,
        10, 40, 0,
        10, 10, 0,
        0, 10, 0,

        //belakang
        0, 10, 10,
        10, 40, 10,
        0, 40, 10,
        10, 40, 10,
        0, 10, 10,
        10, 10, 10,

        //kiri
        0, 10, 0,
        0, 40, 10,
        0, 40, 0,
        0, 40, 10,
        0, 10, 0,
        0, 10, 10,

        //kanan
        10, 10, 0,
        10, 40, 0,
        10, 40, 10,
        10, 40, 10,
        10, 10, 10,
        10, 10, 0,

        //PILAR KANAN
        //depan
        40, 10, 0,
        40, 40, 0,
        50, 40, 0,
        50, 40, 0,
        50, 10, 0,
        40, 10, 0,

        //belakang
        40, 10, 10,
        50, 40, 10,
        40, 40, 10,
        50, 40, 10,
        40, 10, 10,
        50, 10, 10,

        //kiri
        40, 10, 0,
        40, 40, 10,
        40, 40, 0,
        40, 40, 10,
        40, 10, 0,
        40, 10, 10,

        //kanan
        50, 10, 0,
        50, 40, 0,
        50, 40, 10,
        50, 40, 10,
        50, 10, 10,
        50, 10, 0,

        // DUA PILAR BELAKANG
        // PILAR KIRI
        //depan
        0, 10, 40,
        0, 40, 40,
        10, 40, 40,
        10, 40, 40,
        10, 10, 40,
        0, 10, 40,

        //belakang
        0, 10, 50,
        10, 40, 50,
        0, 40, 50,
        10, 40, 50,
        0, 10, 50,
        10, 10, 50,

        //kiri
        0, 10, 40,
        0, 40, 50,
        0, 40, 40,
        0, 40, 50,
        0, 10, 40,
        0, 10, 50,

        //kanan
        10, 10, 40,
        10, 40, 40,
        10, 40, 50,
        10, 40, 50,
        10, 10, 50,
        10, 10, 40,

        //PILAR KANAN
        //depan
        40, 10, 40,
        40, 40, 40,
        50, 40, 40,
        50, 40, 40,
        50, 10, 40,
        40, 10, 40,

        //belakang
        40, 10, 50,
        50, 40, 50,
        40, 40, 50,
        50, 40, 50,
        40, 10, 50,
        50, 10, 50,

        //kiri
        40, 10, 40,
        40, 40, 50,
        40, 40, 40,
        40, 40, 50,
        40, 10, 40,
        40, 10, 50,

        //kanan
        50, 10, 40,
        50, 40, 40,
        50, 40, 50,
        50, 40, 50,
        50, 10, 50,
        50, 10, 40
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hollow), gl.STATIC_DRAW);
}

main();