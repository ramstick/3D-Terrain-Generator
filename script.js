var rows = 800;
var columns = 800;

var map_width = 3200;
var map_height = 3200;

var triangle_width = map_width / rows;

var num_points = rows * columns * 6;

var vertex_normals = [];
var mesh_vertices = [];
var vertex_colors = [];

var shift_x = -map_width / 2;
var shift_y = -map_height / 2;

var terrain_map = new Array(rows + 1);

var sea_level = 0.3;

var lacunarity = 2;
var persistance = 0.1;
var octave = 20;
var scale = 0.024;
var amplitude = 1.5;

var regions = [0.7, 1, 1.3, 1.5, 2.2, 100000000000];
var region_colors = [{ r: 0, g: 0, b: 1, a: 1 }, { r: 0.96, g: 0.86, b: 0.32, a: 1 }, { r: 0, g: 1, b: 0, a: 1 }, { r: 0.09, g: 0.43, b: 0.08, a: 1 }, { r: 0.74, g: 0.74, b: 0.74, a: 1 }, { r: 1, g: 1, b: 1, a: 1 }];


var multiplier = 300;

function region_multiplier_curve(x) {
    if (x < 0.5) {
        return 0;
    } else if (x <= 1) {
        return (1 / 20) * (x - 0.5);
    } else if (x <= 1.5) {
        return (1 / 30) * (x - 1) + 0.025;
    } else {
        return (1 / 5) * (x - (13 / 9)) ** 2 + 0.0386;
    }
}


function cross_product(v1, v2) {

    return {
        x: (v1.y * v2.z) - (v1.z * v2.y),
        y: (v1.z * v2.x) - (v1.x * v2.z),
        z: (v1.x * v2.y) - (v1.y * v2.x),
    }

}

function normalize_vector(v) {

    var l = Math.sqrt((v.x) ** 2 + (v.y) ** 2 + (v.z) ** 2);

    return {
        x: v.x / l,
        y: v.y / l,
        z: v.z / l,
    }

}

function generateTriangles() {


    for (var column = 0; column < columns; column++) {
        for (var row = 0; row < rows; row++) {


            var point_A = { x: column * triangle_width + shift_x, y: row * triangle_width + shift_y, z: terrain_map[row][column] };
            var point_B = { x: column * triangle_width + shift_x + triangle_width, y: row * triangle_width + shift_y, z: terrain_map[row][column + 1] };
            var point_C = { x: column * triangle_width + shift_x, y: row * triangle_width + shift_y + triangle_width, z: terrain_map[row + 1][column] };
            var point_D = { x: column * triangle_width + shift_x + triangle_width, y: row * triangle_width + shift_y + triangle_width, z: terrain_map[row + 1][column + 1] };




            for (var r = 0; r < regions.length; r++) {
                if (point_A.z <= regions[r]) {
                    point_A.region = r
                    break;
                }
            }
            for (var r = 0; r < regions.length; r++) {
                if (point_B.z <= regions[r]) {
                    point_B.region = r
                    break;
                }
            }
            for (var r = 0; r < regions.length; r++) {
                if (point_C.z <= regions[r]) {
                    point_C.region = r
                    break;
                }
            }
            for (var r = 0; r < regions.length; r++) {
                if (point_D.z <= regions[r]) {
                    point_D.region = r
                    break;
                }
            }

            var avg = (point_A.z + point_B.z + point_C.z + point_D.z) / 4;
            var r = 0;
            for (var i = 0; i < regions.length; i++) {
                if (avg <= regions[i]) {
                    r = i;
                    break;
                }
            }

            var t = region_colors[r];
            vertex_colors.push(t.r, t.g, t.b, t.a);
            vertex_colors.push(t.r, t.g, t.b, t.a);
            vertex_colors.push(t.r, t.g, t.b, t.a);
            vertex_colors.push(t.r, t.g, t.b, t.a);
            vertex_colors.push(t.r, t.g, t.b, t.a);
            vertex_colors.push(t.r, t.g, t.b, t.a);


            point_A.z *= region_multiplier_curve(point_A.z) * multiplier;
            point_B.z *= region_multiplier_curve(point_B.z) * multiplier;
            point_C.z *= region_multiplier_curve(point_C.z) * multiplier;
            point_D.z *= region_multiplier_curve(point_D.z) * multiplier;


            var vector_A_B = { x: point_B.x - point_A.x, y: point_B.y - point_A.y, z: point_B.z - point_A.z };
            var vector_A_C = { x: point_C.x - point_A.x, y: point_C.y - point_A.y, z: point_C.z - point_A.z };

            var triangle_1_NORMAL = normalize_vector(cross_product(vector_A_B, vector_A_C));

            var vector_D_B = { x: point_B.x - point_D.x, y: point_B.y - point_D.y, z: point_B.z - point_D.z };
            var vector_D_C = { x: point_C.x - point_D.x, y: point_C.y - point_D.y, z: point_C.z - point_D.z };

            var triangle_2_NORMAL = normalize_vector(cross_product(vector_D_C, vector_D_B));




            // Triangle 1
            mesh_vertices.push(point_A.x, point_A.y, point_A.z);
            mesh_vertices.push(point_B.x, point_B.y, point_B.z);
            mesh_vertices.push(point_C.x, point_C.y, point_C.z);

            // Normal 1
            vertex_normals.push(triangle_1_NORMAL.x, triangle_1_NORMAL.y, triangle_1_NORMAL.z);
            vertex_normals.push(triangle_1_NORMAL.x, triangle_1_NORMAL.y, triangle_1_NORMAL.z);
            vertex_normals.push(triangle_1_NORMAL.x, triangle_1_NORMAL.y, triangle_1_NORMAL.z);

            // Triangle 2
            mesh_vertices.push(point_D.x, point_D.y, point_D.z);
            mesh_vertices.push(point_B.x, point_B.y, point_B.z);
            mesh_vertices.push(point_C.x, point_C.y, point_C.z);

            // Normal 2
            vertex_normals.push(triangle_2_NORMAL.x, triangle_2_NORMAL.y, triangle_2_NORMAL.z);
            vertex_normals.push(triangle_2_NORMAL.x, triangle_2_NORMAL.y, triangle_2_NORMAL.z);
            vertex_normals.push(triangle_2_NORMAL.x, triangle_2_NORMAL.y, triangle_2_NORMAL.z);


        }
    }


}


