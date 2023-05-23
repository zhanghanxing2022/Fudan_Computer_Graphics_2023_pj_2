
//画布的大小
var canvasSize = {"maxX": 700, "maxY": 700};

//数组中每个元素表示一个点的坐标[x,y,z]，这里一共有9个点
var vertex_pos = [
    [350, 100, 0],
    [420, 280, 0],
    [600, 350, 0],
    [280, 280, 0],
    [350, 350, 0],
    [420, 420, 0],
    [100, 350, 0],
    [280, 420, 0],
    [350, 600, 0]
];

//顶点颜色数组，保存了上面顶点数组中每个顶点颜色信息[r,g,b]
var vertex_color = [
    [165, 0, 165],
    [255, 0, 0],
    [255, 145, 0],
    [56, 20, 175],
    [255, 255, 255],
    [255, 211, 0],
    [17, 63, 170],
    [0, 204, 0],
    [204, 244, 0]
];

//   var vertex_color = [
//     [165, 0, 165],
//     [255, 0, 165],
//     [255, 145, 165],
//     [56, 140, 175],
//     [155, 255, 185],
//     [255, 211, 0],
//     [17, 213, 10],
//     [170, 204, 40],
//     [204, 244, 0]
// ];

//四边形数组，数组中每个元素表示一个四边形，其中的四个数字是四边形四个顶点的index，例如vertex[polygon[2][1]]表示第三个多边形的第2个顶点的坐标
var polygon = [
    [4, 5, 8, 7],
    [0, 1, 4, 3],
    [1, 2, 5, 4],
    [3, 4, 7, 6]
];
var triangle = [
    [4,3,0],
    [4,1,0],
    [4,1,5],
    [4,8,5],
    [4,8,7],
    [4,3,7],
    [1,5,2],
    [3,7,6]
]
var triangleQuene = [0,1,2,3,4,5,6,7];
function square(x)
{
    return x*x;
}
function chooseDragPoint(X,Y,modelMatrix)//根据鼠标位置选择拖动的点
{
    let distance=-1;
    let chosen = -1;
    modelMatrix.invert();
    
    let temp= new Vector3([X-canvasSize['maxX']/2,canvasSize['maxY']/2-Y,0]);
    temp = modelMatrix.multiplyVector3(temp);
    const mouseX = temp.elements[0]+canvasSize['maxX']/2;
    const mouseY = canvasSize['maxY']/2-temp.elements[1];
    for(let i = 0;i<vertex_pos.length;i++)
    {
        dist =square(vertex_pos[i][0]-mouseX)+square(vertex_pos[i][1]-mouseY);
        if(distance<0|| distance>dist)
        {
            distance = dist;
            chosen = i;
        }
    }
    modelMatrix.invert();
    if(distance>=5000)//如果距离所有点都很远，那么拖动失败
       
    chosen=-1;
    //更改多边形的绘制优先级
    let new_arr=[];
    let old_arr =[];
    triangleQuene.forEach((item)=>{
        if(triangle[item].indexOf(chosen)>=0)
        {
            new_arr.push(item);
        }else
        {
            old_arr.push(item);
        }
    })
    triangleQuene = old_arr.concat(new_arr);
    //加上偏移量，防止被选中的点闪现。
    if(chosen==-1)
    {
        return [-1,0,0];
    }
    return [chosen,0,0];

    // return [chosen,vertex_pos[chosen][0]-mouseX,vertex_pos[chosen][1]-mouseY];
    
}
//更新选中的点的位置。
function updateVertexPos(order,mouseX,mouseY,modelMatrix)
{
    modelMatrix.invert();
    if(order[0]>=0)
    {
        
        let temp= new Vector3([mouseX-canvasSize['maxX']/2,canvasSize['maxY']/2-mouseY,0]);
        temp = modelMatrix.multiplyVector3(temp);
        const x = temp.elements[0]+canvasSize['maxX']/2;
        const y = canvasSize['maxY']/2-temp.elements[1];
        //加上边界值，防止点被拖动到画布之外。
        // vertex_pos[order[0]] = [ Math.min( Math.max(0, x+order[1]),canvasSize['maxX']),
        // Math.min(canvasSize.maxY, Math.max(y+order[2],0)),0];
        vertex_pos[order[0]] = [  x+order[1],y+order[2],0];
        
    }
    modelMatrix.invert();
}
var VSHADER_SOURCE1 =
'void main(){gl_Position = vec4(0.0,0.0,0.0,1.0);gl_PointSize = 5.0;}';
var VSHADER_SOURCE2 = 
'attribute vec4 a_Position; '+
'attribute vec4 a_Color;\n' +
'varying vec4 v_Color;\n' +
'uniform mat4 u_ModelMatrix;'+
'void main(){'+
'   gl_Position = u_ModelMatrix *a_Position;'+
'   v_Color = a_Color;\n' +
'}';
var FSHADER_SOURCE = 
'void main(){gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);}';
var FSHADER_SOURCE2 = 
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
function union(arr1,arr2)
{
    return arr1.filter(x=> arr2.indexOf(x)!==-1);
}
function swap(arr,i,j)
{
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
function main()
{
    var canvas = document.getElementById('WebGl');
    var chosen = [-1,-1,-1];
    
    canvas.width = canvasSize['maxX'];
    canvas.height = canvasSize['maxY'];
    var gl = getWebGLContext(canvas);
    if(!gl)
    {
        console.log('Failed ');
        return;
    }
    if(!initShaders(gl,VSHADER_SOURCE2,FSHADER_SOURCE2))
    {
        console.log("Failed");
        return;
    }
   
    rsmt = new RotatingScaleMutiTriangle(gl);
    rsmt.draw();
    var rotation = false;
    var go = false;
    var tick = function() {

        if(go) rsmt.animate();
        else rsmt.draw();
        rsmt.draw();
        if(rotation)
        requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
        else
        rsmt.draw();
    };
    let onkeydown = (ev)=>
    {
      switch (ev.key) {
        case 't':
            if(rotation=false)
                go = true;
            else
                go = !go;
            rotation = true;
            if(go==true)
            {
                rsmt.begin();
            }
            tick();
            break;
        case 'b':
            rsmt.enableLine();
            rsmt.draw();
            break;
        case 'e':
            rotation = false;
            go = false;
            rsmt.reset();
            tick();
            break;
      }
    }
    window.addEventListener("keydown",onkeydown);

    canvas.onmousedown=function(event)
    {
        if(!go){

            chosen = chooseDragPoint(event.pageX,event.pageY,rsmt.modelMatrix,rsmt.scale);
            updateVertexPos(chosen,event.pageX,event.pageY,rsmt.modelMatrix,rsmt.scale);
            rsmt.draw();
        }
        
    }
    canvas.onmousemove = function(event)
    {
        if(!go)
        {
            updateVertexPos(chosen,event.pageX,event.pageY,rsmt.modelMatrix,rsmt.scale);
            rsmt.draw();
        }
        
    }
    canvas.onmouseup=function()
    {
        chosen =[ -1,0,0];
    }
    //鼠标移出清除选中
    canvas.onmouseout = function()
    {
        chosen=[-1,0,0];
    }
}

class RotatingScaleMutiTriangle
{
    constructor(gl)
    {
        this.gl = gl;
        this.ANGLE_STEP = 45.0;
        this.SCALE_STEP = 0.2;
        this.SCALE_MIN = 0.2;
        this.ZOOM = false;
        this.g_last = Date.now();
        this.modelMatrix = new Matrix4();
        console.log(this.modelMatrix);
        this.modelMatrix.setIdentity();
        this.nLine = 0;
        this.nTriangle = 0;
        this.n = 0;
        this.angle = 0.0;
        this.scale = 1.0;
        this.drawLine = false;
        this.LineOrder = [];
        this.TriangleOrder = [];
        this.TriangleOrder = [4,3,0,4,1,0,4,1,5,4,8,5,4,8,7,4,3,7,1,5,2,3,7,6];
        this.LineOrder =[7,3,6,7,8,5,2,1,5,4,1,0,3,4,7,8,4,0];
        this.nTriangle = this.TriangleOrder.length;
        this.nLine = this.LineOrder.length;
        this.enableline = true;
        this.u_ModelMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ModelMatrix');
        if (!this.u_ModelMatrix) { 
            console.log('Failed to get the storage location of u_ModelMatrix');
            return -1;
        }
        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        if (this.a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        this.a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        if(this.a_Color < 0) {
            console.log('Failed to get the storage location of a_Color');
            return -1;
        }
    }
    enableLine()
    {
        this.enableline = !this.enableline; 
    }
    begin()
    {
        //从暂停中回复动画
        this.g_last = Date.now();
    }
    reset()
    {
        //重新开始动画
        this.modelMatrix.setIdentity();
        this.g_last = Date.now();
        this.angle = 0.0;
        this.scale = 1.0;
    }
    updatePoint(drawLine)
    {
        var vertexBuffer = this.gl.createBuffer();
        
        const newVertex= vertex_pos.map(ele=>[(ele[0]/canvasSize['maxX'])*2-1,1-(ele[1]/canvasSize['maxY'])*2]);
        const vertex_ordered = [];
        if(~drawLine)
        {
            this.TriangleOrder=[];
            for(let i = 0; i < triangleQuene.length;i++)
            {
                this.TriangleOrder.push( triangle[ triangleQuene[i]]);
            }
            this.TriangleOrder=this.TriangleOrder.flat(Infinity);
        }
        this.order = drawLine?this.LineOrder:this.TriangleOrder;
        for(let k = 0; k < this.order.length;k++)
        {
            // Vertex coordinates and color
            vertex_ordered.push(newVertex[this.order[k]]);
            if(drawLine)
            {
                vertex_ordered.push([1.0,0.0,0.0]);
            }else
            vertex_ordered.push(vertex_color[this.order[k]].map((ele)=>ele/255));
        }

        var vertices = new Float32Array(vertex_ordered.flat(Infinity));
        
        // Pass the rotation matrix to the vertex shader
        this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        var FSIZE = vertices.BYTES_PER_ELEMENT;
        this.gl.vertexAttribPointer(this.a_Position, 2, this.gl.FLOAT, false, FSIZE * 5, 0);
        this.gl.enableVertexAttribArray(this.a_Position);
        this.gl.vertexAttribPointer(this.a_Color, 3,this.gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
        this.gl.enableVertexAttribArray(this.a_Color);  // Enable the assignment of the buffer object

        // Unbind the buffer object
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    }
    animate() {
        // Calculate the elapsed time
        var now = Date.now();
        var elapsed = now - this.g_last;
        console.log(JSON.stringify(elapsed));
        this.g_last = now;
        // Update the current rotation angle (adjusted by the elapsed time)
        this.angle = this.angle + (this.ANGLE_STEP * elapsed) / 1000.0;
        this.angle %=360;
        if(this.scale<=this.SCALE_MIN)
        {
            this.ZOOM = true;
        }else if(this.scale>=1)
        {
            this.ZOOM = false;
        }
        this.scale = this.scale+(this.ZOOM?  this.SCALE_STEP:-this.SCALE_STEP)*elapsed / 1000.0;
        if(this.scale>1)
        {
            this.scale = 1;
        }else if(this.scale <=this.SCALE_MIN)
        {
            this.scale = this.SCALE_MIN;
        }
        
    }
    draw()
    {
        // Set the rotation matrix
        this.updatePoint(false);
        this.modelMatrix.setRotate(this.angle, 0, 0, 1);
        this.modelMatrix.scale(this.scale, this.scale, this.scale);
        
        // Pass the rotation matrix to the vertex shader
        this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear <canvas>
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        

        // Draw the rectangle
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.nTriangle);
        if(this.enableline)
        {
            this.updatePoint(true);
            this.gl.drawArrays(this.gl.LINE_STRIP,0,this.nLine);

        }
    }
}