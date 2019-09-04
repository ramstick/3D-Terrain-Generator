var rows = 30;
var columns = 30;

var triangle_width = 2 / rows;

var num_points = rows * columns * 6;

var mesh_triangles = [];
var mesh_vertices = [];
var vertex_colors = [];

var shift_x = -1;
var shift_y = -1;

function generateTriangles() {

    var count = 0;

    for (var column = 0; column < columns; column++) {
        for (var row = 0; row < rows; row++) {

            var r = 0.0,
                g = 0.0,
                b = 0.0;

            switch (count % 5) {
                case 0:
                    r = 255.0;
                    break;
                case 1:
                    g = 255.0;
                    break;
                case 2:
                    b = 255.0;
                    break;
                case 3:
                    r = 255.0;
                    g = 255.0;
                    break;
                case 4:
                    b = 255.0;
                    g = 255.0;
                    break;
            }
            count++;
            var point_A = { y: row, x: column };
            var point_B = { y: row, x: column + triangle_width };
            var point_C = { y: row + triangle_width, x: column };
            var point_D = { y: row + triangle_width, x: column + triangle_width };

            mesh_vertices.push(column * triangle_width + shift_y, row * triangle_width + shift_x, 0);
            mesh_vertices.push(column * triangle_width + shift_y, row * triangle_width + triangle_width + shift_x, 0);
            mesh_vertices.push(column * triangle_width + triangle_width + shift_y, row * triangle_width + shift_x, 0);

            mesh_vertices.push(column * triangle_width + triangle_width + shift_y, row * triangle_width + triangle_width + shift_x, 0);
            mesh_vertices.push(column * triangle_width + shift_y, row * triangle_width + triangle_width + shift_x, 0);
            mesh_vertices.push(column * triangle_width + triangle_width + shift_y, row * triangle_width + shift_x, 0);

            vertex_colors.push(r, g, b, 1.0);
            vertex_colors.push(r, g, b, 1.0);
            vertex_colors.push(r, g, b, 1.0);

            var r = 0.0,
                g = 0.0,
                b = 0.0;

            switch (count % 5) {
                case 0:
                    r = 255.0;
                    break;
                case 1:
                    g = 255.0;
                    break;
                case 2:
                    b = 255.0;
                    break;
                case 3:
                    r = 255.0;
                    g = 255.0;
                    break;
                case 4:
                    b = 255.0;
                    g = 255.0;
                    break;
            }
            count++;

            vertex_colors.push(r, g, b, 1.0);
            vertex_colors.push(r, g, b, 1.0);
            vertex_colors.push(r, g, b, 1.0);
        }
    }


}


















function initBuffers(gl) {

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    /*const positions = [-1.0, -1.0, 1.0, -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0, -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0, -1.0, -1.0, -1.0, -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);*/

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh_vertices), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0, 1, -1, 0, -1, 1, 0]), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    /*const colors = [
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 0.0, 0.0, 1.0, // red
        0.0, 1.0, 0.0, 1.0, // green
        0.0, 0.0, 1.0, 1.0, // blue
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 0.0, 0.0, 1.0, // red
        0.0, 0.0, 1.0, 1.0, // blue
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 0.0, 0.0, 1.0,
    ];

    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);*/
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_colors), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([255, 0, 0, 1, 255, 0, 0, 1, 255, 0, 0, 1, 0, 255, 0, 1, 0, 255, 0, 1, 0, 255, 0, 1]), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
    };

}




var v_s_source = `

    attribute vec4 a_pos;
    attribute vec4 a_col;

    varying vec4 v_col;

    uniform mat4 modelViewMatrix;
    uniform mat4 perspectiveMatrix;

    void main(){
        gl_Position = perspectiveMatrix * modelViewMatrix * a_pos;
        v_col = a_col;
    }

`;

var f_s_source = `
    precision mediump float;

    varying vec4 v_col;

    void main(){
        gl_FragColor = v_col;
    }

`

function main() {
    var canvas = document.getElementsByTagName("canvas")[0];
    var gl = canvas.getContext("webgl");

    if (!gl) {
        alert("fuck");
        return;
    }

    var vert_shader = createShader(gl, gl.VERTEX_SHADER, v_s_source);
    var frag_shader = createShader(gl, gl.FRAGMENT_SHADER, f_s_source);

    var program = createProgram(gl, vert_shader, frag_shader)

    var program_info = {
        program: program,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(program, 'a_pos'),
            vertexColor: gl.getAttribLocation(program, 'a_col'),
        },
        uniformLocations: {
            modelViewMatrix: gl.getUniformLocation(program, 'modelViewMatrix'),
            projectionMatrix: gl.getUniformLocation(program, 'perspectiveMatrix'),
        }
    }
    generateTriangles();
    const buffers = initBuffers(gl);

    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, program_info, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}
var rot = 0;

function drawScene(gl, program_info, buffers, dt) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DATA_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);


    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -6.0]);



    mat4.rotateX(modelViewMatrix, modelViewMatrix, -Math.PI / 4);
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rot);
    rot += dt * 1;

    {
        const numComponents = 3; // pull out 2 values per iteration
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            program_info.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program_info.attribLocations.vertexPosition);
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            program_info.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program_info.attribLocations.vertexColor);
    }


    // Tell WebGL to use our program when drawing

    gl.useProgram(program_info.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        program_info.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        program_info.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = num_points;
        gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }




}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log("FUCK!");
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log("GAY ASS NIBBA!");
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}