function generateTerrain() {

    for (var i = 0; i < terrain_map.length; i++) {

        terrain_map[i] = new Array(columns + 1);
    }

    var simplex;
    var offsets = new Array();

    for (var row = 0; row < terrain_map.length; row++) {
        for (var column = 0; column < terrain_map[row].length; column++) {

            terrain_map[row][column] = 0;

        }
    }

    for (var i = 0; i < octave; i++) {
        offsets.push({ x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 });
    }

    var l = 1;
    var p = 1;

    for (var curr_octave = 0; curr_octave < octave; curr_octave++) {
        simplex = new SimplexNoise();

        for (var row = 0; row < terrain_map.length; row++) {
            for (var column = 0; column < terrain_map[row].length; column++) {

                terrain_map[row][column] += (simplex.noise2D((column / l + offsets[curr_octave].x) * scale, (row / l + offsets[curr_octave].y) * scale) + 0.5) * p * amplitude;

            }
        }
        l *= lacunarity;
        p *= persistance;
    }

    console.log(terrain_map);

}















function initBuffers(gl) {

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh_vertices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_colors), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_normals), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
    };

}




var v_s_source = `

    attribute vec4 a_pos;
    attribute vec4 a_col;
    attribute vec4 a_nor;

    varying vec4 v_col;
    varying vec3 lighting;

    uniform mat4 modelViewMatrix;
    uniform mat4 perspectiveMatrix;
    uniform vec4 directional_light;
    uniform mat4 normalMatrix;

    void main(){
        gl_Position = perspectiveMatrix * modelViewMatrix * a_pos;
        v_col = a_col;


        highp vec4 transformedNormal = normalMatrix * vec4(a_nor.xyz, 1.0);

        highp vec3 color = vec3(1.0,1.0,1.0);

        highp float directional = max(dot(transformedNormal.xyz, directional_light.xyz), 0.2);
        lighting = color * directional + 0.3;
        //lighting = a_nor.x + a_nor.y + a_nor.z;
    }

`;

var f_s_source = `
    precision mediump float;

    varying vec4 v_col;
    varying vec3 lighting;

    void main(){
        gl_FragColor = v_col* vec4( lighting, 1.0);
    }

`

function main() {


    loadRegionEditor();

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
            vertexNormal: gl.getAttribLocation(program, 'a_nor'),
        },
        uniformLocations: {
            modelViewMatrix: gl.getUniformLocation(program, 'modelViewMatrix'),
            projectionMatrix: gl.getUniformLocation(program, 'perspectiveMatrix'),
            lightingVector: gl.getUniformLocation(program, 'directional_light'),
            normalMatrix: gl.getUniformLocation(program, 'normalMatrix'),
        }
    }
    generateTerrain();
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
    gl.clearColor(0.65, 0.96, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DATA_BUFFER_BIT);

    const fieldOfView = 90 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.79;
    const zFar = 10000.0;
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
        [-0.0, 0.0, -300.0]);



    mat4.rotateX(modelViewMatrix, modelViewMatrix, -60 * Math.PI / 180);
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rot);
    rot += dt * 1;

    const lightingVector = vec4.fromValues(Math.sqrt(3) / 2, 1 / 2, 0, 0);

    vec4.scale(lightingVector, lightingVector, 1);

    const normal_matrix = mat4.create();
    mat4.invert(normal_matrix, modelViewMatrix);
    mat4.transpose(normal_matrix, normal_matrix);

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

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            program_info.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program_info.attribLocations.vertexNormal);
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
    gl.uniform4fv(
        program_info.uniformLocations.lightingVector,
        lightingVector,
    );
    gl.uniformMatrix4fv(
        program_info.uniformLocations.normalMatrix,
        false,
        normal_matrix,
    )

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














function loadRegionEditor() {

    var reg_editor = document.getElementById("region-editor");

    for (var reg = 0; reg < regions.length; reg++) {

        var li = document.createElement("LI");
        li.innerHTML = regions[reg];
        li.classList.add("region-item")
        reg_editor.appendChild(li);

    }
}