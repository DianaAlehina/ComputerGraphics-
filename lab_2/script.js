const shift = 3;
let cubeRotation = 0.0;
let allRotate=0;
let rotateMatrix =
    [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];


window.onload = function main() {
    // Получаем канвас из html
    const canvas = document.querySelector('#glcanvas');
    // Получаем контекст webgl2
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Обработка ошибок
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
    // Исходный код вершинного шейдера
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
    `;

    // Исходный код фрагментного шейдера
    const fsSource = `
    varying lowp vec4 vColor;
    
    void main(void) {
      gl_FragColor = vColor;
    }
    `;
    // Создаём шейдерную программу
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    // Для удобства создадим объект с информацией о программе
    const programInfo = {
        // Сама программа
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        // Расположение параметров-аттрибутов в шейдере
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        }
    };
    // Инициализируем буфер
    const buffers = initBuffers(gl);

    let then = 0;
    function clier(){
        rotateMatrix.forEach(element => {
            element[1]=0
        });
    }

    function render(now) {
        now *= 0.0005;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        window.onkeydown = (e) => {
            switch(e.code){
                case 'Digit1':
                    rotateMatrix.forEach(element => {
                        element[1]=1
                    });
                    allRotate=0;
                    break;

                case 'Digit2':
                    clier();
                    allRotate=1;
                    break;

                case 'Digit3':
                    clier();
                    allRotate=2;
                    break;

            }
        }
        drawScene(gl, programInfo, buffers, deltaTime, rotateMatrix, allRotate);
        // указывает браузеру на то, что вы хотите произвести анимацию, и просит его запланировать перерисовку
        // на следующем кадре анимации. В качестве параметра метод получает функцию,
        // которая будет вызвана перед перерисовкой.
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function initColorBuffer(gl, color){
    const countColors = 6;
    var colors = [];
    for (var j = 0; j < countColors; ++j) {
        const c = color;
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        indices: indexBuffer,
    };
}

function drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix, translateList, rotateList, c, allRotate, color){

    const modelViewMatrix = mat4.create();
    //Перевод mat4 по заданному вектору()
    mat4.translate(modelViewMatrix,
        modelViewMatrix,
        translateList);

    if (allRotate === 0) {
        //Поворачивает mat4 под заданным углом вокруг заданной оси(матрица, матрица, угол, ось)
        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            cubeRotation,
            rotateList);
    }

    if(allRotate === 1){

        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [c[0] - translateList[0], c[1] - translateList[1], c[2] - translateList[2]]);

        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            cubeRotation,
            [0,1,0]);

        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [translateList[0] - c[0], translateList[1] - c[1], translateList[2] - c[2]]);
    }

    if(allRotate === 2){

        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [c[0] - translateList[0]+ shift, c[1] - translateList[1], c[2] - translateList[2]+shift]);


        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            cubeRotation,
            [0,1,0]);

        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [translateList[0] - c[0]+shift, translateList[1] - c[1], translateList[2] - c[2]+shift]);
    }

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, initColorBuffer(gl, color));//buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    cubeRotation += deltaTime;
}

function drawScene(gl, programInfo, buffers, deltaTime, rotateMatrix, allRotate) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    const zOffset = -20;
    const yOffset = -1.0;
    const xOffset = 0;
    const side = 2;
    const space = 1.5;
    const center = [xOffset, yOffset, zOffset];

    //midTop
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix,
        translateList=[xOffset, yOffset+side+space, zOffset],
        rotateList=rotateMatrix[0], c=center, allRotate, color=[1.0, 1.0, 0.0, 1]);

    //left
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix,
        translateList=[-(xOffset + side + space), yOffset, zOffset],
        rotateList=rotateMatrix[2], c=center, allRotate, color=[1.0, 0.0, 0.0, 1]);

    //midBotton
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix,
        translateList=center,
        rotateList=rotateMatrix[1], c=center, allRotate, color=[0.0, 1.0, 0.0, 1]);

    //right
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix,
        translateList=[xOffset + side + space, yOffset, zOffset],
        rotateList=rotateMatrix[3], c=center, allRotate, color=[0.0, 0.0, 1.0, 1]);
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}