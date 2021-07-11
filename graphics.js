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
    
    //cari tempat where the attributes and uniforms at
    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    const matrixUniformLocation = gl.getUniformLocation(program, "matriks");

    // TO-BE-DRAWN-PROPERTIES
    // [1] bikin buffer
    var positionBuffer = gl.createBuffer();
    // [2] positionBuffer di-bind ke gl pake bindBuffer
    // notice gl.ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    // INITIALIZING A SHAPE (now pake yang fungsi setGeometry yg udah dibuat)
    setGeometry(gl);


    // TRANSFORMATION-PROPERTIES
    // utility functions
    function radToDeg(r){
        return r*180/Math.PI;
    }

    function degToRad(d){
        return d*Math.PI/180;
    }

    // Transformations
    const translation = [70, 100, 0];
    const rotation = [degToRad(40), degToRad(25), degToRad(325)];
    const scale = [1, 1, 1];

    drawCube();

    // draw cube function
    function drawCube(){
        //CANVAS-PROPERTIES
        // viewport tuh kek mana yg bakal keliatan akhirnya, not necessarily seukuran canvas
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // warna canvasnya
        gl.clearColor(0, 0.4, 0.7, 0.9);
        // actually ngewarnain
        gl.clear(gl.COLOR_BUFFER_BIT);

        // use program
        gl.useProgram(program);

        // semacam kaya nyiapin "wadah" program shadernya
        // note that ini maksudnya gl : *enables vertex atrtib array* that is positionAttributeLocation,
        // yang udah disediain tadi
        gl.enableVertexAttribArray(positionAttributeLocation);

        // kalo dari sumber, ini dipanggil lagi, but somehow it  still runs lmao keknya emang gaperlu
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // bawah ini verbatim
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 3;          // 3 components per iteration soalnya 3d, ada x y z
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

        // bikin matriks transformasi finalnya abisitu apply
        var matrix = mat4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 200);
        matrix = mat4.translate(matrix, translation[0], translation[1], translation[2]);
        matrix = mat4.xRotate(matrix, rotation[0]);
        matrix = mat4.yRotate(matrix, rotation[1]);
        matrix = mat4.zRotate(matrix, rotation[2]);
        matrix = mat4.scale(matrix, scale[0], scale[1], scale[2]);

        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);


        //gambar beneran
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 36; //too lazy to write 36 although i just did and 6*6 takes more chars :D
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
            50, 0, 0,
            0, 50, 0,
            0, 50, 0,
            50, 0, 0,
            50, 50, 0,

            // kiri
            0, 0, 0,
            0, 50, 0,
            0, 0, 50,
            0, 0, 50,
            0, 50, 0,
            0, 50, 50,

            // kanan
            50, 0, 0,
            50, 50, 0,
            50, 0 ,50,
            50, 0 ,50,
            50, 50, 0,
            50, 50, 50,

            // belakang
            0, 0, 50,
            50, 0, 50,
            0, 50, 50,
            0, 50, 50,
            50, 0, 50,
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

main();