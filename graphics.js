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

    //SHADER-PROGRAM-SECTION
    //shaders text source from GLSL
    const vertexSource = document.querySelector("#vertex-shader").text;
    const fragmentSource = document.querySelector("#fragment-shader").text;
    
    //bikin shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    //panggil program pake pre defined shaders itu tadi -- buat meng "supply" data cenah
    const program = createProgram(gl, vertexShader, fragmentShader);

    //cari tempat where the attributes at
    var positionAttributeLocation = gl.getAttribLocation(program, "position");

    //bikin buffer
    var positionBuffer = gl.createBuffer();

    //binding ke gl as a bind point
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    //INITIALIZING A SHAPE
    // 3 titik segitiganya
    var positions = [
        0, 0,
        0, 0.7,
        0.7, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    //viewport tuh kek mana yg bakal keliatan akhirnya, not necessarily seukuran canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //warna canvasnya
    gl.clearColor(0, 0.4, 0.7, 0.9);
    // actually ngewarnain
    gl.clear(gl.COLOR_BUFFER_BIT);

    // use program
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
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

main();