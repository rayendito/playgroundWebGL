main();

function main(){
    //canvas and gl making, also check kalo web kompatibel sama webgl apangga
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Browser mnh tida support WebGL ;(");
        return;
    }

    //SHADER-PROGRAM-SECTION
    //shaders text source
    const vertexSource = document.querySelector("#vertex-shader");
    const fragmentSource = document.querySelector("#fragment-shader");
    
    //bikin shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderSource);

    //panggil program pake pre defined shaders itu tadi -- buat meng "supply" data cenah
    const program = createProgram(gl, vertexShader, fragmentShader);

    //cari tempat where the attributes at
    var positionAttributeLocation = gl.getAttribLocation(program, "position");

    //bikin buffer
    var positionBuffer = gl.createBuffer();

    //binding ke gl as a bind point
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    //INITIALIZING A SHAPE
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array(positions), gl.STATIC_DRAW)

    // positioning heheh
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.5, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
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
function shaderProgram(gl, vertexShader, freagmentShader){
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


window.onload = main;